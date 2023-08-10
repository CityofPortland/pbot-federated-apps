import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';
import { computed, ref } from 'vue';

export type Rule = {
  id: string;
  inverted: boolean;
  action: string;
  subject: string;
  conditions?: Record<string, string>;
  fields?: Record<string, boolean | string>;
  users: Array<string>;
};

const rules: Array<Rule> = [
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'zone',
    users: [
      'admin',
      'Michael.McDonald@portlandoregon.gov',
      'Cory.Bertsch@portlandoregon.gov',
    ],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'schema',
    conditions: {
      name: 'amanda'
    },
    users: [
      'Jak.Wagner@portlandoregon.gov',
      'Madhumeta.Ganesh@portlandoregon.gov',
      'Taylor.Huschka@portlandoregon.gov',
    ],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'schema',
    conditions: {
      name: 'cale'
    },
    users: [
      'Colleen.Mossor@portlandoregon.gov',
      'Madhumeta.Ganesh@portlandoregon.gov'
    ],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'schema',
    conditions: {
      name: 'mobility'
    },
    users: [
      'Mel.Hogg@portlandoregon.gov'
    ],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'schema',
    conditions: {
      name: 'navman'
    },
    users: [
      'Aubrey.Lindstrom@portlandoregon.gov',
    ],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'schema',
    conditions: {
      name: 'odot'
    },
    users: [
      'Tyler.Berry@portlandoregon.gov',
      'Asif.Haque@portlandoregon.gov',
      'Mel.Hogg@portlandoregon.gov',
      'Colleen.Mossor@portlandoregon.gov'
    ],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'schema',
    conditions: {
      name: 'parking'
    },
    users: [
      'Colleen.Mossor@portlandoregon.gov',
      'Madhumeta.Ganesh@portlandoregon.gov'
    ],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'schema',
    conditions: {
      name: 'pfht',
    },
    users: [
      'Joshua.Lynch@portlandoregon.gov',
      'Will.Martin@portlandoregon.gov'
    ],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'schema',
    conditions: {
      name: 'tsup'
    },
    users: [
      'Jak.Wagner@portlandoregon.gov',
      'Madhumeta.Ganesh@portlandoregon.gov',
      'Taylor.Huschka@portlandoregon.gov',
    ],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'schema',
    conditions: {
      name: 'zendesk'
    },
    users: [
      'Colleen.Mossor@portlandoregon.gov',
      'Madhumeta.Ganesh@portlandoregon.gov'
    ],
  },
  {
    id: uuid(),
    inverted: false,
    action: 'read',
    subject: 'table',
    conditions: {
      name: 'registration',
      schema: 'odot',
      zone: 'enriched'
    },
    fields: {
      ro_addr1: false,
      longitude: false,
      latitude: false,
      census_block_group_hash: false,
      census_tract_hash: false,
      taz_hash: false,
    },
    users: [
      'Joshua.Lynch@portlandoregon.gov',
    ],
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
            if (rule.subject == 'zone') {
              // does the condition match?
              return rule.conditions ? rule.conditions.name == zone : true;
            }
            if (rule.subject == 'schema') {
              if (rule.conditions) {
                const { name: schemaName, zone: zoneName } = rule.conditions;
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
