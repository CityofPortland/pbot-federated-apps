<script setup lang="ts">
import { onBeforeUpdate, ref, Ref } from 'vue';
import { onBeforeRouteUpdate, useRouter } from 'vue-router';

import { query, Box, useLogin } from '@pbotapps/components';
import { Application } from '../models/application';
import Full from '../components/application/Full.vue';

const application: Ref<Application | undefined> = ref(undefined);

const { currentRoute } = useRouter();
const { getToken } = useLogin();

async function getApplication() {
  const token = await getToken();
  const res = await query<{ applications: Array<Application> }>({
    operation: `
      query Query {
        applications(input: { _id:"${currentRoute.value.params.id}" }){
            _id
            name
            description
            rules {
              _id
              subject
              action
              conditions
              fields
              inverted
              users {
                _id
              }
            }
        }
      }`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.data) {
    application.value = res.data.applications[0];
  }
}

getApplication();
</script>

<template>
  <Box as="main">
    <Full v-if="application" :app="application" />
    <section v-else>Loading...</section>
  </Box>
</template>
