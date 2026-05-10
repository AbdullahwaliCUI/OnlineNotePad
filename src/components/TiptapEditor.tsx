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

    const buttonClass = (isActive: boolean) => cn(
        "p-1 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 border-2",
        isActive
            ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
            : 'text-black bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-300'
    );

    return (
        <div className="border-b border-blue-200 p-3 flex flex-wrap gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg shadow-sm">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={buttonClass(editor.isActive('bold'))}
                title="Bold"
            >
                <span className="font-bold text-xs">B</span>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={buttonClass(editor.isActive('italic'))}
                title="Italic"
            >
                <span className="italic text-xs">I</span>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={buttonClass(editor.isActive('strike'))}
                title="Strikethrough"
            >
                <span className="line-through text-xs">S</span>
            </button>
            <div className="w-px h-6 bg-blue-300 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={buttonClass(editor.isActive('heading', { level: 1 }))}
                title="Heading 1"
            >
                <span className="font-bold text-xs">H1</span>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={buttonClass(editor.isActive('heading', { level: 2 }))}
                title="Heading 2"
            >
                <span className="font-bold text-xs">H2</span>
            </button>
            <div className="w-px h-6 bg-blue-300 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass(editor.isActive('bulletList'))}
                title="Bullet List"
            >
                <span className="text-xs font-semibold">• List</span>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={buttonClass(editor.isActive('orderedList'))}
                title="Ordered List"
            >
                <span className="text-xs font-semibold">1. List</span>
            </button>
            <div className="w-px h-6 bg-blue-300 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={buttonClass(editor.isActive('blockquote'))}
                title="Quote"
            >
                <span className="text-xs font-semibold">Quote</span>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={buttonClass(editor.isActive('codeBlock'))}
                title="Code Block"
            >
                <span className="text-xs font-mono font-semibold">Code</span>
            </button>
            <div className="w-px h-6 bg-blue-300 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-1 rounded hover:bg-blue-50 border-2 border-blue-200 text-black bg-white disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 hover:border-blue-300"
                title="Undo"
            >
                <span className="text-xs font-semibold">Undo</span>
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-1 rounded hover:bg-blue-50 border-2 border-blue-200 text-black bg-white disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 hover:border-blue-300"
                title="Redo"
            >
                <span className="text-xs font-semibold">Redo</span>
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
        <div className="border-2 border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
            {editable && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
}
