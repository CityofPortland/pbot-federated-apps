<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { useRoute } from 'vue-router';
import { useStore } from '../store';

const { path } = useRoute();
const store = useStore();
</script>

<template>
  <article class="max-w-7xl mx-auto px-4 mt-4 mb-12 flex flex-col space-y-4">
    <h1 class="text-3xl">zones</h1>
    <main>
      <header class="grid grid-cols-2 gap-2 mb-2">
        <span class="font-semibold">name</span>
        <span class="font-semibold">schema count</span>
      </header>
      <ul>
        <li
          v-for="(zone, index) in store.zones"
          :key="index"
          class="grid grid-cols-2 items-start gap-2 py-1 hover:bg-gray-100"
        >
          <router-link
            :to="`${path}/${zone.name}`"
            custom
            v-slot="{ href, navigate }"
          >
            <h2>
              <Anchor :url="href" @click="navigate">
                {{ zone.name }}
              </Anchor>
            </h2>
          </router-link>
          <span>{{ zone.schemas.length }}</span>
        </li>
      </ul>
    </main>
  </article>
</template>
