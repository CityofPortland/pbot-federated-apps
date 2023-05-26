import { MaximoUser } from './../types/pagedMaximoUsers';
import { 
  PagedCopActiveComputer,
  CopActiveComputer,
} from './../types/pagedCopActiveComputers';
import { LcrPaginatedData } from '../types/lcrPaginatedData';
import {
  PbotLcrScheduleIndex,
  PbotLcrScheduleSearchFilter,
} from '../types/pagedPbotLcrSchedule';

import {
  ActiveComputersSearchFilter,
  PagedCopActiveComputers,
} from '../types/pagedCopActiveComputers';

import { defineStore } from 'pinia';
import axios from 'axios';

export const useLcrStore = defineStore('lcr', {
  persist: true,
  state: () => ({
    homeMaximoUserSearch: {
      pernr: '',
      userName: '',
      personId: '',
      displayName: '',
      firstName: '',
      lastName: '',
      costCenter: '',
      orgUnit: '',
      emailAddress: '',
      computerNames: '',
      pbotGroup: '',
      pbotDivision: '',
      section: '',
      orgUnitDescription: '',
    } as MaximoUser,
    homePageNumber: 1 as number,
    pagedMaximoUsers: null as LcrPaginatedData<MaximoUser> | null,
    pbotLcrscheduleDateLastRefreshed: new Date() as Date,
    pbotLcrSchedulePaged: null as LcrPaginatedData<PbotLcrScheduleIndex> | null,
    pbotLcrScheduleSearch: {
      computerName: '',
      primaryUser: '',
      lastLogonUser: '',
      quarterOrderDate: '',
    } as PbotLcrScheduleSearchFilter,
    pbotLcrSchedulePageNumber: 1 as number,
    pagedCopActiveComputers: [],
    activeComputersSearch: { computerName: '' } as ActiveComputersSearchFilter,
    activeComputers: null as PagedCopActiveComputers | null,
    activeComputersPageNumber: 1 as number,
    activeComputer: null as CopActiveComputer | null,
    activeMaximoUser: null as MaximoUser | null,
    pbotDivisions: [] as string[],
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
    async fetchPbotDivisions() {
      // update last refreshed time //
      this.pbotLcrscheduleDateLastRefreshed = new Date();

      const url = new URL(import.meta.env.VITE_BASE_URL + '/getPbotDivisions');

      if (import.meta.env.VITE_API_DEBUG === '1') {
        console.log('fetchPbotDivisions: ', url.toString());
      }

      try {
        const res = await axios.get(url.toString());
        this.pbotDivisions = res.data;
      } catch (error) {
        console.log('Error while fetching PBOT divisions: ', error);
      }
    },

    async fetchActiveComputers(
      search: ActiveComputersSearchFilter,
      pageNumber: number
    ) {
      // update last refreshed time //
      this.pbotLcrscheduleDateLastRefreshed = new Date();

      const url = new URL(
        import.meta.env.VITE_BASE_URL + '/GetPaginatedCopActiveComputers'
      );

      for (const property in search) {
        url.searchParams.append(
          `${property}`,
          `${search[property as keyof ActiveComputersSearchFilter]}`
        );
      }

      url.searchParams.append('PageSize', '30');
      url.searchParams.append('pageNumber', pageNumber.toString());

      try {
        if (import.meta.env.VITE_API_DEBUG === '1') {
          console.log('fetchActiveComputers: ', url.toString());
        }
        const res = await axios.get(url.toString());
        this.activeComputers = res.data;
      } catch (error) {
        console.log('Error while fetching Maximo users: ', error);
      }
    },

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

      if (import.meta.env.VITE_API_DEBUG === '1') {
        console.log('fetchLcrSchedule: ', url.toString());
      }

      try {
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
