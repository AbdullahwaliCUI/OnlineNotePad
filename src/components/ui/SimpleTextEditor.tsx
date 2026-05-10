'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import VoiceInput from './VoiceInput';

interface SimpleTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export default function SimpleTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  className = '',
}: SimpleTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [lineHeight, setLineHeight] = useState('1.6');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  // Helper function to get theme-based button classes
  const getButtonClasses = (isActive: boolean = false) => {
    const baseClasses = "px-2 py-1 text-xs border-2 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105";
    
    if (themeClasses.accent === 'bg-blue-600') {
      // Blue theme
      return isActive 
        ? `${baseClasses} bg-blue-600 border-blue-600 text-white shadow-lg`
        : `${baseClasses} border-blue-200 text-black bg-white hover:bg-blue-50 hover:border-blue-300`;
    } else {
      // Green theme
      return isActive 
        ? `${baseClasses} bg-green-600 border-green-600 text-white shadow-lg`
        : `${baseClasses} border-green-200 text-black bg-white hover:bg-green-50 hover:border-green-300`;
    }
  };

  const getInputClasses = () => {
    return themeClasses.accent === 'bg-blue-600'
      ? 'border-blue-200 focus:ring-blue-500 focus:border-blue-500'
      : 'border-green-200 focus:ring-green-500 focus:border-green-500';
  };

  const getDropdownClasses = () => {
    return themeClasses.accent === 'bg-blue-600'
      ? 'border-blue-200'
      : 'border-green-200';
  };

  const getSeparatorClasses = () => {
    return themeClasses.accent === 'bg-blue-600'
      ? 'border-blue-300'
      : 'border-green-300';
  };

  // Convert markdown to HTML for display
  const markdownToHtml = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/\^(.*?)\^/g, '<sup>$1</sup>')
      .replace(/~(.*?)~/g, '<sub>$1</sub>')
      .replace(/^• (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
      .replace(/\n/g, '<br>');
  };

  // Convert HTML back to markdown
  const htmlToMarkdown = (html: string) => {
    return html
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<u>(.*?)<\/u>/g, '_$1_')
      .replace(/<del>(.*?)<\/del>/g, '~~$1~~')
      .replace(/<sup>(.*?)<\/sup>/g, '^$1^')
      .replace(/<sub>(.*?)<\/sub>/g, '~$1~')
      .replace(/<li>(.*?)<\/li>/g, '• $1')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, ''); // Remove any other HTML tags
  };

  // Save current selection
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        setSavedSelection(range.cloneRange());
        return range.cloneRange();
      }
    }
    return null;
  };

  // Restore saved selection
  const restoreSelection = (range?: Range | null) => {
    const selection = window.getSelection();
    if (selection && (range || savedSelection)) {
      selection.removeAllRanges();
      selection.addRange(range || savedSelection!);
    }
  };

  // Initialize content only once
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      const htmlContent = markdownToHtml(value);
      editorRef.current.innerHTML = htmlContent;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Handle content changes - debounced
  const handleInput = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      const markdownContent = htmlToMarkdown(htmlContent);

      // Debounce the onChange call
      setTimeout(() => {
        onChange(markdownContent);
      }, 500);
    }
  };

  // Insert text at cursor position (for voice input)
  const insertTextAtCursor = (text: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Delete any selected content first
      range.deleteContents();

      // Create text node and insert
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);

      // Move cursor to end of inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);

      // Trigger content change
      handleInput();
    } else {
      // Fallback: append to end
      const textNode = document.createTextNode(text);
      editorRef.current.appendChild(textNode);
      handleInput();
    }
  };

  // Handle selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current) return;

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          setSavedSelection(range.cloneRange());
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Close color pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.color-picker-dropdown') && !target.closest('button[title*="Color"]')) {
        setShowColorPicker(false);
        setShowBgColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editorRef.current || readOnly) return;

      // Check if editor is focused
      if (!editorRef.current.contains(document.activeElement)) return;

      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            applyFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            applyFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            applyFormat('underline');
            break;
          case 'e':
            e.preventDefault();
            applyFormat('center');
            break;
          case 'l':
            e.preventDefault();
            applyFormat('left');
            break;
          case 'r':
            e.preventDefault();
            applyFormat('right');
            break;
          case 'j':
            e.preventDefault();
            applyFormat('justify');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [readOnly]);

  const applyFormat = (format: string) => {
    if (!editorRef.current || readOnly) return;

    // Save current selection before any operations
    const currentRange = saveSelection();
    if (!currentRange) {
      // If no selection, focus editor and try to get selection
      editorRef.current.focus();
      return;
    }

    console.log('Applying format:', format, 'to selection:', currentRange.toString());

    try {
      // Ensure editor is focused
      editorRef.current.focus();

      // Restore selection
      restoreSelection(currentRange);

      // Apply formatting using modern approach
      switch (format) {
        case 'bold':
          if (document.queryCommandSupported('bold')) {
            document.execCommand('bold', false);
          } else {
            wrapSelectionWithTag('strong');
          }
          break;
        case 'italic':
          if (document.queryCommandSupported('italic')) {
            document.execCommand('italic', false);
          } else {
            wrapSelectionWithTag('em');
          }
          break;
        case 'underline':
          if (document.queryCommandSupported('underline')) {
            document.execCommand('underline', false);
          } else {
            wrapSelectionWithTag('u');
          }
          break;
        case 'strikethrough':
          if (document.queryCommandSupported('strikeThrough')) {
            document.execCommand('strikeThrough', false);
          } else {
            wrapSelectionWithTag('del');
          }
          break;
        case 'superscript':
          if (document.queryCommandSupported('superscript')) {
            document.execCommand('superscript', false);
          } else {
            wrapSelectionWithTag('sup');
          }
          break;
        case 'subscript':
          if (document.queryCommandSupported('subscript')) {
            document.execCommand('subscript', false);
          } else {
            wrapSelectionWithTag('sub');
          }
          break;
        case 'left':
          document.execCommand('justifyLeft', false);
          break;
        case 'center':
          document.execCommand('justifyCenter', false);
          break;
        case 'right':
          document.execCommand('justifyRight', false);
          break;
        case 'justify':
          document.execCommand('justifyFull', false);
          break;
        case 'list':
          document.execCommand('insertUnorderedList', false);
          break;
        case 'numbered':
          document.execCommand('insertOrderedList', false);
          break;
        case 'undo':
          document.execCommand('undo', false);
          break;
        case 'redo':
          document.execCommand('redo', false);
          break;
      }

      // Trigger content change
      handleInput();

    } catch (error) {
      console.error('Format command failed:', error);
    }
  };

  // Fallback method to wrap selection with HTML tag
  const wrapSelectionWithTag = (tagName: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!range || range.collapsed) return;

    try {
      const selectedContent = range.extractContents();
      const wrapper = document.createElement(tagName);
      wrapper.appendChild(selectedContent);
      range.insertNode(wrapper);

      // Clear selection and place cursor after the inserted element
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStartAfter(wrapper);
      newRange.collapse(true);
      selection.addRange(newRange);
    } catch (error) {
      console.error('Manual wrapping failed:', error);
    }
  };

  const changeFontSize = (size: string) => {
    if (!editorRef.current || readOnly) return;

    setFontSize(size);
    editorRef.current.style.fontSize = `${size}px`;
    editorRef.current.focus();
  };

  const changeTextColor = (color: string) => {
    if (!editorRef.current || readOnly) return;

    // Save selection before color change
    const currentRange = saveSelection();

    setTextColor(color);
    editorRef.current.focus();

    if (currentRange) {
      restoreSelection(currentRange);
      if (document.queryCommandSupported('foreColor')) {
        document.execCommand('foreColor', false, color);
      }
    }

    setShowColorPicker(false);
  };

  const changeBackgroundColor = (color: string) => {
    if (!editorRef.current || readOnly) return;

    // Save selection before color change
    const currentRange = saveSelection();

    setBackgroundColor(color);
    editorRef.current.focus();

    if (currentRange) {
      restoreSelection(currentRange);
      if (document.queryCommandSupported('hiliteColor')) {
        document.execCommand('hiliteColor', false, color);
      } else if (document.queryCommandSupported('backColor')) {
        document.execCommand('backColor', false, color);
      }
    }

    setShowBgColorPicker(false);
  };

  const changeLineHeight = (height: string) => {
    if (!editorRef.current || readOnly) return;

    setLineHeight(height);
    editorRef.current.style.lineHeight = height;
    editorRef.current.focus();
  };

  const getButtonState = (format: string) => {
    if (!editorRef.current) return false;

    try {
      switch (format) {
        case 'bold':
          return document.queryCommandState ? document.queryCommandState('bold') : false;
        case 'italic':
          return document.queryCommandState ? document.queryCommandState('italic') : false;
        case 'underline':
          return document.queryCommandState ? document.queryCommandState('underline') : false;
        case 'strikethrough':
          return document.queryCommandState ? document.queryCommandState('strikeThrough') : false;
        case 'superscript':
          return document.queryCommandState ? document.queryCommandState('superscript') : false;
        case 'subscript':
          return document.queryCommandState ? document.queryCommandState('subscript') : false;
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  };

  return (
    <div className={`simple-text-editor ${className}`}>
      {!readOnly && (
        <>
          <div className={`toolbar border border-gray-300 border-b-0 rounded-t-lg ${themeClasses.gradient} p-3 shadow-sm`}>
            {/* Single Row - All Features */}
            <div className="flex flex-wrap gap-1 items-center">
              {/* Font Size */}
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-800 font-semibold">Size:</label>
                <select
                  value={fontSize}
                  onChange={(e) => changeFontSize(e.target.value)}
                  className={`px-2 py-1 text-xs border-2 rounded focus:outline-none focus:ring-2 w-14 text-gray-900 bg-white shadow-sm font-medium ${themeClasses.accent === 'bg-blue-600' ? 'border-blue-200 focus:ring-blue-500 focus:border-blue-500' : 'border-green-200 focus:ring-green-500 focus:border-green-500'}`}
                >
                  <option value="12">12</option>
                  <option value="14">14</option>
                  <option value="16">16</option>
                  <option value="18">18</option>
                  <option value="20">20</option>
                  <option value="24">24</option>
                  <option value="28">28</option>
                  <option value="32">32</option>
                </select>
              </div>

              {/* Line Height */}
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-800 font-semibold">Line:</label>
                <select
                  value={lineHeight}
                  onChange={(e) => changeLineHeight(e.target.value)}
                  className={`px-2 py-1 text-xs border-2 rounded focus:outline-none focus:ring-2 w-14 text-gray-900 bg-white shadow-sm font-medium ${getInputClasses()}`}
                >
                  <option value="1.0">1.0</option>
                  <option value="1.2">1.2</option>
                  <option value="1.5">1.5</option>
                  <option value="1.6">1.6</option>
                  <option value="2.0">2.0</option>
                  <option value="2.5">2.5</option>
                </select>
              </div>

              <div className={`border-l-2 h-6 mx-1 ${getSeparatorClasses()}`}></div>

              {/* Basic Formatting */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('bold');
                }}
                className={`${getButtonClasses(getButtonState('bold'))} font-bold`}
                title="Bold (Ctrl+B)"
              >
                B
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('italic');
                }}
                className={`${getButtonClasses(getButtonState('italic'))} italic`}
                title="Italic (Ctrl+I)"
              >
                I
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('underline');
                }}
                className={`${getButtonClasses(getButtonState('underline'))} underline`}
                title="Underline (Ctrl+U)"
              >
                U
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('strikethrough');
                }}
                className={`${getButtonClasses(getButtonState('strikethrough'))} line-through`}
                title="Strikethrough"
              >
                S
              </button>

              <div className={`border-l-2 h-6 mx-1 ${getSeparatorClasses()}`}></div>

              {/* Text Color */}
              <div className="relative">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    saveSelection();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowColorPicker(!showColorPicker);
                    setShowBgColorPicker(false);
                  }}
                  className="px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center gap-1 bg-white hover:bg-blue-50 hover:border-blue-300"
                  title="Text Color"
                >
                  <span className="font-bold text-black">A</span>
                  <div
                    className="w-2 h-2 border border-gray-400 rounded-sm shadow-sm"
                    style={{ backgroundColor: textColor }}
                  ></div>
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-white border-2 border-blue-200 rounded-lg shadow-xl z-10 color-picker-dropdown">
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
                        '#00FFFF', '#FFA500', '#800080', '#008000', '#800000', '#000080'].map(color => (
                          <button
                            key={color}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.preventDefault();
                              changeTextColor(color);
                            }}
                            className="w-6 h-6 border-2 border-gray-300 rounded hover:scale-110 transition-transform shadow-sm hover:shadow-md"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                    </div>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => changeTextColor(e.target.value)}
                      className="w-full h-8 border-2 border-blue-200 rounded shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Background Color */}
              <div className="relative">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    saveSelection();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowBgColorPicker(!showBgColorPicker);
                    setShowColorPicker(false);
                  }}
                  className="px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center gap-1 bg-white hover:bg-blue-50 hover:border-blue-300"
                  title="Background Color"
                >
                  <span className="text-sm">🎨</span>
                  <div
                    className="w-2 h-2 border border-gray-400 rounded-sm shadow-sm"
                    style={{ backgroundColor: backgroundColor }}
                  ></div>
                </button>
                {showBgColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-white border-2 border-blue-200 rounded-lg shadow-xl z-10 color-picker-dropdown">
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {['#FFFFFF', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FFA500',
                        '#FFE4E1', '#E6E6FA', '#F0F8FF', '#F5F5DC', '#FFF8DC', '#F0FFF0'].map(color => (
                          <button
                            key={color}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.preventDefault();
                              changeBackgroundColor(color);
                            }}
                            className="w-6 h-6 border-2 border-gray-300 rounded hover:scale-110 transition-transform shadow-sm hover:shadow-md"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                    </div>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => changeBackgroundColor(e.target.value)}
                      className="w-full h-8 border-2 border-blue-200 rounded shadow-sm"
                    />
                  </div>
                )}
              </div>

              <div className="border-l-2 border-blue-300 h-6 mx-1"></div>

              {/* Superscript/Subscript */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('superscript');
                }}
                className={`px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 font-semibold ${getButtonState('superscript') ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'text-black bg-white hover:bg-blue-50 hover:border-blue-300'
                  }`}
                title="Superscript"
              >
                X²
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('subscript');
                }}
                className={`px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 font-semibold ${getButtonState('subscript') ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'text-black bg-white hover:bg-blue-50 hover:border-blue-300'
                  }`}
                title="Subscript"
              >
                X₂
              </button>

              <div className="border-l-2 border-blue-300 h-6 mx-1"></div>

              {/* Alignment */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('left');
                }}
                className="px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 bg-white hover:bg-blue-50 hover:border-blue-300 font-semibold text-black"
                title="Align Left (Ctrl+L)"
              >
                Left
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('center');
                }}
                className="px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 bg-white hover:bg-blue-50 hover:border-blue-300 font-semibold text-black"
                title="Center (Ctrl+E)"
              >
                Center
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('right');
                }}
                className="px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 bg-white hover:bg-blue-50 hover:border-blue-300 font-semibold text-black"
                title="Align Right (Ctrl+R)"
              >
                Right
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('justify');
                }}
                className="px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 bg-white hover:bg-blue-50 hover:border-blue-300 font-semibold text-black"
                title="Justify (Ctrl+J)"
              >
                Justify
              </button>

              <div className="border-l-2 border-blue-300 h-6 mx-1"></div>

              {/* Lists */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('list');
                }}
                className="px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 font-semibold bg-white hover:bg-blue-50 hover:border-blue-300 text-black"
                title="Bullet List"
              >
                • List
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('numbered');
                }}
                className="px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 font-semibold bg-white hover:bg-blue-50 hover:border-blue-300 text-black"
                title="Numbered List"
              >
                1. List
              </button>

              <div className="border-l-2 border-blue-300 h-6 mx-1"></div>

              {/* Voice Input */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  setShowVoiceInput(!showVoiceInput);
                }}
                className={`${getButtonClasses(showVoiceInput)} font-semibold`}
                title="Voice Input with Translation"
              >
                🎤 Voice
              </button>

              <div className={`border-l-2 h-6 mx-1 ${getSeparatorClasses()}`}></div>

              {/* Undo/Redo */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('undo');
                }}
                className="px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 bg-white hover:bg-blue-50 hover:border-blue-300 font-semibold text-black"
                title="Undo (Ctrl+Z)"
              >
                Undo
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  applyFormat('redo');
                }}
                className="px-2 py-1 text-xs border-2 border-blue-200 rounded transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 bg-white hover:bg-blue-50 hover:border-blue-300 font-semibold text-black"
                title="Redo (Ctrl+Y)"
              >
                Redo
              </button>
            </div>
          </div>

          {/* Voice Input Panel */}
          {showVoiceInput && (
            <div className="border-x border-gray-300 bg-gray-50 p-3">
              <VoiceInput
                onTextInsert={insertTextAtCursor}
                className="w-full"
              />
            </div>
          )}
        </>
      )}

      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        className={`w-full min-h-[300px] p-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical overflow-y-auto text-gray-900 ${readOnly ? 'bg-gray-50 rounded-lg' : 'rounded-b-lg bg-white'
          } ${!readOnly ? 'rounded-t-none' : 'rounded-t-lg'}`}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <div className="text-xs text-gray-500 mt-2">
        <p>
          <strong>Mouse Selection:</strong> Select text with mouse, then click toolbar buttons to apply formatting |
          <strong> Keyboard shortcuts:</strong> Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline), Ctrl+L (left), Ctrl+E (center), Ctrl+R (right), Ctrl+J (justify) |
          <strong> Voice Input:</strong> Click 🎤 Voice to speak in Urdu and get English text with auto-translation |
          <strong> WYSIWYG:</strong> Full Microsoft Word-like experience with proper text selection handling
        </p>
      </div>
    </div>
  );
}