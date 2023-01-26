import { defineStore } from 'pinia';
import { Sign } from '../types';

export const useStore = defineStore('sign-library', {
  state: () => ({
    data: {
      signs: new Array<Partial<Sign>>(),
    },
    errors: new Array<unknown>(),
  }),
  getters: {
    sign:
      state =>
      (code: string): Partial<Sign> | undefined => {
        const sign = state.data.signs.find(s => s.code == code);

        return sign ? { ...sign } : undefined;
      },
  },
  actions: {
    async getSigns() {
      this.data.signs = [
        {
          _created: new Date(),
          _changed: new Date(),
          _revisions: [
            {
              _changed: new Date(),
              code: 'R1000',
              legend: 'Stop sign',
              shape: 'octagon',
              status: 'in use',
            },
          ],
          code: 'R1000',
          legend: 'Stop sign',
          shape: 'octagon',
          status: 'in use',
        },
      ];
    },
    async addRevision(revision: Partial<Sign>) {
      const { code, ...sign } = revision;
      const _changed = new Date();

      if (!code) {
        this.errors.push(new Error('Must have code to add revision'));
        return;
      }

      let existing = this.sign(code);

      if (!existing) {
        existing = { code, ...sign, _created: _changed };
        this.data.signs.push(existing);
      }

      const _revisions = existing._revisions ? [...existing._revisions] : [];
      _revisions.push({ ...sign, _changed });

      this.data.signs.splice(
        this.data.signs.findIndex(s => s.code == code),
        1,
        { ...existing, ...sign, _changed, _revisions }
      );

      return existing;
    },
  },
});
