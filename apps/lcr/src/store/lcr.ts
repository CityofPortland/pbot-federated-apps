import { MaximoUser } from './../types/pagedMaximoUsers';
import { PagedCopActiveComputer } from './../types/pagedCopActiveComputers';
import { LcrPaginatedData } from '../types/lcrPaginatedData';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useLcrStore = defineStore('lcr', {
  state: () => ({
    pagedMaximoUsers: null as LcrPaginatedData<MaximoUser> | null,
    pagedPbotLcrSchedule: [],
    pagedCopActiveComputers: [],
    activeComputer: null as PagedCopActiveComputer | null,
  }),
  getters: {
    getMaximoUsers(state) {
      return state.pagedMaximoUsers;
    },
    getPbotLcrSchedule(state) {
      return state.pagedPbotLcrSchedule;
    },
  },

  actions: {
    async fetchMaximoUsers(search: MaximoUser, pageNumber: number) {
      const url = new URL(
        'https://localhost:7110/api/workstation/GetPaginatedMaximoUsers'
      );

      for (const property in search) {
        url.searchParams.append(
          `${property}`,
          `${search[property as keyof MaximoUser]}`
        );
      }

      url.searchParams.append(`pageNumber`, pageNumber.toString());

      try {
        console.log('fetchMaximoUsers from API', url.toString());
        const res = await axios.get(url.toString());
        this.pagedMaximoUsers = res.data;
      } catch (error) {
        console.log('Error while fetching Maximo users: ', error);
      }
    },
    async fetchCopActiveComputer(computerNameSearch: string) {
      const url = new URL(
        'https://localhost:7110/api/Workstation/GetPaginatedCopActiveComputers'
      );

      url.searchParams.append('ComputerName', computerNameSearch);
      url.searchParams.append(`pageNumber`, '1');
      url.searchParams.append(`totalRecords`, '1');

      try {
        console.log('fetchCopActiveComputer from API', url.toString());
        const res = await axios.get(url.toString());
        this.activeComputer = res.data.data[0];
      } catch (error) {
        console.log(
          `Error in fetchCopActiveComputer: ${computerNameSearch} `,
          error
        );
      }
    },
    async fetchPbotLcrSchedule(primaryUser: string | null) {
      let url =
        'https://localhost:7110/api/workstation/GetPaginatedPbotLcrSchedule?pageNumber=1&pageSize=20';

      if (primaryUser) {
        url = url + '&PrimaryUser=' + primaryUser;
      }

      try {
        const res = await axios.get(url);
        this.pagedPbotLcrSchedule = res.data.data;
      } catch (error) {
        console.log(
          'Error while fetching Pbot Lcr Schedule for ',
          primaryUser,
          ': ',
          error
        );
      }
    },
    async fetchCopActiveComputers(primaryUser: string | null) {
      let url =
        'https://localhost:7110/api/workstation/GetPaginatedCopActiveComputers?pageNumber=7&pageSize=20';

      if (primaryUser) {
        url = url + '&PrimaryUser=' + primaryUser;
      }

      try {
        const res = await axios.get(url);
        this.pagedCopActiveComputers = res.data.data;
        console.log(this.pagedCopActiveComputers);
      } catch (error) {
        console.log(
          'Error while fetching Cop Active Computers for ',
          primaryUser,
          ': ',
          error
        );
      }
    },
  },
});
