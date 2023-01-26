<script setup lang="ts">
import { computed } from 'vue';
import { Box, Button } from '@pbotapps/components';
import { useStore } from '../store';

const store = useStore();
const signs = computed(() => store.data.signs);
</script>

<template>
  <article>
    <header class="prose flex flex-col md:flex-row justify-between">
      <h1>Signs</h1>
      <router-link to="/add">
        <Button label="Add sign" size="small" />
      </router-link>
    </header>
    <main class="mt-8">
      <ul class="list-none flex flex-col gap-4">
        <li v-for="sign in signs" :key="sign.code">
          <article class="flex flex-row items-center gap-4">
            <figure>
              <Box
                color="gray"
                variant="light"
                class="flex justify-center items-center h-32 w-32"
              >
                Sign image here
              </Box>
            </figure>
            <main class="flex-1 prose">
              <h2 class="mt-0">
                {{ sign.code }}
              </h2>
              <Box
                as="span"
                color="gray"
                variant="light"
                class="rounded px-2 py-1"
                >{{ sign.status }}</Box
              >
              <p>{{ sign.legend }}</p>
            </main>
            <aside class="flex gap-2">
              <router-link :to="`/${sign.code}`">
                <Button label="View" size="small" />
              </router-link>
              <router-link :to="`/${sign.code}/edit`">
                <Button label="Edit" size="small" />
              </router-link>
            </aside>
          </article>
        </li>
      </ul>
    </main>
  </article>
</template>
