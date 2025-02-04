import { query } from '@pbotapps/components';
import { defineStore } from 'pinia';
import { Application } from '../models/application';
import { useAuthStore } from './auth';
import { useErrorStore } from './error';

export const useApplicationStore = defineStore('application', {
  state: () => ({
    applications: new Array<Application>(),
  }),
  actions: {
    async add(app: Partial<Application>) {
      const { getToken } = useAuthStore();
      const errorStore = useErrorStore();

      errorStore.remove('add-application');

      const token = await getToken();

      try {
        const res = await query<{ addApplication: Application }>({
          operation: `
          mutation addApplication($input: ApplicationAddInput!) {
            addApplication(payload: $input) {
              id
              name
              description
            }
          }`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          variables: {
            input: app,
          },
        });

        if (res.errors) {
          // display them somehow
          for (const error of res.errors) {
            errorStore.add('add-application', new Error(error.message));
          }
        }

        if (res.data && res.data.addApplication) {
          this.applications = [...this.applications, res.data.addApplication];
          return res.data.addApplication;
        }
      } catch (err) {
        // display them?
        errorStore.add('add-application', new Error((err as Error).message));
      }
    },
    async getApplications() {
      const { getToken } = useAuthStore();
      const errorStore = useErrorStore();

      errorStore.remove('get-application');

      const token = await getToken();

      try {
        const res = await query<{ applications: Array<Application> }>({
          operation: `
          query getApplications {
            applications {
              id
              updated
              updater
              created
              creator
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
          for (const error of res.errors) {
            errorStore.add('get-application', new Error(error.message));
          }
        }

        if (res.data) {
          this.applications = res.data.applications;
        }
      } catch (err) {
        // display them?
        errorStore.add('get-application', new Error((err as Error).message));
      }
    },
  },
});
