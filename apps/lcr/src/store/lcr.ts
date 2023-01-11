// stores/counter.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { PagedMaximoUsers, MaximoUser } from '../types/pagedMaximoUsers';

export const useLcrStore = defineStore('lcr', {
  state: () => ({
    pagedMaximoUsers: [],
  }),
  getters: {
    getMaximoUsers(state) {
      return state.pagedMaximoUsers;
    },
  },

  actions: {
    async fetchMaximoUsers(lastName: string | null) {
      let url =
        'https://localhost:7110/api/workstation/GetPaginatedMaximoUsers?pageNumber=1&pageSize=20';

      if (lastName) {
        url = url + '&lastName=' + lastName;
      }

      try {
        const res = await axios.get(url);
        this.pagedMaximoUsers = res.data;
      } catch (error) {
        console.log('Error while fetching Maximo users: ', error);
      }
    },
  },
});
