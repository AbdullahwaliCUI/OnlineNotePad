'use client';

import { useState } from 'react';
import { VaultItem } from '@/types/vault';
import { Copy, Eye, EyeOff, ExternalLink, Edit, Trash2, Key, Link2, FileText, Settings, Folder } from 'lucide-react';
import toast from 'react-hot-toast';

interface VaultItemCardProps {
  item: VaultItem;
  onEdit: (item: VaultItem) => void;
  onDelete: (id: string) => void;
}

export default function VaultItemCard({ item, onEdit, onDelete }: VaultItemCardProps) {
  const [showPasswords, setShowPasswords] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const getIcon = () => {
    switch (item.item_type) {
      case 'Password': return <Key size={18} className="text-blue-500" />;
      case 'Link': return <Link2 size={18} className="text-green-500" />;
      case 'Note': return <FileText size={18} className="text-yellow-500" />;
      case 'API Key': return <Settings size={18} className="text-purple-500" />;
      default: return <Folder size={18} className="text-gray-500" />;
    }
  };

  // Determine which entries to show (handle legacy fallback if entries is empty but old fields exist)
  const entries = item.entries && item.entries.length > 0 
    ? item.entries 
    : (item.username || item.password || item.url) ? [{
        id: 'legacy',
        productName: item.username || 'Default',
        password: item.password || '',
        url: item.url || '',
        note: ''
      }] : [];

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-gray-50 rounded-lg border border-gray-100">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            <span className="text-xs font-medium text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
              {item.item_type || 'Password'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(item)}
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this item?')) {
                onDelete(item.id);
              }
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 space-y-3 mt-2">
        {entries.map((entry, index) => (
          <div key={entry.id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            {/* Entry Header: Product Name & URL */}
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm text-gray-800">{entry.productName}</span>
              {entry.url && (
                <a 
                  href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded"
                  title="Visit URL"
                >
                  Visit <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Password / API Key Row */}
            {entry.password && (
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded p-2 mt-1">
                <span className="font-mono text-sm tracking-widest text-gray-800 truncate flex-1">
                  {showPasswords ? entry.password : '••••••••••••'}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0 border-l border-gray-100 pl-2 ml-2">
                  <button 
                    onClick={() => copyToClipboard(entry.password!, 'Copied!')}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-gray-50"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Individual Entry Note */}
            {entry.note && (
              <p className="mt-2 text-xs text-gray-500 italic">
                {entry.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer Area */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        {/* Main Note */}
        <div className="flex-1">
          {item.notes ? (
            <p className="text-xs text-gray-600 bg-yellow-50/50 p-2 rounded border border-yellow-100/50 line-clamp-2" title={item.notes}>
              {item.notes}
            </p>
          ) : (
            <span className="text-xs text-gray-400">No general note</span>
          )}
        </div>

        {/* Global Show Password Toggle */}
        {(item.item_type === 'Password' || item.item_type === 'API Key') && entries.some(e => e.password) && (
          <button 
            onClick={() => setShowPasswords(!showPasswords)}
            className="ml-3 p-1.5 text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 flex-shrink-0"
            title={showPasswords ? "Hide all passwords" : "Show all passwords"}
          >
            {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
