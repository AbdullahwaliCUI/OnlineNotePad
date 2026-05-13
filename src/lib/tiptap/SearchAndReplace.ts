import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';

export interface SearchAndReplaceOptions {
  searchClass: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    searchAndReplace: {
      setSearchTerm: (searchTerm: string) => ReturnType;
      replaceNext: (replaceWith: string) => ReturnType;
      replaceAll: (replaceWith: string) => ReturnType;
      clearSearch: () => ReturnType;
    };
  }
}

export interface SearchAndReplaceStorage {
  searchTerm: string;
  replaceTerm: string;
  results: { from: number; to: number }[];
  lastSearchTerm: string;
}

const SearchAndReplacePluginKey = new PluginKey('searchAndReplace');

interface FindResult {
  from: number;
  to: number;
}

function find(doc: ProsemirrorNode, searchTerm: string): FindResult[] {
  const results: FindResult[] = [];
  if (!searchTerm) return results;

  const textToSearch = searchTerm.toLowerCase();

  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      const text = node.text.toLowerCase();
      let startIndex = 0;
      let index = text.indexOf(textToSearch, startIndex);

      while (index !== -1) {
        results.push({
          from: pos + index,
          to: pos + index + textToSearch.length,
        });
        startIndex = index + textToSearch.length;
        index = text.indexOf(textToSearch, startIndex);
      }
    }
  });

  return results;
}

export const SearchAndReplace = Extension.create<SearchAndReplaceOptions, SearchAndReplaceStorage>({
  name: 'searchAndReplace',

  addOptions() {
    return {
      searchClass: 'search-result',
    };
  },

  addStorage() {
    return {
      searchTerm: '',
      replaceTerm: '',
      results: [],
      lastSearchTerm: '',
    };
  },

  addCommands() {
    return {
      setSearchTerm:
        (searchTerm: string) =>
        ({ editor }) => {
          (editor.storage as any).searchAndReplace.searchTerm = searchTerm;
          
          // Triggers a plugin update
          editor.view.dispatch(editor.state.tr.setMeta('searchAndReplace', { type: 'search' }));
          return true;
        },
        
      replaceNext:
        (replaceWith: string) =>
        ({ editor, dispatch }) => {
          const { results } = (editor.storage as any).searchAndReplace;
          if (results.length === 0) return false;

          // Replace the first one
          const firstResult = results[0];
          
          if (dispatch) {
            editor.view.dispatch(
              editor.state.tr
                .insertText(replaceWith, firstResult.from, firstResult.to)
                .setMeta('searchAndReplace', { type: 'replace' })
            );
          }
          return true;
        },
        
      replaceAll:
        (replaceWith: string) =>
        ({ editor, dispatch }) => {
          const { results } = (editor.storage as any).searchAndReplace;
          if (results.length === 0) return false;

          if (dispatch) {
            let tr = editor.state.tr;
            // Iterate backwards so replacing doesn't shift positions of subsequent matches
            for (let i = results.length - 1; i >= 0; i--) {
              const result = results[i];
              tr = tr.insertText(replaceWith, result.from, result.to);
            }
            editor.view.dispatch(tr.setMeta('searchAndReplace', { type: 'replace' }));
          }
          return true;
        },
        
      clearSearch:
        () =>
        ({ editor }) => {
          (editor.storage as any).searchAndReplace.searchTerm = '';
          editor.view.dispatch(editor.state.tr.setMeta('searchAndReplace', { type: 'clear' }));
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    const { searchClass } = this.options;

    return [
      new Plugin({
        key: SearchAndReplacePluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldState) {
            const searchTerm = (editor.storage as any).searchAndReplace.searchTerm;
            
            // Map the old decorations if no direct search change happened
            const meta = tr.getMeta('searchAndReplace');
            if (!meta && !tr.docChanged && (editor.storage as any).searchAndReplace.lastSearchTerm === searchTerm) {
              return oldState.map(tr.mapping, tr.doc);
            }

            (editor.storage as any).searchAndReplace.lastSearchTerm = searchTerm;
            
            if (!searchTerm) {
              (editor.storage as any).searchAndReplace.results = [];
              return DecorationSet.empty;
            }

            const results = find(tr.doc, searchTerm);
            (editor.storage as any).searchAndReplace.results = results;

            const decorations = results.map((res) =>
              Decoration.inline(res.from, res.to, {
                class: searchClass,
                style: 'background-color: #fef08a; border-radius: 2px; padding: 0 2px;' // Tailwind yellow-200
              })
            );

            return DecorationSet.create(tr.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
