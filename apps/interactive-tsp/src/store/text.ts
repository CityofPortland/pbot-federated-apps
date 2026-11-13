import { defineStore } from 'pinia';
import lunr from 'lunr';

import { query } from '../queries/query';

import { customStemming } from './utils';
import { useMessageStore } from './message';

export interface TextSection {
  id: string;
  name: string;
  number: number;
  tree: number[];
  depth: number;
  content: string;
  sections?: TextSection[];
}

function strip(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

function traverse(section: TextSection, sections: TextSection[]) {
  return sections
    .filter(s => s.depth == section.depth + 1)
    .filter(s => section.tree.every((value, index) => value === s.tree[index]))
    .reduce((prev, curr) => {
      curr.sections = traverse(curr, sections).sort(
        (a, b) => a.number - b.number
      );
      prev.push(curr);
      return prev;
    }, new Array<TextSection>());
}

export const useTextStore = defineStore('text', {
  state: () => ({
    sections: undefined as TextSection[] | undefined,
    index: undefined as lunr.Index | undefined,
    candidates: undefined as TextSection[] | undefined,
  }),
  getters: {
    sectionTree(state) {
      if (state.sections) {
        return state.sections
          .reduce((prev, curr, _index, sections) => {
            if (curr.depth == 1) {
              curr.sections = traverse(curr, sections).sort(
                (a, b) => a.number - b.number
              );

              prev.push(curr);
            }
            return prev;
          }, new Array<TextSection>())
          .sort((a: TextSection, b: TextSection) => a.number - b.number);
      }

      return undefined;
    },
  },
  actions: {
    async findText() {
      if (this.sections) return;

      const messages = useMessageStore();
      messages.addMessage({
        id: 'text-retrieving',
        type: 'info',
        text: 'Retrieving text...',
        dismissible: false,
      });

      try {
        const res = await query<{ document?: TextSection[] }>({
          field: 'document',
          args: { name: 'transportation-system-plan' },
          select: {
            id: true,
            name: true,
            number: true,
            tree: true,
            depth: true,
            content: true,
          },
        });

        if (res.errors) {
          messages.addMessage({
            id: 'text-graphql-errors',
            type: 'warning',
            text: 'The text may contain errors...',
            dismissible: true,
          });
        }

        if (res.data?.document) {
          this.sections = res.data.document;

          this.index = lunr(function () {
            this.ref('id');
            this.field('name');
            this.field('content');

            this.use(customStemming);

            res.data?.document?.forEach((doc: TextSection) => {
              const { id, name, content } = doc;
              this.add({
                id,
                name,
                content: strip(content),
              });
            });
          });
        }
      } catch {
        messages.addMessage({
          id: 'text-error-retrieving',
          type: 'error',
          text: 'Error retrieving text!',
          dismissible: true,
        });
      }

      messages.removeMessage('text-retrieving');
    },
    searchIndex(searchQuery: string) {
      this.candidates = this.index
        ?.search(searchQuery)
        .map(val => {
          const s = this.sections?.find(sec => sec.id == val.ref);

          if (s) {
            const { id, name, content } = s;

            return {
              id,
              name,
              content: strip(content)
                .replace(name, ' ')
                .split(' ')
                .slice(0, 30)
                .join(' ')
                .concat('...'),
            } as TextSection;
          }

          return undefined;
        })
        .filter((s): s is TextSection => !!s);
    },
  },
});
