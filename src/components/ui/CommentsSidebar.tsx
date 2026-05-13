import React, { useState, useEffect } from 'react';
import { X, MessageSquare, CheckCircle2, Send } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  note_id: string;
  user_id: string;
  text: string;
  resolved: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface Reply {
  id: string;
  comment_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface CommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  noteId?: string;
  activeCommentId?: string | null;
  onCommentResolved: (id: string) => void;
}

export default function CommentsSidebar({
  isOpen,
  onClose,
  noteId,
  activeCommentId,
  onCommentResolved
}: CommentsSidebarProps) {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (isOpen && noteId) {
      fetchComments();
    }
  }, [isOpen, noteId]);

  const fetchComments = async () => {
    if (!noteId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('note_comments')
        .select('*, profiles(full_name, avatar_url)')
        .eq('note_id', noteId)
        .eq('resolved', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);

      // Fetch replies for these comments
      if (data && data.length > 0) {
        const commentIds = data.map(c => c.id);
        const { data: replyData, error: replyError } = await supabase
          .from('note_comment_replies')
          .select('*, profiles(full_name, avatar_url)')
          .in('comment_id', commentIds)
          .order('created_at', { ascending: true });

        if (!replyError && replyData) {
          const repliesMap: Record<string, Reply[]> = {};
          replyData.forEach(reply => {
            if (!repliesMap[reply.comment_id]) repliesMap[reply.comment_id] = [];
            repliesMap[reply.comment_id].push(reply);
          });
          setReplies(repliesMap);
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('note_comments')
        .update({ resolved: true })
        .eq('id', commentId);

      if (error) throw error;
      
      setComments(comments.filter(c => c.id !== commentId));
      onCommentResolved(commentId);
      toast.success('Comment resolved');
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast.error('Failed to resolve comment');
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim() || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('note_comment_replies')
        .insert([{
          comment_id: commentId,
          user_id: user.id,
          text: replyText.trim()
        }])
        .select('*, profiles(full_name, avatar_url)')
        .single();

      if (error) throw error;

      setReplies(prev => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), data]
      }));
      setReplyText('');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`w-80 border-l ${themeClasses.cardBorder} ${themeClasses.background} h-full flex flex-col shadow-lg z-40 transition-transform transform translate-x-0`}>
      <div className={`p-4 border-b ${themeClasses.cardBorder} flex justify-between items-center`}>
        <h2 className={`font-semibold flex items-center gap-2 ${themeClasses.primaryText}`}>
          <MessageSquare size={18} />
          Comments
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!noteId ? (
          <div className="text-center text-sm text-gray-500 mt-10">
            Please save the document first to add comments.
          </div>
        ) : loading ? (
          <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-sm text-gray-500 mt-10">
            No active comments. Highlight text and click the comment icon to add one.
          </div>
        ) : (
          comments.map(comment => (
            <div 
              key={comment.id} 
              className={`rounded-lg border p-3 ${activeCommentId === comment.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : themeClasses.cardBorder + ' ' + themeClasses.cardBackground}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                    {comment.profiles?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${themeClasses.primaryText}`}>{comment.profiles?.full_name || 'User'}</div>
                    <div className="text-[10px] text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <button 
                  onClick={() => handleResolve(comment.id)}
                  className="text-gray-400 hover:text-green-600 transition-colors"
                  title="Mark as resolved"
                >
                  <CheckCircle2 size={16} />
                </button>
              </div>
              
              <p className={`text-sm mb-3 ${themeClasses.primaryText}`}>{comment.text}</p>
              
              {/* Replies */}
              {replies[comment.id] && replies[comment.id].length > 0 && (
                <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3 mb-3">
                  {replies[comment.id].map(reply => (
                    <div key={reply.id}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-xs font-medium ${themeClasses.primaryText}`}>{reply.profiles?.full_name || 'User'}</span>
                        <span className="text-[10px] text-gray-500">{new Date(reply.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className={`text-xs ${themeClasses.primaryText}`}>{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Reply */}
              <div className="flex gap-2 mt-2">
                <input 
                  type="text" 
                  placeholder="Reply..." 
                  value={activeCommentId === comment.id ? replyText : ''}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={() => {
                    // Only allow typing in one reply box at a time for simplicity in this MVP
                    if (activeCommentId !== comment.id) {
                      setReplyText('');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleReply(comment.id);
                  }}
                  className={`flex-1 text-xs px-2 py-1.5 rounded border ${themeClasses.primaryBorder} ${themeClasses.cardBackground} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                <button 
                  onClick={() => handleReply(comment.id)}
                  disabled={!replyText.trim() || activeCommentId !== comment.id}
                  className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
