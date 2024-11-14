import { RuleType } from '@pbotapps/authorization';
import { GraphQLOptions, query } from '@pbotapps/components';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useAuthStore } from './auth';
import { useMessageStore } from './messages';
import { Sign } from '../types';

export const useRuleStore = defineStore('rules', () => {
  const rules = ref<Array<RuleType>>([]);

  const { add: addMessage } = useMessageStore();

  const get = async () => {
    const { getToken } = useAuthStore();
    const token = await getToken();

    const options: GraphQLOptions = {
      operation: `
        query refreshRules {
          rules {
            action
            subject
          }
        }
        `,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const res = await query<{ rules: Array<RuleType>; signs: Array<Sign> }>(
      options
    )
      .then(res => {
        return res.data;
      })
      .then(data => data?.rules)
      .catch(reason => {
        console.error(reason, reason.response, reason.response.status);
        if (reason.response && reason.response.status == 401) {
          addMessage(
            'rules:get',
            'warning',
            new Error('Error retrieving rules', {
              cause:
                'You are not logged in. You will be unable to modify the sign library until you log in.',
            })
          );
        } else {
          addMessage(
            'rules:get',
            'error',
            new Error('Error retrieving rules', { cause: reason })
          );
        }

        return new Array<RuleType>();
      });

    rules.value = res || [];
  };

  const has = computed(
    () => (action: string, subject: string) =>
      rules.value.some(rule => rule.action == action && rule.subject == subject)
  );

  return {
    //state
    rules,
    //getters
    has,
    //actions
    get,
  };
});
