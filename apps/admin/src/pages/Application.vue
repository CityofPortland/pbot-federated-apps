<script setup lang="ts">
import { ref, Ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import { query, Box } from '@pbotapps/components';
import { Application } from '../models/application';
import Full from '../components/application/Full.vue';

let application: Ref<Application | undefined> = ref(undefined);
const { currentRoute } = useRouter();

watchEffect(async () => {
  const res = await query<{ getApplication: Application }>({
    operation: `
      query Query {
        getApplication(uuid:"${currentRoute.value.params.uuid}"){
            uuid
            name
            description
            rules {
              subject
              action
              conditions
              fields
              inverted
            }
        }
      }`,
  });

  if (!res.errors && res.data) {
    application.value = res.data.getApplication;
  }
});
</script>

<template>
  <Box as="main">
    <Full v-if="application" :app="application" />
    <section v-else>Loading...</section>
  </Box>
</template>
