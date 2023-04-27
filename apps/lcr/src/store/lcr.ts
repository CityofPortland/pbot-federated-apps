import { MaximoUser, PagedMaximoUsers } from './../types/pagedMaximoUsers';
import { CopActiveComputers, PagedCopActiveComputer } from './../types/pagedCopActiveComputers';
import { LcrPaginatedData } from '../types/lcrPaginatedData';
import { defineStore } from 'pinia';
import axios from 'axios';
import { PagedMaximoUsers, MaximoUser } from '../types/pagedMaximoUsers';

export const useLcrStore = defineStore('lcr', {
  state: () => ({
    pagedMaximoUsers: null as PagedMaximoUsers | null,
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
        'https://localhost:7110/api/workstation/GetPaginatedMaximoUsers'
      );

      for (const property in search) {
        url.searchParams.append(`${property}`, `${search[property]}`);
      }

      url.searchParams.append(`pageNumber`, pageNumber.toString());

      try {
        //console.log('fetchMaximoUsers from API', url.toString());
        const res = await axios.get(url.toString());
        this.pagedMaximoUsers = res.data;
        console.log('Fetch results: ', this.pagedMaximoUsers.totalRecords.toString());
        console.log('Fetch devices: ', this.pagedMaximoUsers.data[0].computerNames);
        console.log('Fetch displayname: ', this.pagedMaximoUsers.data[0].displayName);
      } catch (error) {
        console.log('Error while fetching Maximo users: ', error);
      }
    },
    async fetchCopActiveComputer(computerNameSearch: string) {
      const url = new URL(
        'https://localhost:7110/api/Workstation/GetCopActiveComputer'
      );

      url.searchParams.append('computerName', computerNameSearch);
      //url.searchParams.append(`pageNumber`, '1');
      //url.searchParams.append(`totalRecords`, '1');

      try {
        //console.log('fetchCopActiveComputer from API', url.toString());
        const res = await axios.get(url.toString());
        this.activeComputer = res.data;
      } catch (error) {
        console.log(
          `Error in fetchCopActiveComputer: ${computerNameSearch} `,
          error
        );
      }
    },
    async fetchMaximoUser(maximoUserSearch: string) {
      const url = new URL(
        'https://localhost:7110/api/Workstation/GetMaximoUser'
      );

      url.searchParams.append('maximoUser', maximoUserSearch);

      try {
        console.log('fetchMaximoUser from API', url.toString());
        const res = await axios.get(url.toString());
        this.activeMaximoUser = res.data;
      } catch (error) {
        console.log(`Error in fetchMaximoUser: ${maximoUserSearch} `, error);
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
    async fetchCopActiveComputers(search: CopActiveComputers,  pageNumber: number) {
      let url = new URL(
        'https://localhost:7110/api/workstation/GetPaginatedCopActiveComputers'
        );
      for (const property in search) {
        url.searchParams.append(`${property}`, `${search[property]}`);
      }

      url.searchParams.append(`pageNumber`, pageNumber.toString());

      try {
        console.log('fetchCopActiveComputers from API', url.toString());
        const res = await axios.get(url.toString());
        this.pagedCopActiveComputers = res.data;
        console.log('CopActiveComputers Data: ',this.pagedCopActiveComputers.data[0]);
      } catch (error) {
        console.log('Error while fetching Cop Active Computers for ', error);
      }
    },
    async updateNoteField(
      computerName: string,
      newNote: string
    ): Promise<number> {
      const url = new URL(
        `https://localhost:7110/api/workstation/updateNote/${computerName}`
      );

      try {
        const params = new URLSearchParams();
        params.append('newNote', newNote);

        await axios.post(url.toString(), params).then(response => {
          console.log('done saving.', response.status);
          return response.status;
        });
      } catch (error) {
        console.log('Error while fetching Maximo users: ', error);
      }
      return 500;
    },
  },
});
