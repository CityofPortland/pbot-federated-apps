<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { Anchor, Box } from '@pbotapps/components';
import Listing from '../components/application/List.vue';
import { useApplicationStore } from '../store/application';

const store = useApplicationStore();

const applications = computed(() => store.applications);

onMounted(() => store.getApplications());
</script>

<template>
  <Box as="article" class="grid grid-cols-1 gap-12 mb-12">
    <header class="flex flex-col sm:flex-row sm:justify-between gap-4">
      <h1 class="text-4xl">Applications</h1>
      <router-link to="/application/new" custom v-slot="{ href, navigate }">
        <Anchor :url="href" @click="navigate">Add application</Anchor>
      </router-link>
    </header>
    <ul class="grid grid-cols-1 gap-8" v-if="applications">
      <li v-for="application in applications" :key="application.id">
        <Listing :app="application" />
      </li>
    </ul>
  </Box>
</template>
