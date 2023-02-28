<script setup lang="ts">
import { ref, Ref } from 'vue';
import { useRouter } from 'vue-router';

import { query, Box, useLogin } from '@pbotapps/components';
import { Rule } from '../models/rule';
import Full from '../components/rule/Full.vue';

const rule: Ref<Rule | undefined> = ref(undefined);

const { currentRoute } = useRouter();
const { getToken } = useLogin();

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
