import { MaximoUser } from './../types/pagedMaximoUsers';
import { PagedCopActiveComputers } from './../types/pagedCopActiveComputers';
// stores/counter.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { PagedMaximoUsers, MaximoUser } from '../types/pagedMaximoUsers';

export const useLcrStore = defineStore('lcr', {
  state: () => ({
    pagedMaximoUsers: [],
    pagedPbotLcrSchedule: [],
    pagedCopActiveComputers: [],
    //startFlag: false,
  }),
  getters: {
    getMaximoUsers(state) {
      return state.pagedMaximoUsers;
    },
    getPbotLcrSchedule(state) {
      return state.pagedPbotLcrSchedule;
    },
    /*getCopActiveComputers(state) {
      return state.pagedCopActiveComputers;
    },*/
    getCopActiveComputers(state) {
      return (person: MaximoUser) =>
        state.pagedCopActiveComputers.filter(item => {
          return item.primaryUser === person.displayName;
        });
    },
  },

  actions: {
    async fetchMaximoUsers(user: Partial<MaximoUser> | null) {
      let url =
        'https://localhost:7110/api/workstation/GetPaginatedMaximoUsers?';

      if (user?.username) {
        url = url + '&UserName=' + user?.username;
      }

      if (user?.personId) {
        url = url + '&PersonId=' + user?.personId;
      }

      if (user?.firstName) {
        url = url + '&FirstName=' + user?.firstName;
      }

      if (user?.lastName) {
        url = url + '&LastName=' + user?.lastName;
      }

      if (user?.pbotCostCenter) {
        url = url + '&PbotCostCenter=' + user?.pbotCostCenter;
      }

      if (user?.pbotOrgUnit) {
        url = url + '&PbotOrgUnit' + user?.pbotOrgUnit;
      }

      try {
        const res = await axios.get(url);
        this.pagedMaximoUsers = res.data.data;
        console.log(this.pagedMaximoUsers);
        /*if (this.pagedMaximoUsers.data != null) {
          //this.pagedCopActiveComputers.data = [];
          for (let i = 0; i < this.pagedMaximoUsers.data.length; i++) {
            this.fetchCopActiveComputers(
              this.pagedMaximoUsers.data[i].displayName
            );
          }
        }*/
      } catch (error) {
        console.log('Error while fetching Maximo users: ', error);
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
        'https://localhost:7110/api/workstation/GetPaginatedCopActiveComputers?pageNumber=7&pageSize=2000';

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
