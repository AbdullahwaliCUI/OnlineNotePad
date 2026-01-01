'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Undo,
    Heading1,
    Heading2,
    Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={cn(
                    "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
                    editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-400'
                )}
                title="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={cn(
                    "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
                    editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-400'
                )}
                title="Italic"
            >
                <Italic size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={cn(
                    "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
                    editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-400'
                )}
                title="Strikethrough"
            >
                <Strikethrough size={18} />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(
                    "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
                    editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-400'
                )}
                title="Heading 1"
            >
                <Heading1 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(
                    "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
                    editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-400'
                )}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                    "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
                    editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-400'
                )}
                title="Bullet List"
            >
                <List size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                    "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
                    editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-400'
                )}
                title="Ordered List"
            >
                <ListOrdered size={18} />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(
                    "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
                    editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-400'
                )}
                title="Quote"
            >
                <Quote size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(
                    "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
                    editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-400'
                )}
                title="Code Block"
            >
                <Code size={18} />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50 transition-colors"
                title="Undo"
            >
                <Undo size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50 transition-colors"
                title="Redo"
            >
                <Redo size={18} />
            </button>
        </div>
    );
};

export default function TiptapEditor({ content, onChange, placeholder = 'Start writing...', editable = true }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[300px] px-4 py-3',
            },
        },
    });

    // Update editor content if content prop changes externally (and editor is not focused? or just careful syncing)
    // Simple sync for now, might need optimization to prevent cursor jumps if using real-time
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only set content if it's different to avoid cursor reset on every keystroke if parent controls state
            // But parent onChange updates state which updates content... cycle.
            // Usually we don't update editor from content unless it completely changed (like loading a new note)
            // For now, we assume content is initial or managed. 
            // Actually, if we type, onChange fires, parent updates state, content prop updates. 
            // If we blindly commands.setContent, cursor moves.
            // So we compare.
            // Better: checking if focused.
            if (!editor.isFocused) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-card">
            {editable && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
}
