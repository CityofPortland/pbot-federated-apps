<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue';
import { useRouter } from 'vue-router';

import { query, Box } from '@pbotapps/components';
import { Application } from '../models/application';
import Full from '../components/application/Full.vue';
import { useAuthStore } from '../store/auth';

const application: Ref<Application | undefined> = ref(undefined);

const { getToken } = useAuthStore();
const { currentRoute } = useRouter();

onMounted(async () => {
  const token = await getToken();
  const res = await query<{ applications: Array<Application> }>({
    operation: `
      query Query {
        application(id:"${currentRoute.value.params.id}"){
            id
            name
            description
            rules {
              id
              subject
              action
              conditions
              fields
              inverted
              users {
                id
              }
            }
        }
      }`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.data) {
    application.value = res.data.application;
  }
});
</script>

<template>
  <Box as="main">
    <Full v-if="application" :app="application" />
    <section v-else>Loading...</section>
  </Box>
</template>
