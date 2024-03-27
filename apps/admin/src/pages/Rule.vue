<script setup lang="ts">
import { query, Box } from '@pbotapps/components';
import { ref, Ref } from 'vue';
import { useRouter } from 'vue-router';

import { Rule } from '../models/rule';
import Full from '../components/rule/Full.vue';
import { useAuthStore } from '../store/auth';

const rule: Ref<Rule | undefined> = ref(undefined);

const { getToken } = useAuthStore();
const { currentRoute } = useRouter();

async function getRule() {
  const token = await getToken();
  const res = await query<{ rule: Rule }>({
    operation: `
      query Query {
        rule(id: "${currentRoute.value.params.id}"){
            _id
            subject
            action
            conditions
            fields
            inverted
            application {
                _id
                name
            }
            users {
                _id
                email
                firstName
                lastName
            }
        }
      }`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.data) {
    rule.value = res.data.rule;
  }
}

getRule();
</script>

<template>
  <Box as="main">
    <Full v-if="rule" :rule="rule" />
    <section v-else>Loading...</section>
  </Box>
</template>
