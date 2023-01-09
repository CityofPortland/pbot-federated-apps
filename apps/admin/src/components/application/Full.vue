<script setup lang="ts">
import { Box, Button } from '@pbotapps/components';
import { Application } from '../../models/application.js';
import DataTable from '../table/DataTable.vue';

defineProps({
  app: {
    type: Object as () => Application,
    required: true,
  },
});
</script>

<template>
  <Box as="article" class="grid grid-cols-1 gap-4 mb-12">
    <header class="flex flex-col md:flex-row md:justify-between">
      <h1 class="text-4xl">{{ app.name }}</h1>
    </header>
    <main class="grid grid-cols-1 gap-4">
      <section>
        <p v-html="app.description" />
      </section>
      <section>
        <header class="flex justify-between mb-4">
          <h2 class="text-3xl">Rules</h2>
          <Button label="Add rule" />
        </header>
        <DataTable
          v-if="app.rules"
          :data="app.rules"
          class="border-collapse table-auto w-full text-sm"
        />
        <p v-else>
          No rules have been added yet. Use the 'Add rule' button above to add
          rules.
        </p>
      </section>
    </main>
  </Box>
</template>
