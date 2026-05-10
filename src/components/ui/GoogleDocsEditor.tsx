'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { FontFamily } from '@tiptap/extension-font-family';
import {
    Undo, Redo, Printer, SpellCheck, PaintRoller,
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Highlighter, Baseline, Link as LinkIcon, MessageSquarePlus, Image as ImageIcon,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, CheckSquare,
    IndentDecrease, IndentIncrease, RemoveFormatting,
    FileText, ArrowLeft
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useRef, useState } from 'react';
import VoiceInput from '@/components/ui/VoiceInput';

interface GoogleDocsEditorProps {
    title: string;
    onTitleChange: (title: string) => void;
    content: string;
    onContentChange: (content: string) => void;
    onSave: () => void;
    isSaving: boolean;
    onCancel: () => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    const { getThemeClasses } = useTheme();
    const themeClasses = getThemeClasses();
    
    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const IconButton = ({ onClick, isActive = false, disabled = false, icon: Icon, title }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded-sm transition-colors flex items-center justify-center
                ${isActive 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' 
                    : `text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            `}
        >
            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
        </button>
    );

    const Divider = () => <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />;

    return (
        <div className={`flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-t border-b ${themeClasses.cardBorder} ${themeClasses.cardBackground} overflow-x-auto no-scrollbar`}>
            {/* History */}
            <IconButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} icon={Undo} title="Undo" />
            <IconButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} icon={Redo} title="Redo" />
            <IconButton onClick={() => window.print()} icon={Printer} title="Print" />
            <IconButton icon={SpellCheck} title="Spelling and grammar check" />
            <IconButton icon={PaintRoller} title="Paint format" />
            
            <Divider />
            
            {/* Zoom & Styles (Mock dropdowns for visual parity) */}
            <div className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm cursor-pointer text-sm text-gray-700 dark:text-gray-200">
                100% <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            
            <Divider />

            <div className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm cursor-pointer text-sm text-gray-700 dark:text-gray-200">
                Normal text <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            
            <Divider />
            
            <div className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm cursor-pointer text-sm text-gray-700 dark:text-gray-200">
                Arial <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            
            <Divider />

            {/* Font Size (Mock) */}
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
                <button className="px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm">-</button>
                <span className="px-2 py-1 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded-sm">11</span>
                <button className="px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm">+</button>
            </div>
            
            <Divider />

            {/* Formatting */}
            <IconButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Bold (Ctrl+B)" />
            <IconButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italic (Ctrl+I)" />
            <IconButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} title="Underline (Ctrl+U)" />
            <IconButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
            
            {/* Color & Highlight */}
            <div className="relative group flex items-center">
                <IconButton onClick={() => editor.chain().focus().setColor('#1a73e8').run()} isActive={editor.isActive('textStyle', { color: '#1a73e8' })} icon={Baseline} title="Text color" />
                <div className="absolute bottom-1 w-4 h-1 bg-black dark:bg-white left-1/2 -translate-x-1/2 rounded-full pointer-events-none group-hover:bg-blue-600"></div>
            </div>
            <div className="relative group flex items-center">
                <IconButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} icon={Highlighter} title="Highlight color" />
            </div>

            <Divider />

            {/* Insertions */}
            <IconButton onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} title="Insert link (Ctrl+K)" />
            <IconButton icon={MessageSquarePlus} title="Add comment (Ctrl+Alt+M)" />
            <IconButton icon={ImageIcon} title="Insert image" />

            <Divider />

            {/* Alignment */}
            <IconButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Left align (Ctrl+Shift+L)" />
            <IconButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Center align (Ctrl+Shift+E)" />
            <IconButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} title="Right align (Ctrl+Shift+R)" />
            <IconButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} icon={AlignJustify} title="Justify (Ctrl+Shift+J)" />

            <Divider />

            {/* Lists */}
            <IconButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} icon={CheckSquare} title="Checklist" />
            <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="Bulleted list (Ctrl+Shift+8)" />
            <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Numbered list (Ctrl+Shift+7)" />

            <Divider />

            {/* Indent */}
            <IconButton icon={IndentDecrease} title="Decrease indent (Ctrl+[)" />
            <IconButton icon={IndentIncrease} title="Increase indent (Ctrl+])" />
            
            <Divider />
            
            {/* Clear Format */}
            <IconButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} icon={RemoveFormatting} title="Clear formatting (Ctrl+\)" />
        </div>
    );
};

