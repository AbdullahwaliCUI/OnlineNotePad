# React-Quill Configuration

## Overview
The NotepadX app uses React-Quill as the rich text editor with custom configuration to ensure security and provide a clean user experience.

## Features Implemented

### ✅ Custom Link Dialog
- **Feature**: Custom "Insert URL" dialog for adding hyperlinks
- **Usage**: Select text and click the link button in the toolbar
- **Implementation**: Custom handler that opens a modal dialog for URL input

### ✅ Disabled Image/Video Uploads
- **Security**: Prevents users from uploading images or videos
- **Implementation**: 
  - Removed image/video buttons from toolbar
  - Disabled `imageResize` and `imageDrop` modules
  - CSS rules hide any image/video buttons that might appear

### ✅ Content Sanitization
- **Security**: All content is sanitized using DOMPurify before saving
- **Features**:
  - Removes dangerous HTML elements and attributes
  - Automatically adds `target="_blank"` and `rel="noopener noreferrer"` to external links
  - Filters out script tags, event handlers, and other XSS vectors

### ✅ Limited Toolbar
- **Toolbar includes only**:
  - Font size selector (small, normal, large, huge)
  - Bold and italic formatting
  - Ordered and unordered lists
  - Link insertion
  - Clean formatting button

### ✅ Paste Content Sanitization
- **Feature**: Pasted content is automatically sanitized
- **Implementation**: Custom clipboard matchers remove dangerous elements from pasted HTML

## File Structure

```
src/
├── components/ui/
│   └── RichTextEditor.tsx     # Main rich text editor component
├── lib/
│   └── utils.ts               # Sanitization functions
└── app/
    ├── notes/new/page.tsx     # New note creation
    ├── notes/[id]/edit/page.tsx # Note editing
    └── test-editor/page.tsx   # Test page for editor functionality
```

## Usage Examples

### Basic Usage
```tsx
import RichTextEditor from '@/components/ui/RichTextEditor';

function MyComponent() {
  const [content, setContent] = useState('');
  
  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
    />
  );
}
```

### With Sanitization
```tsx
import { sanitizeHtml } from '@/lib/utils';

const handleSave = async () => {
  const sanitizedContent = sanitizeHtml(content);
  // Save sanitizedContent to database
};
```

## Security Features

1. **XSS Prevention**: All HTML content is sanitized using DOMPurify
2. **Safe Links**: External links automatically get security attributes
3. **No File Uploads**: Image and video uploads are completely disabled
4. **Content Filtering**: Only safe HTML tags and attributes are allowed

## Testing

Visit `/test-editor` to test the rich text editor functionality:
- Test formatting options
- Try the link insertion dialog
- Verify paste content sanitization
- Check that image/video uploads are disabled

## Configuration Details

### Allowed HTML Tags
- Text formatting: `p`, `br`, `strong`, `em`, `u`, `s`
- Lists: `ol`, `ul`, `li`
- Headings: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- Other: `blockquote`, `code`, `pre`, `a`, `span`, `div`

### Allowed Attributes
- `class`: For styling
- `href`: For links
- `target`: For link behavior
- `rel`: For link security
- `style`: Limited to safe CSS properties

### Forbidden Elements
- `script`, `object`, `embed`, `iframe`
- `form`, `input`
- `img`, `video`, `audio`
- Event handlers (`onclick`, `onload`, etc.)