'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});
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
import { CharacterCount } from '@tiptap/extension-character-count';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
    Undo, Redo, Printer, SpellCheck, PaintRoller,
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Highlighter, Baseline, Link as LinkIcon, MessageSquarePlus, Image as ImageIcon,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, CheckSquare,
    IndentDecrease, IndentIncrease, RemoveFormatting,
    FileText, X, Clock, Lock, Star, Folder, Cloud, ChevronDown
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

const MenuBar = ({ editor, zoom, setZoom }: { editor: any, zoom: number, setZoom: (z: number) => void }) => {
    const { getThemeClasses } = useTheme();
    const themeClasses = getThemeClasses();
    
    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
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
            className={`w-8 h-8 rounded-sm transition-colors flex items-center justify-center
                ${isActive 
                    ? 'bg-[#d3e3fd] text-[#041e49] dark:bg-[#4a5568] dark:text-[#e8eaed]' 
                    : `text-[#444746] dark:text-[#e8eaed] hover:bg-[#e1e5ea] dark:hover:bg-[#4a5568]`}
                ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            `}
        >
            <Icon size={18} strokeWidth={1.5} />
        </button>
    );

    const Divider = () => <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />;

    return (
        <div className={`flex flex-wrap items-center gap-0.5 px-4 py-1 bg-[#edf2fa] dark:bg-[#282a2c] rounded-full mx-4 mb-2 overflow-x-auto no-scrollbar`}>
            {/* History */}
            <IconButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} icon={Undo} title="Undo" />
            <IconButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} icon={Redo} title="Redo" />
            <IconButton onClick={() => window.print()} icon={Printer} title="Print" />
            <IconButton icon={SpellCheck} title="Spelling and grammar check" />
            <IconButton icon={PaintRoller} title="Paint format" />
            
            <Divider />
            
            {/* Zoom */}
            <div className="flex items-center mx-0.5">
                <select
                    className="bg-transparent text-[13px] text-[#444746] dark:text-[#e8eaed] outline-none cursor-pointer hover:bg-[#e1e5ea] dark:hover:bg-[#4a5568] px-1 h-8 rounded-sm appearance-none w-[60px]"
                    value={zoom}
                    onChange={(e) => setZoom(parseInt(e.target.value))}
                >
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                    <option value={125}>125%</option>
                    <option value={150}>150%</option>
                    <option value={200}>200%</option>
                </select>
                <ChevronDown size={14} className="-ml-3 pointer-events-none opacity-70" />
            </div>
            
            <Divider />

            {/* Styles */}
            <div className="flex items-center mx-0.5">
                <select
                    className="bg-transparent text-[13px] text-[#444746] dark:text-[#e8eaed] outline-none cursor-pointer hover:bg-[#e1e5ea] dark:hover:bg-[#4a5568] px-1 h-8 rounded-sm appearance-none w-24"
                    value={editor.isActive('heading', { level: 1 }) ? 'h1' : editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
                    onChange={(e) => {
                        if (e.target.value === 'p') editor.chain().focus().setParagraph().run();
                        else editor.chain().focus().toggleHeading({ level: parseInt(e.target.value.replace('h', '')) as any }).run();
                    }}
                >
                    <option value="p">Normal text</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                </select>
                <ChevronDown size={14} className="-ml-4 pointer-events-none opacity-70" />
            </div>
            
            <Divider />
            
            {/* Font Family */}
            <div className="flex items-center mx-0.5">
                <select
                    className="bg-transparent text-[13px] text-[#444746] dark:text-[#e8eaed] outline-none cursor-pointer hover:bg-[#e1e5ea] dark:hover:bg-[#4a5568] px-1 h-8 rounded-sm appearance-none w-24"
                    value={editor.getAttributes('textStyle').fontFamily || 'Arial'}
                    onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                >
                    <option value="Arial">Arial</option>
                    <option value="Comic Sans MS">Comic Sans</option>
                    <option value="Courier New">Courier</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times</option>
                    <option value="Verdana">Verdana</option>
                </select>
                <ChevronDown size={14} className="-ml-4 pointer-events-none opacity-70" />
            </div>
            
            <Divider />

            {/* Font Size */}
            <div className="flex items-center text-[13px] text-[#444746] dark:text-[#e8eaed] mx-0.5">
                <button 
                    onClick={() => {
                        const currentSize = parseInt(editor.getAttributes('textStyle').fontSize || '11');
                        editor.chain().focus().setFontSize(`${Math.max(1, currentSize - 1)}pt`).run();
                    }}
                    className="w-6 h-8 hover:bg-[#e1e5ea] dark:hover:bg-[#4a5568] rounded-sm flex items-center justify-center">-</button>
                <input
                    type="number"
                    className="w-8 h-8 text-center bg-transparent border border-transparent hover:border-[#c7c7c7] dark:hover:border-gray-600 rounded-sm outline-none font-mono"
                    value={parseInt(editor.getAttributes('textStyle').fontSize || '11')}
                    onChange={(e) => editor.chain().focus().setFontSize(`${e.target.value}pt`).run()}
                />
                <button 
                    onClick={() => {
                        const currentSize = parseInt(editor.getAttributes('textStyle').fontSize || '11');
                        editor.chain().focus().setFontSize(`${currentSize + 1}pt`).run();
                    }}
                    className="w-6 h-8 hover:bg-[#e1e5ea] dark:hover:bg-[#4a5568] rounded-sm flex items-center justify-center">+</button>
            </div>
            
            <Divider />

            {/* Formatting */}
            <IconButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Bold (Ctrl+B)" />
            <IconButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italic (Ctrl+I)" />
            <IconButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} title="Underline (Ctrl+U)" />
            <IconButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
            
            {/* Color & Highlight */}
            <div className="relative flex items-center group w-8 h-8 hover:bg-[#e1e5ea] dark:hover:bg-[#4a5568] rounded-sm cursor-pointer justify-center overflow-hidden">
                <Baseline size={18} strokeWidth={1.5} className="text-[#444746] dark:text-[#e8eaed] pointer-events-none absolute z-10" />
                <div className="absolute bottom-1 w-4 h-1 left-1/2 -translate-x-1/2 pointer-events-none z-10" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}></div>
                <input 
                    type="color" 
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                    className="absolute inset-0 w-[200%] h-[200%] -top-2 -left-2 opacity-0 cursor-pointer"
                    title="Text color"
                />
            </div>
            <div className="relative flex items-center group w-8 h-8 hover:bg-[#e1e5ea] dark:hover:bg-[#4a5568] rounded-sm cursor-pointer justify-center overflow-hidden">
                <Highlighter size={18} strokeWidth={1.5} className="text-[#444746] dark:text-[#e8eaed] pointer-events-none absolute z-10" />
                <div className="absolute bottom-1 w-4 h-1 left-1/2 -translate-x-1/2 pointer-events-none z-10" style={{ backgroundColor: editor.getAttributes('highlight').color || 'transparent' }}></div>
                <input 
                    type="color" 
                    value={editor.getAttributes('highlight').color || '#ffff00'}
                    onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
                    className="absolute inset-0 w-[200%] h-[200%] -top-2 -left-2 opacity-0 cursor-pointer"
                    title="Highlight color"
                />
            </div>

            <Divider />

            {/* Insertions */}
            <IconButton onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} title="Insert link (Ctrl+K)" />
            <IconButton icon={MessageSquarePlus} title="Add comment (Ctrl+Alt+M)" />
            <IconButton onClick={() => {
                const url = window.prompt('Image URL:');
                if (url) editor.chain().focus().setImage({ src: url }).run();
            }} icon={ImageIcon} title="Insert image" />

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
    
    // State for Dropdowns & Modals
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [showWordCount, setShowWordCount] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [zoom, setZoom] = useState(100);
    const menuRef = useRef<HTMLDivElement>(null);

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
            CharacterCount,
            TiptapImage,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            FontSize,
        ],
        content,
        onUpdate: ({ editor }) => {
            onContentChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[800px] pb-10',
            },
        },
    });

    // Handle external content updates
    useEffect(() => {
        if (editor && content !== editor.getHTML() && !editor.isFocused) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // Click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const insertTextAtCursor = (text: string) => {
        if (editor) {
            editor.chain().focus().insertContent(text).run();
        }
    };

    // Dropdown Data
    const menus: Record<string, any[]> = {
        File: [
            { label: 'New document', action: () => window.location.href = '/notes/new' },
            { label: 'Open dashboard', action: () => window.location.href = '/dashboard' },
            { divider: true },
            { label: 'Save', action: onSave, disabled: isSaving || !title.trim() },
            { label: 'Rename', action: () => document.getElementById('doc-title-input')?.focus() },
            { divider: true },
            { label: 'Download as HTML', action: () => {
                const element = document.createElement("a");
                const file = new Blob([editor?.getHTML() || ''], {type: 'text/html'});
                element.href = URL.createObjectURL(file);
                element.download = `${title || 'Untitled'}.html`;
                document.body.appendChild(element);
                element.click();
            }},
            { label: 'Download as TXT', action: () => {
                const element = document.createElement("a");
                const file = new Blob([editor?.getText() || ''], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = `${title || 'Untitled'}.txt`;
                document.body.appendChild(element);
                element.click();
            }},
            { divider: true },
            { label: 'Print', action: () => window.print() },
        ],
        Edit: [
            { label: 'Undo', action: () => editor?.chain().focus().undo().run(), shortcut: 'Ctrl+Z' },
            { label: 'Redo', action: () => editor?.chain().focus().redo().run(), shortcut: 'Ctrl+Y' },
            { divider: true },
            { label: 'Select All', action: () => editor?.chain().focus().selectAll().run(), shortcut: 'Ctrl+A' },
        ],
        View: [
            { label: 'Toggle Fullscreen', action: () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            }},
        ],
        Insert: [
            { label: 'Image', action: () => {
                const url = window.prompt('Image URL:');
                if (url) editor?.chain().focus().setImage({ src: url }).run();
            }},
            { label: 'Table (3x3)', action: () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
            { label: 'Horizontal Line', action: () => editor?.chain().focus().setHorizontalRule().run() },
            { divider: true },
            { label: 'Link', action: () => {
                const previousUrl = editor?.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl);
                if (url === null) return;
                if (url === '') {
                    editor?.chain().focus().extendMarkRange('link').unsetLink().run();
                    return;
                }
                editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }},
        ],
        Format: [
            { label: 'Bold', action: () => editor?.chain().focus().toggleBold().run(), shortcut: 'Ctrl+B' },
            { label: 'Italic', action: () => editor?.chain().focus().toggleItalic().run(), shortcut: 'Ctrl+I' },
            { label: 'Underline', action: () => editor?.chain().focus().toggleUnderline().run(), shortcut: 'Ctrl+U' },
            { label: 'Strikethrough', action: () => editor?.chain().focus().toggleStrike().run() },
            { divider: true },
            { label: 'Clear formatting', action: () => editor?.chain().focus().clearNodes().unsetAllMarks().run() },
        ],
        Tools: [
            { label: 'Word count', action: () => setShowWordCount(true), shortcut: 'Ctrl+Shift+C' },
        ],
        Extensions: [
            { label: 'AI Summarize (Coming Soon)', action: () => alert('AI Features coming soon!'), disabled: true },
        ],
        Help: [
            { label: 'Keyboard shortcuts', action: () => setShowShortcuts(true), shortcut: 'Ctrl+/' },
        ]
    };

    return (
        <div className={`flex flex-col h-screen overflow-hidden ${themeClasses.background} print:h-auto print:overflow-visible print:bg-white`}>
            {/* Header Section */}
            <div className={`flex flex-col pt-3 z-50 print:hidden bg-[#f9fbfd] dark:bg-[#131314]`}>
                {/* Top Row: Icon, Title, Menus, Actions */}
                <div className="flex items-start justify-between px-4 pb-1">
                    <div className="flex items-start gap-2">
                        {/* Docs Icon */}
                        <div 
                            onClick={onCancel}
                            className="mt-1.5 mr-1 ml-1 w-10 h-10 bg-[#4285F4] rounded cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center shrink-0"
                            title="Docs Home"
                        >
                            <svg width="22" height="26" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0L20 8V22C20 23.1 19.1 24 18 24H2C0.9 24 0 23.1 0 22V2C0 0.9 0.9 0 2 0H12ZM11 9V1.5L18.5 9H11ZM4 13H16V11H4V13ZM4 17H16V15H4V17ZM4 21H12V19H4V21Z" fill="white"/>
                            </svg>
                        </div>
                        
                        {/* Title and Menus */}
                        <div className="flex flex-col">
                            <div className="flex items-center">
                                <input
                                    id="doc-title-input"
                                    type="text"
                                    value={title}
                                    onChange={(e) => onTitleChange(e.target.value)}
                                    placeholder="Untitled document"
                                    className={`px-1.5 py-0.5 text-[18px] leading-6 font-normal bg-transparent border border-transparent hover:border-[#c7c7c7] dark:hover:border-gray-600 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded outline-none transition-colors w-[150px] sm:w-[300px] md:w-[500px] text-[#1f1f1f] dark:text-[#e8eaed] placeholder-gray-500`}
                                />
                                <div className="flex items-center ml-2 text-[#444746] dark:text-[#e8eaed] gap-1">
                                    <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <Star size={18} strokeWidth={1.5} />
                                    </button>
                                    <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <Folder size={18} strokeWidth={1.5} />
                                    </button>
                                    <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <Cloud size={18} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Menus Dropdown System */}
                            <div className="flex items-center text-sm mt-0.5 -ml-1 relative" ref={menuRef}>
                                {Object.keys(menus).map(menuName => (
                                    <div key={menuName} className="relative">
                                        <button 
                                            onClick={() => setActiveMenu(activeMenu === menuName ? null : menuName)}
                                            onMouseEnter={() => {
                                                if (activeMenu && activeMenu !== menuName) {
                                                    setActiveMenu(menuName);
                                                }
                                            }}
                                            className={`px-2 py-1 rounded cursor-pointer text-[14px] leading-5 text-[#1f1f1f] dark:text-[#e8eaed] ${activeMenu === menuName ? 'bg-[#e1e5ea] dark:bg-[#4a5568]' : 'bg-transparent hover:bg-[#e1e5ea] dark:hover:bg-[#4a5568]'}`}
                                        >
                                            {menuName}
                                        </button>

                                        {/* Dropdown Panel */}
                                        {activeMenu === menuName && (
                                            <div className={`absolute top-full left-0 mt-1 py-1 w-56 rounded-md shadow-lg border ${themeClasses.cardBorder} ${themeClasses.cardBackground} z-[100]`}>
                                                {menus[menuName].map((item, idx) => 
                                                    item.divider ? (
                                                        <div key={idx} className={`my-1 h-px w-full ${themeClasses.cardBorder} border-t`} />
                                                    ) : (
                                                        <button
                                                            key={idx}
                                                            onClick={() => {
                                                                if (!item.disabled) {
                                                                    item.action();
                                                                    setActiveMenu(null);
                                                                }
                                                            }}
                                                            disabled={item.disabled}
                                                            className={`w-full text-left px-4 py-1.5 text-sm flex items-center justify-between transition-colors
                                                                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                                                                ${themeClasses.primaryText}
                                                            `}
                                                        >
                                                            <span>{item.label}</span>
                                                            {item.shortcut && <span className="text-gray-400 text-xs tracking-widest">{item.shortcut}</span>}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Actions: Share/Save */}
                    <div className="flex items-center gap-2 mt-1.5">
                        <div className="hidden sm:flex items-center">
                            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-[#444746] dark:text-[#e8eaed] mx-1" title="Version history">
                                <Clock size={22} strokeWidth={1.5} />
                            </button>
                        </div>
                        <button
                            onClick={onSave}
                            disabled={isSaving || !title.trim()}
                            className={`flex items-center gap-2 px-5 py-2 bg-[#c2e7ff] hover:bg-[#b3dcf4] dark:bg-[#004a77] dark:hover:bg-[#005c91] text-[#001d35] dark:text-[#c2e7ff] rounded-full font-medium transition-colors text-[14px] leading-5 mr-2 ${
                                (isSaving || !title.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSaving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                                <Lock size={16} strokeWidth={2} />
                            )}
                            Save
                        </button>
                        
                        {/* Profile Placeholder */}
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-sm cursor-pointer shadow-sm">
                            A
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <MenuBar editor={editor} zoom={zoom} setZoom={setZoom} />
            </div>

            {/* Editor Workspace Area (Scrollable) */}
            <div className={`flex-1 overflow-y-auto bg-[#f9fbfd] dark:bg-[#131314] px-2 sm:px-8 py-4 sm:py-8 relative print:p-0 print:bg-white print:overflow-visible`}>
                
                {/* Voice Input Alert */}
                <div className="max-w-[850px] mx-auto mb-4 print:hidden">
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${themeClasses.cardBackground} ${themeClasses.cardBorder} shadow-sm`}>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🎤</span>
                            <span className={`text-sm font-medium ${themeClasses.primaryText}`}>Voice Typing (Urdu → English)</span>
                        </div>
                        <VoiceInput onTextInsert={insertTextAtCursor} className="w-auto" />
                    </div>
                </div>

                {/* The "Paper" */}
                <div 
                    className="max-w-[850px] mx-auto bg-white shadow-xl border border-gray-200 min-h-[1056px] cursor-text print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none print:min-h-0 transition-transform origin-top" 
                    style={{ transform: `scale(${zoom / 100})`, marginBottom: `${(zoom > 100 ? (zoom - 100) * 10 : 0)}px` }}
                    onClick={() => editor?.commands.focus()}
                >
                    {/* Visual Ruler (Mock) */}
                    <div className="h-6 border-b border-gray-200 flex items-end px-16 relative overflow-hidden opacity-50 print:hidden">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div key={i} className="flex-1 border-l border-gray-300 h-2" style={{ position: 'relative' }}>
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
                    <div className="px-12 sm:px-20 py-12 sm:py-16 print:p-0">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>

            {/* MODALS */}
            
            {/* Word Count Modal */}
            {showWordCount && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                    <div className={`w-full max-w-sm rounded-lg shadow-2xl p-5 ${themeClasses.cardBackground} border ${themeClasses.cardBorder}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className={`text-lg font-semibold ${themeClasses.primaryText}`}>Word count</h2>
                            <button onClick={() => setShowWordCount(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><X size={20}/></button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400">Words</span>
                                <span className={`font-medium ${themeClasses.primaryText}`}>{editor?.storage.characterCount.words()}</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400">Characters</span>
                                <span className={`font-medium ${themeClasses.primaryText}`}>{editor?.storage.characterCount.characters()}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowWordCount(false)} className={`px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700`}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shortcuts Modal */}
            {showShortcuts && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                    <div className={`w-full max-w-md rounded-lg shadow-2xl p-5 ${themeClasses.cardBackground} border ${themeClasses.cardBorder}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className={`text-lg font-semibold ${themeClasses.primaryText}`}>Keyboard shortcuts</h2>
                            <button onClick={() => setShowShortcuts(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><X size={20}/></button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2">
                            {[
                                { label: 'Copy', key: 'Ctrl + C' },
                                { label: 'Paste', key: 'Ctrl + V' },
                                { label: 'Undo', key: 'Ctrl + Z' },
                                { label: 'Redo', key: 'Ctrl + Y' },
                                { label: 'Bold', key: 'Ctrl + B' },
                                { label: 'Italic', key: 'Ctrl + I' },
                                { label: 'Underline', key: 'Ctrl + U' },
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500 dark:text-gray-400">{s.label}</span>
                                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">{s.key}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowShortcuts(false)} className={`px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700`}>Close</button>
                        </div>
                    </div>
                </div>
            )}

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

                /* Table Styles */
                .ProseMirror table {
                    border-collapse: collapse;
                    table-layout: fixed;
                    width: 100%;
                    margin: 0;
                    overflow: hidden;
                }
                .ProseMirror table td,
                .ProseMirror table th {
                    min-width: 1em;
                    border: 1px solid #ccc;
                    padding: 3px 5px;
                    vertical-align: top;
                    box-sizing: border-box;
                    position: relative;
                }
                .ProseMirror table th {
                    font-weight: bold;
                    text-align: left;
                    background-color: #f1f3f4;
                }
                .ProseMirror table .column-resize-handle {
                    position: absolute;
                    right: -2px;
                    top: 0;
                    bottom: -2px;
                    width: 4px;
                    background-color: #adb5bd;
                    pointer-events: none;
                }
                .ProseMirror table p {
                    margin: 0;
                }
                .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    margin-top: 1rem;
                    margin-bottom: 1rem;
                }
                @media print {
                    @page { margin: 0.75in; }
                    body { background-color: white !important; }
                }
            `}</style>
        </div>
    );
}
