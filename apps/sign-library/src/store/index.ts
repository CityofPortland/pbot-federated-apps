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
    sign: state => (code: string) => state.data.signs.find(s => s.code == code),
  },
  actions: {
    async getSigns() {
      this.data.signs = [
        {
          _created: new Date(),
          _changed: new Date(),
          code: 'R1000',
          legend: 'Stop sign',
          shape: 'octagon',
          status: 'in use',
        },
      ];
    },
    async indexSign(sign: Partial<Sign>, overwrite = false) {
      console.debug('In indexSave!', JSON.stringify(sign));
      let existing = this.data.signs.find(s => s.code == sign.code);

      if (existing) {
        if (overwrite) {
          existing = { ...sign, ...existing };
          return existing;
        } else {
          throw new Error(`A sign already exists with code '${sign.code}'`);
        }
      } else {
        this.data.signs.push(sign);
      }

      return sign;
    },
  },
});
