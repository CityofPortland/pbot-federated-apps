import { query } from '@pbotapps/components';
import { defineStore } from 'pinia';
import { Application } from '../models/application';
import { useAuthStore } from './auth';
import { Rule } from '../models/rule';

export const useRuleStore = defineStore('rule', {
  state: () => ({
    rules: new Array<Rule>(),
  }),
  actions: {
    async get(app: Application) {
      const { getToken } = useAuthStore();

      const token = await getToken();

      try {
        const res = await query<{ rules: Array<Rule> }>({
          operation: `
          query getRules($id: ID!) {
            rules(applicationId: $id) {
              id
              subject
              action
              conditions
              fields
              inverted
            }
          }
          `,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          variables: {
            id: app.id,
          },
        });

        if (res.errors) {
          // display them somehow
        }

        if (res.data && res.data.rules) {
          this.rules = [...res.data.rules];
        }
      } catch (err) {
        // display them?
        console.error(err);
      }
    },
    async add(rule: Partial<Rule>, app: Application) {
      const { getToken } = useAuthStore();

      const token = await getToken();

      try {
        const res = await query<{ addRule: Rule }>({
          operation: `
            mutation addRule($applicationId: ID! $payload: RuleAddInput!) {
                addRule(applicationId: $applicationId payload:$payload) {
                    id
                    action
                    conditions
                    fields
                    inverted
                    subject
                }
            }`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          variables: {
            applicationId: app.id,
            payload: rule,
          },
        });

        if (res.errors) {
          // display them somehow
        }

        if (res.data && res.data.addRule) {
          this.rules = [...this.rules, res.data.addRule];
        }
      } catch (err) {
        // display them?
        console.error(err);
      }
    },
    async getApplications() {
      const { getToken } = useAuthStore();

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