export default function GoogleDocsEditor({
    title,
    onTitleChange,
    content,
    onContentChange,
    onSave,
    isSaving,
    onCancel
}: GoogleDocsEditorProps) {
    const { getThemeClasses } = useTheme();
    const themeClasses = getThemeClasses();
    const [isMenuHovered, setIsMenuHovered] = useState<string | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Type @ to insert' }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            Color,
            Highlight,
            TiptapLink.configure({ openOnClick: false }),
            TaskList,
            TaskItem.configure({ nested: true }),
            FontFamily,
        ],
        content,
        onUpdate: ({ editor }) => {
            onContentChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[800px]',
            },
        },
    });

    // Handle external content updates
    useEffect(() => {
        if (editor && content !== editor.getHTML() && !editor.isFocused) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // Insert text for voice input
    const insertTextAtCursor = (text: string) => {
        if (editor) {
            editor.chain().focus().insertContent(text).run();
        }
    };

    const pseudoMenus = ['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Extensions', 'Help'];

    return (
        <div className={`flex flex-col h-screen overflow-hidden ${themeClasses.background}`}>
            {/* Header Section */}
            <div className={`flex flex-col pt-2 ${themeClasses.cardBackground} z-50`}>
                {/* Top Row: Icon, Title, Menus, Actions */}
                <div className="flex items-start justify-between px-4 pb-1">
                    <div className="flex items-start gap-2">
                        {/* Docs Icon */}
                        <div 
                            onClick={onCancel}
                            className="mt-1 p-2 bg-blue-600 rounded cursor-pointer hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center text-white"
                            title="Docs Home"
                        >
                            <FileText size={24} fill="currentColor" className="text-white" />
                        </div>
                        
                        {/* Title and Menus */}
                        <div className="flex flex-col">
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => onTitleChange(e.target.value)}
                                    placeholder="Untitled document"
                                    className={`px-1.5 py-0.5 text-lg font-medium bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded outline-none transition-colors w-[300px] sm:w-[500px] ${themeClasses.primaryText} placeholder-gray-400`}
                                />
                                <div className="flex items-center ml-2 text-gray-500 dark:text-gray-400 gap-2">
                                    <svg className="w-4 h-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                    <svg className="w-4 h-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                    <svg className="w-4 h-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                                </div>
                            </div>
                            
                            {/* Menus */}
                            <div className="flex items-center text-sm mt-0.5 -ml-1">
                                {pseudoMenus.map(menu => (
                                    <div 
                                        key={menu}
                                        onMouseEnter={() => setIsMenuHovered(menu)}
                                        onMouseLeave={() => setIsMenuHovered(null)}
                                        className={`px-2 py-1 rounded cursor-pointer ${isMenuHovered === menu ? 'bg-gray-100 dark:bg-gray-700' : 'bg-transparent'} ${themeClasses.primaryText}`}
                                    >
                                        {menu}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Actions: Share/Save */}
                    <div className="flex items-center gap-4 mt-2">
                        <div className="hidden sm:flex items-center gap-3 mr-2 text-gray-600 dark:text-gray-300">
                            <svg className="w-5 h-5 cursor-pointer hover:text-gray-900 dark:hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <svg className="w-5 h-5 cursor-pointer hover:text-gray-900 dark:hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <svg className="w-5 h-5 cursor-pointer hover:text-gray-900 dark:hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </div>
                        <button
                            onClick={onSave}
                            disabled={isSaving || !title.trim()}
                            className={`flex items-center gap-2 px-6 py-2 bg-blue-200 hover:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 text-blue-900 dark:text-white rounded-full font-medium transition-colors ${
                                (isSaving || !title.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSaving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            )}
                            Save
                        </button>
                        
                        {/* User Avatar Placeholder */}
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                            U
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <MenuBar editor={editor} />
            </div>

            {/* Editor Workspace Area (Scrollable) */}
            <div className={`flex-1 overflow-y-auto ${themeClasses.background} px-2 sm:px-8 py-4 sm:py-8`}>
                
                {/* Voice Input Alert */}
                <div className="max-w-[850px] mx-auto mb-4">
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${themeClasses.cardBackground} ${themeClasses.cardBorder} shadow-sm`}>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🎤</span>
                            <span className={`text-sm font-medium ${themeClasses.primaryText}`}>Voice Typing (Urdu → English)</span>
                        </div>
                        <VoiceInput onTextInsert={insertTextAtCursor} className="w-auto" />
                    </div>
                </div>

                {/* The "Paper" */}
                <div className={`max-w-[850px] mx-auto bg-white dark:bg-[#1f1f1f] shadow-xl border border-gray-200 dark:border-gray-800 min-h-[1056px] cursor-text`} onClick={() => editor?.commands.focus()}>
                    {/* Visual Ruler (Mock) */}
                    <div className="h-6 border-b border-gray-200 dark:border-gray-800 flex items-end px-16 relative overflow-hidden opacity-50">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div key={i} className="flex-1 border-l border-gray-300 dark:border-gray-600 h-2" style={{ position: 'relative' }}>
                                {i % 5 === 0 && <span className="absolute -top-4 -left-1 text-[10px] text-gray-400">{i / 5 + 1}</span>}
                            </div>
                        ))}
                        {/* Margin Indicators */}
                        <div className="absolute left-16 top-0 bottom-0 w-3 bg-blue-500/20 cursor-ew-resize">
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-500 mx-auto"></div>
                        </div>
                        <div className="absolute right-16 top-0 bottom-0 w-3 bg-blue-500/20 cursor-ew-resize">
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-500 mx-auto"></div>
                        </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="px-12 sm:px-20 py-12 sm:py-16">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>

            {/* CSS Overrides for Tiptap to mimic Google Docs */}
            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: #adb5bd;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                
                .ProseMirror ul[data-type="taskList"] {
                    list-style: none;
                    padding: 0;
                }

                .ProseMirror ul[data-type="taskList"] p {
                    margin: 0;
                }

                .ProseMirror ul[data-type="taskList"] li {
                    display: flex;
                }

                .ProseMirror ul[data-type="taskList"] li > label {
                    flex: 0 0 auto;
                    margin-right: 0.5rem;
                    user-select: none;
                }

                .ProseMirror ul[data-type="taskList"] li > div {
                    flex: 1 1 auto;
                }
                
                .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
