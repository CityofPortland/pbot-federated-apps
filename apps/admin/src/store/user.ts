import { useAuth } from '@pbotapps/authorization';
import { query } from '@pbotapps/components';
import { defineStore } from 'pinia';
import { Rule } from '../models/rule';
import { User } from '../models/user';

const { getToken } = useAuth({
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
});

export const useUserStore = defineStore('user', {
  state: (): { me?: User; users: Array<User> } => ({
    me: undefined,
    users: new Array<User>(),
  }),
  getters: {},
  actions: {
    async addRule(user: User, rule: Rule) {
      const token = await getToken();

      try {
        const res = await query<{ addRuleToUser: User }>({
          operation: `
          mutation addRule($ruleId:ID! $userId:ID!) {
            addRuleToUser(ruleId:$ruleId userId:$userId) {
              id
              email
            }
          }`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          variables: {
            ruleId: rule.id,
            userId: user.id,
          },
        });

        if (res.errors) {
          // display them somehow
        }

        if (res.data && res.data.addRuleToUser) {
          return { ...res.data.addRuleToUser };
        }
      } catch (err) {
        // display them?
        console.error(err);
      }
    },
    async getUsers() {
      const token = await getToken();

      try {
        const res = await query<{ users: Array<User> }>({
          operation: `
          query getUsers {
            users {
              id
              updated
              created
              email
              firstName
              lastName
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
          this.users = res.data.users.filter(u => u != undefined);
        }
      } catch (err) {
        // display them?
        console.error(err);
      }
    },
    async getMe() {
      console.debug('getMe');
      const token = await getToken();

      try {
        const res = await query<{ me: User }>({
          operation: `
          query me {
            me {
              id
              updated
              created
              email
              firstName
              lastName
              rules {
                id
                application {
                  id
                }
              }
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
          this.me = res.data.me;
        }
      } catch (err) {
        // display them?
        console.error(err);
      }
    },
    async removeRule(user: User, rule: Rule) {
      const token = await getToken();

      try {
        const res = await query<{ users: Array<User> }>({
          operation: `
          mutation removeRule {
            removeRuleFromUser(user_id: "${user.id}" rule_id: "${rule.id}")
          }`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.errors) {
          // display them somehow
        }
      } catch (err) {
        // display them?
        console.error(err);
      }
    },
  },
});
