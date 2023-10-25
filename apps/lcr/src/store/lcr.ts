import {
  MaximoUser,
  MaximoUserSearchFilter,
} from './../types/pagedMaximoUsers';
import {
  ActiveComputersSearchFilter,
  PagedCopActiveComputers,
  CopActiveComputer,
} from './../types/pagedCopActiveComputers';
import { LcrPaginatedData } from '../types/lcrPaginatedData';
import {
  PbotLcrScheduleIndex,
  PbotLcrScheduleSearchFilter,
} from '../types/pagedPbotLcrSchedule';

import { defineStore } from 'pinia';
import axios from 'axios';
// import exportFromJSON from 'export-from-json';

// export const excelParser = () => {
//   function exportDataFromJSON(data, newFileName, fileExportType) {
//     if (!data) return;
//     try {
//       const fileName = newFileName || 'exported-data';
//       const exportType = exportFromJSON.types[fileExportType || "xls"];
//       exportFromJSON({ data, fileName, exportType });
//     } catch (e) {
//       throw new Error('Parsing failed!');
//     }
//   }

//   return {
//     exportDataFromJSON,
//   };
// };

export const useLcrStore = defineStore('lcr', {
  persist: true,
  state: () => ({
    homeMaximoUserSearch: {
      userName: '',
      firstName: '',
      lastName: '',
      device: '',
      pbotGroup: '',
      pbotDivision: '',
      section: '',
      orgUnit: '',
      costCenter: '',
      computerNames: '',
      orderBy: '',
      orderDirection: '',
    } as MaximoUserSearchFilter,
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
    activeMaximoUser: null as MaximoUser | null,
    pbotDivisions: [] as string[],
    pbotGroups: [] as string[],
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

    async fetchPbotGroups() {
      // update last refreshed time //
      this.pbotLcrscheduleDateLastRefreshed = new Date();

      const url = new URL(import.meta.env.VITE_BASE_URL + '/getPbotGroups');

      if (import.meta.env.VITE_API_DEBUG === '1') {
        console.log('fetchPbotGroups: ', url.toString());
      }

      try {
        const res = await axios.get(url.toString());
        this.pbotGroups = res.data;
      } catch (error) {
        console.log('Error while fetching PBOT groups: ', error);
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
    async fetchMaximoUsers(search: MaximoUserSearchFilter, pageNumber: number) {
      const url = new URL(
        import.meta.env.VITE_BASE_URL + '/GetPaginatedMaximoUsers'
      );

      for (const property in search) {
        url.searchParams.append(
          `${property}`,
          `${search[property as keyof MaximoUserSearchFilter]}`
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
    async fetchCopActiveComputer(
      computerNameSearch: string
    ): Promise<CopActiveComputer | null> {
      const url = new URL(
        import.meta.env.VITE_BASE_URL + '/GetCopActiveComputer'
      );

      url.searchParams.append('computerName', computerNameSearch);

      try {
        if (import.meta.env.VITE_API_DEBUG === '1') {
          console.log('fetchCopActiveComputer: ', url.toString());
        }
        const res = await axios.get(url.toString());
        return res.data;
      } catch (error) {
        console.log(
          `Error in fetchCopActiveComputer: ${computerNameSearch} `,
          error
        );
      }

      return null;
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
    getDomainValues(domainName: string): string[] {
      if (domainName == 'wsReplacementStatus') {
        return [
          'Current',
          'Due',
          'In Progress',
          'Ordered',
          'Delivered',
          'Break Fix',
          'Retired',
        ];
      } else if (domainName == 'sharedDeviceOptions') {
        return [
          'Assigned to User',
          'Shared Device',
          'Conference Room',
          'Other (See Notes)',
        ];
      }
      return [''];
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
            return response.status;
          });

        return response;
      } catch (error) {
        console.log('Error while fetching Maximo users: ', error);
      }
      return 500;
    },
    async updateComputerStatus(
      computerName: string,
      newStatus: string
    ): Promise<number> {
      const url = new URL(
        import.meta.env.VITE_BASE_URL + `/updateComputerStatus/${computerName}`
      );

      try {
        const params = new URLSearchParams();
        params.append('newStatus', newStatus);

        const response = await axios
          .post(url.toString(), params)
          .then(response => {
            return response.status;
          });

        return response;
      } catch (error) {
        console.log('Error while updating computer status: ', error);
      }
      return 500;
    },
    async updateSharedDevice(
      computerName: string,
      newShared: string
    ): Promise<number> {
      const url = new URL(
        import.meta.env.VITE_BASE_URL + `/updateSharedDevice/${computerName}`
      );

      try {
        const params = new URLSearchParams();
        params.append('newShared', newShared);

        const response = await axios
          .post(url.toString(), params)
          .then(response => {
            return response.status;
          });

        return response;
      } catch (error) {
        console.log('Error while updating computer shared device : ', error);
      }
      return 500;
    },
  },
});
