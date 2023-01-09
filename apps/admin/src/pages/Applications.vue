<script setup lang="ts">
import { ref, watchEffect } from 'vue';

import { query, Box, Button } from '@pbotapps/components';
import { Application } from '../models/application';
import Listing from '../components/application/List.vue';

const skip = ref(0);
const take = ref(10);

let applications = ref(new Array<Application>());

watchEffect(async () => {
  const res = await query<{ getAllApplication: Array<Application> }>({
    operation: `
      query Query {
        getAllApplication(skip:${skip.value} take:${take.value}){
            uuid
            name
            description
        }
      }`,
  });

  if (!res.errors && res.data) {
    applications.value = res.data.getAllApplication;
  }
});
</script>

<template>
  <Box as="article" class="grid grid-cols-1 gap-12 mb-12">
    <header class="flex flex-col md:flex-row md:justify-between">
      <h1 class="text-4xl">Applications</h1>
      <router-link to="/application/new">
        <Button label="Add application" class="inline-flex" />
      </router-link>
    </header>
    <ul class="grid grid-cols-1 gap-8">
      <li v-for="application in applications" :key="application.uuid">
        <Listing :app="application" />
      </li>
    </ul>
  </Box>
</template>
