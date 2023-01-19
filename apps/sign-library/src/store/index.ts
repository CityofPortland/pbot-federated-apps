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
    sign: state => (code: string) => {
      const sign = state.data.signs.find(s => s.code == code);

      if (!sign) throw new Error(`Sign with code '${code}' does not exist!`);

      return { ...sign };
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
    async addRevision(sign: Partial<Sign>) {
      let existing = this.data.signs.find(s => s.code == sign.code);

      if (!existing) {
        existing = { ...sign, _created: new Date() };
        this.data.signs.push(existing);
      }

      const revisions = existing._revisions ? [...existing._revisions] : [];
      revisions.push(sign);

      Object.assign(existing, sign, {
        _changed: new Date(),
        _revisions: [...revisions],
      });

      return existing;
    },
  },
});
