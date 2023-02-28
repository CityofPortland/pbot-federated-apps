<script setup lang="ts">
import { Anchor, Box } from '@pbotapps/components';
import { Application } from '../../models/application';

defineProps({
  app: {
    type: Object as () => Application,
    required: true,
  },
});
</script>

<template>
  <Box as="article" class="grid grid-cols-1 gap-4">
    <header>
      <h2 class="text-2xl">
        <router-link
          :to="{ name: 'Application', params: { id: app._id } }"
          custom
          v-slot="{ href, navigate }"
        >
          <Anchor :url="href" @click="navigate">
            {{ app.name }}
          </Anchor>
        </router-link>
      </h2>
    </header>
    <main>
      <p v-html="app.description"></p>
    </main>
  </Box>
</template>
