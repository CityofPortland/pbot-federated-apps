import { MaximoUser } from './../types/pagedMaximoUsers';
import {
  PagedCopActiveComputer,
  CopActiveComputer,
} from './../types/pagedCopActiveComputers';
import { LcrPaginatedData } from '../types/lcrPaginatedData';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useLcrStore = defineStore('lcr', {
  state: () => ({
    pagedMaximoUsers: null as LcrPaginatedData<MaximoUser> | null,
    pagedPbotLcrSchedule: [],
    pagedCopActiveComputers: [],
    activeComputer: null as PagedCopActiveComputer | null,
    activeMaximoUser: null as MaximoUser | null,
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
        import.meta.env.VITE_BASE_URL + '/GetPaginatedMaximoUsers'
      );

      for (const property in search) {
        url.searchParams.append(
          `${property}`,
          `${search[property as keyof MaximoUser]}`
        );
      }

      url.searchParams.append(`pageNumber`, pageNumber.toString());

      try {
        //console.log('fetchMaximoUsers from API', url.toString());
        const res = await axios.get(url.toString());
        this.pagedMaximoUsers = res.data;
      } catch (error) {
        console.log('Error while fetching Maximo users: ', error);
      }
    },
    async fetchCopActiveComputer(computerNameSearch: string) {
      const url = new URL(
        import.meta.env.VITE_BASE_URL + '/GetCopActiveComputer'
      );

      url.searchParams.append('computerName', computerNameSearch);

      try {
        //console.log('fetchCopActiveComputer from API', url.toString());
        const res = await axios.get(url.toString());
        this.activeComputer = res.data;
      } catch (error) {
        //console.log(`Error in fetchCopActiveComputer: ${computerNameSearch} `, error);
      }
    },
    async fetchMaximoUser(userName: string) {
      const url = new URL(import.meta.env.VITE_BASE_URL + '/GetMaximoUser');

      url.searchParams.append('username', userName);

      try {
        //console.log('fetchMaximoUser from API', url.toString());
        const res = await axios.get(url.toString());
        this.activeMaximoUser = res.data;
      } catch (error) {
        console.log(`Error in fetchMaximoUser: ${userName} `, error);
      }
    },
    async fetchPbotLcrSchedule(primaryUser: string | null) {
      let url =
        import.meta.env.VITE_BASE_URL +
        '/GetPaginatedPbotLcrSchedule?pageNumber=1&pageSize=20';

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
        import.meta.env.VITE_BASE_URL +
        '/GetPaginatedCopActiveComputers?pageNumber=7&pageSize=20';

      if (primaryUser) {
        url = url + '&PrimaryUser=' + primaryUser;
      }

      try {
        const res = await axios.get(url);
        this.pagedCopActiveComputers = res.data.data;
      } catch (error) {
        console.log(
          'Error while fetching Cop Active Computers for ',
          primaryUser,
          ': ',
          error
        );
      }
    },
    async fetchCopActiveComputersByUsername(
      primaryUsername: string
    ): Promise<CopActiveComputer[]> {
      const url = new URL(
        import.meta.env.VITE_BASE_URL +
          `/GetCopActiveComputersByUsername/${primaryUsername}`
      );

      try {
        //console.log('fetchCopActiveComputers from API', url.toString());
        const res = await axios.get(url.toString());
        return res.data;
      } catch (error) {
        console.log('Error while fetching Cop Active Computers for ', error);
      }

      const emptyArr: CopActiveComputer[] = [];
      return emptyArr;
    },
    async updateNoteField(
      computerName: string,
      newNote: string
    ): Promise<number> {
      const url = new URL(
        import.meta.env.VITE_BASE_URL + `/updateNote/${computerName}`
      );

      try {
        const params = new URLSearchParams();
        params.append('newNote', newNote);

        await axios.post(url.toString(), params).then(response => {
          //console.log('done saving.', response.status);
          return response.status;
        });
      } catch (error) {
        console.log('Error while fetching Maximo users: ', error);
      }
      return 500;
    },
  },
});
