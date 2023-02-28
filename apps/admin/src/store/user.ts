import { query, useLogin } from '@pbotapps/components';
import { defineStore } from 'pinia';
import { Rule } from '../models/rule';
import { User } from '../models/user';

export const useUserStore = defineStore('user', {
  state: (): { me?: User; users: Array<User> } => ({
    me: undefined,
    users: new Array<User>(),
  }),
  getters: {},
  actions: {
    async addRule(user: User, rule: Rule) {
      const { getToken } = useLogin();
      const token = await getToken();

      try {
        const res = await query<{ users: Array<User> }>({
          operation: `
          mutation addRule {
            addRuleToUser(user_id: "${user._id}" rule_id: "${rule._id}")
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
    async getUsers() {
      const { getToken } = useLogin();
      const token = await getToken();

      try {
        const res = await query<{ users: Array<User> }>({
          operation: `
          query getUsers {
            users {
              _id
              _changed
              _created
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
          this.users = res.data.users;
        }
      } catch (err) {
        // display them?
        console.error(err);
      }
    },
    async getMe() {
      const { getToken } = useLogin();
      const token = await getToken();

      try {
        const res = await query<{ me: User }>({
          operation: `
          query me {
            me {
              _id
              _changed
              _created
              email
              firstName
              lastName
              rules {
                _id
                application {
                  _id
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
      const { getToken } = useLogin();
      const token = await getToken();

      try {
        const res = await query<{ users: Array<User> }>({
          operation: `
          mutation removeRule {
            removeRuleFromUser(user_id: "${user._id}" rule_id: "${rule._id}")
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
