import { query, useLogin } from '@pbotapps/components';
import { defineStore } from 'pinia';
import { Application } from '../models/application';

export const useApplicationStore = defineStore('application', {
  state: () => ({
    applications: new Array<Application>(),
  }),
  actions: {
    async getApplications() {
      const { getToken } = useLogin();
      const token = await getToken();

      try {
        const res = await query<{ applications: Array<Application> }>({
          operation: `
          query getApplications {
            applications {
              _id
              _changed
              _changedBy
              _created
              _createdBy
              name
              description
            }
          }`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.errors) {
          // display them somehow
        }

        if (res.data) {
          this.applications = res.data.applications;
        }
      } catch (err) {
        // display them?
        console.error(err);
      }
    },
  },
});
