import { Mark, mergeAttributes } from '@tiptap/core';

export interface CommentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Set a comment mark
       */
      setComment: (commentId: string) => ReturnType;
      /**
       * Unset a comment mark
       */
      unsetComment: (commentId: string) => ReturnType;
    };
  }
}

export const CommentMark = Mark.create<CommentOptions>({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'bg-orange-200 border-b-2 border-orange-400 cursor-pointer hover:bg-orange-300 transition-colors',
      },
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) {
            return {};
          }
          return {
            'data-comment-id': attributes.commentId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setComment:
        (commentId: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { commentId });
        },
      unsetComment:
        (commentId: string) =>
        ({ editor, tr, dispatch }) => {
          if (!dispatch) return false;
          
          let hasMark = false;
          
          // Find all marks with this ID and remove them
          editor.state.doc.descendants((node, pos) => {
            if (node.isText && node.marks.length > 0) {
              node.marks.forEach(mark => {
                if (mark.type.name === this.name && mark.attrs.commentId === commentId) {
                  hasMark = true;
                  tr.removeMark(pos, pos + node.nodeSize, mark.type);
                }
              });
            }
          });
          
          return hasMark;
        },
    };
  },
});
