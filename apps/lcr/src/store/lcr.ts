import { MaximoUser } from './../types/pagedMaximoUsers';
import {
  PagedCopActiveComputer,
  CopActiveComputer,
} from './../types/pagedCopActiveComputers';
import { LcrPaginatedData } from '../types/lcrPaginatedData';
import {
  PbotLcrSchedule,
  PbotLcrScheduleSearchFilter,
} from '../types/pagedPbotLcrSchedule';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useLcrStore = defineStore('lcr', {
  persist: true,
  state: () => ({
    pagedMaximoUsers: null as LcrPaginatedData<MaximoUser> | null,
    pbotLcrscheduleDateLastRefreshed: new Date() as Date,
    pbotLcrSchedulePaged: null as LcrPaginatedData<PbotLcrSchedule> | null,
    pbotLcrScheduleSearch: {
      computerName: '',
      primaryUser: '',
      lastLogonUser: '',
      quarterOrderDate: '',
    } as PbotLcrScheduleSearchFilter,
    pbotLcrSchedulePageNumber: 1 as number,
    pagedCopActiveComputers: [],
    activeComputer: null as PagedCopActiveComputer | null,
    activeMaximoUser: null as MaximoUser | null,
  }),
  getters: {
    getMaximoUsers(state) {
      return state.pagedMaximoUsers;
    },
    getPbotLcrSchedule(state) {
      return state.pbotLcrSchedulePaged;
    },
    getPbotLcrScheduleSearch(state) {
      return state.pbotLcrScheduleSearch;
    },
  },

  actions: {
    getPbotLcrScheduleMinutesSinceLastSearch() {
      return (
        (Date.now() -
          new Date(this.pbotLcrscheduleDateLastRefreshed).getTime()) /
        1000 /
        60
      );
    },

    setPbotLcrScheduleSearch(search: PbotLcrScheduleSearchFilter) {
      this.pbotLcrScheduleSearch = search;
    },

    async fetchLcrSchedule(
      search: PbotLcrScheduleSearchFilter,
      pageNumber: number
    ) {
      // update last refreshed time //
      this.pbotLcrscheduleDateLastRefreshed = new Date();

      const url = new URL(
        import.meta.env.VITE_BASE_URL + '/GetPaginatedPbotLcrSchedule'
      );

      for (const property in search) {
        url.searchParams.append(
          `${property}`,
          `${search[property as keyof PbotLcrScheduleSearchFilter]}`
        );
      }

      //url.searchParams.append('PageSize', '50');
      url.searchParams.append('pageNumber', pageNumber.toString());

      try {
        if (import.meta.env.VITE_API_DEBUG === '1') {
          console.log('fetchLcrSchedule: ', url.toString());
        }
        const res = await axios.get(url.toString());
        this.pbotLcrSchedulePaged = res.data;
      } catch (error) {
        console.log('Error while fetching Maximo users: ', error);
      }
    },
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
        if (import.meta.env.VITE_API_DEBUG === '1') {
          console.log('fetchMaximoUsers: ', url.toString());
        }
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
        if (import.meta.env.VITE_API_DEBUG === '1') {
          console.log('fetchCopActiveComputer: ', url.toString());
        }
        const res = await axios.get(url.toString());
        this.activeComputer = res.data;
      } catch (error) {
        console.log(
          `Error in fetchCopActiveComputer: ${computerNameSearch} `,
          error
        );
      }
    },
    async fetchMaximoUser(userName: string) {
      const url = new URL(import.meta.env.VITE_BASE_URL + '/GetMaximoUser');

      url.searchParams.append('username', userName);

      try {
        if (import.meta.env.VITE_API_DEBUG === '1') {
          console.log('fetchMaximoUser: ', url.toString());
        }
        const res = await axios.get(url.toString());
        this.activeMaximoUser = res.data;
      } catch (error) {
        console.log(`Error in fetchMaximoUser: ${userName} `, error);
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
        if (import.meta.env.VITE_API_DEBUG === '1') {
          console.log('fetchCopActiveComputersByUsername: ', url.toString());
        }
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

        const response = await axios
          .post(url.toString(), params)
          .then(response => {
            console.log('done saving.', response.status);
            return response.status;
          });

        return response;
      } catch (error) {
        console.log('Error while fetching Maximo users: ', error);
      }
      return 500;
    },
  },
});
