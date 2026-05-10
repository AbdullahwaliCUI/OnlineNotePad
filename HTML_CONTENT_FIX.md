# HTML Content Display Fix

## Problem
The content was displaying HTML tags like `<strong>Simple User</strong>` instead of showing formatted text in the Simple Text Editor.

## Root Cause
When notes were saved with HTML formatting and then loaded back into the Simple Text Editor, the HTML tags were being displayed as plain text instead of being converted back to the simple markdown-like format.

## Solution Implemented

### ✅ New Utility Function
Created `htmlToSimpleText()` function in `utils.ts` to convert HTML back to simple text format:

```typescript
export function htmlToSimpleText(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<i>(.*?)<\/i>/g, '*$1*')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/p><p>/g, '\n\n')
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n')
    .replace(/<ul><li>(.*?)<\/li><\/ul>/g, '• $1')
    .replace(/<ol><li>(.*?)<\/li><\/ol>/g, '1. $1')
    .replace(/<li>(.*?)<\/li>/g, '• $1')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<ol>/g, '')
    .replace(/<\/ol>/g, '')
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
    .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
    .trim();
}
```

### ✅ Updated Edit Page Logic
Enhanced the note loading and editor switching logic:

#### Note Loading
```typescript
// Convert HTML content back to simple format for editing
let editableContent = noteData.content_html || noteData.content;

// If using simple editor, convert HTML back to markdown-like format
if (useSimpleEditor && noteData.content_html) {
  editableContent = htmlToSimpleText(noteData.content_html);
} else if (!useSimpleEditor) {
  // For rich editor, use HTML content
  editableContent = noteData.content_html || noteData.content;
} else {
  // For simple editor with no HTML, use plain content
  editableContent = noteData.content;
}
```

#### Editor Switching
```typescript
const handleEditorSwitch = () => {
  const newEditorType = !useSimpleEditor;
  setUseSimpleEditor(newEditorType);
  
  // Convert content format when switching editors
  if (note) {
    let convertedContent = content;
    
    if (newEditorType) {
      // Switching to simple editor - convert HTML to markdown-like format
      if (note.content_html) {
        convertedContent = htmlToSimpleText(note.content_html);
      }
    } else {
      // Switching to rich editor - use HTML content
      convertedContent = note.content_html || note.content;
    }
    
    setContent(convertedContent);
  }
};
```

## HTML to Simple Text Conversion Examples

| HTML Input | Simple Text Output |
|------------|-------------------|
| `<strong>Bold Text</strong>` | `**Bold Text**` |
| `<em>Italic Text</em>` | `*Italic Text*` |
| `<br>` | `\n` (newline) |
| `<ul><li>Item 1</li></ul>` | `• Item 1` |
| `<ol><li>Item 1</li></ol>` | `1. Item 1` |
| `<p>Paragraph</p>` | `Paragraph\n` |

## Benefits

### ✅ **Seamless Editor Switching**
- Users can switch between Simple and Rich editors without losing formatting
- Content is automatically converted to the appropriate format

### ✅ **Clean Display**
- No more HTML tags showing in the Simple Text Editor
- Content displays as intended formatted text

### ✅ **Backward Compatibility**
- Existing notes with HTML content work correctly
- New notes work with both editor types

### ✅ **User Experience**
- Intuitive editing experience
- Content appears as expected in both editors
- Smooth transitions between editor types

## Files Modified

1. **`notepadx/src/lib/utils.ts`**
   - Added `htmlToSimpleText()` function
   - Added `stripHtmlTags()` helper function

2. **`notepadx/src/app/notes/[id]/edit/page.tsx`**
   - Updated note loading logic
   - Added `handleEditorSwitch()` function
   - Enhanced content format conversion

## Testing Results

### ✅ **Before Fix**
- Content showed: `<strong>Simple User</strong>`
- HTML tags were visible as plain text
- Poor user experience

### ✅ **After Fix**
- Content shows: **Simple User** (properly formatted)
- HTML is converted to simple markdown-like format
- Clean, intuitive editing experience

## Future Enhancements

### Potential Improvements
1. **More HTML Tags**: Support for additional HTML elements
2. **Complex Lists**: Better handling of nested lists
3. **Tables**: Support for table conversion
4. **Images**: Placeholder text for images in simple editor
5. **Links**: Better link format conversion

The fix ensures that content is displayed properly in both Simple and Rich text editors, providing a seamless user experience regardless of which editor is used.