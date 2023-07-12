import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';
import { computed, ref } from 'vue';

export type Rule = {
  id: string;
  inverted: boolean;
  action: string;
  subject: string;
  conditions?: Record<string, string>;
  users: Array<string>;
};

const rules: Array<Rule> = [
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'zone',
    users: [
      'Michael.McDonald@portlandoregon.gov',
      'Cory.Bertsch@portlandoregon.gov',
      'Madhumeta.Ganesh@portlandoregon.gov',
    ],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'zone',
    conditions: {
      name: 'enriched',
    },
    users: ['Carla.Herrera@portlandoregon.gov'],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'schema',
    conditions: {
      name: 'pfht',
    },
    users: ['Cory.Bertsch@portlandoregon.gov'],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'schema',
    conditions: {
      name: 'pfht',
      zone: 'enriched',
    },
    users: ['Johua.Lync@portlandoregon.gov', 'Will.Martin@portlandoregon.gov'],
  },
];

export const useRuleStore = defineStore('rules', () => {
  const data = ref(rules);

  return {
    data,
    rules: computed(
      () =>
        ({
          zone,
          schema,
          table,
        }: {
          zone: string;
          schema: string;
          table: string;
        }) => {
          return data.value.filter(rule => {
            console.debug(`Checking rule '${JSON.stringify(rule)}`);
            if (rule.subject == 'zone') {
              // does the condition match?
              return rule.conditions ? rule.conditions.name == zone : true;
            }
            if (rule.subject == 'schema') {
              if (rule.conditions) {
                console.debug(
                  `Checking conditions '${JSON.stringify(rule.conditions)}'...`
                );
                const { name: schemaName, zone: zoneName } = rule.conditions;
                console.debug(
                  `${schema == schemaName} && (${zoneName} || ${
                    zone == zoneName
                  })`
                );
                return schema == schemaName && (!zoneName || zone == zoneName);
              }
            }
            if (rule.subject == 'table') {
              if (rule.conditions) {
                const {
                  name: tableName,
                  zone: zoneName,
                  schema: schemaName,
                } = rule.conditions;
                return (
                  table == tableName && zone == zoneName && schema == schemaName
                );
              }
            }
          });
        }
    ),
    addRule(rule: Rule) {
      data.value.push(rule);
    },
  };
});
