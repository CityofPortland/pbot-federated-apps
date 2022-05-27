import { defineStore } from 'pinia';

export const useHeaderStore = defineStore('header', {
  state: () => ({
    header: {
      color: 'transparent',
    },
  }),
  actions: {
    setHeader(header: { color: string }) {
      this.header = { ...this.header, ...header };
    },
  },
});
