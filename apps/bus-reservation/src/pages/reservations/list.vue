<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { useRoute } from 'vue-router';
import { useStore } from '../../store';

const { path } = useRoute();
const store = useStore();
</script>

<template>
  <article class="max-w-7xl mx-auto px-4 mt-4 mb-12 flex flex-col space-y-4">
    <h1 class="text-3xl">reservations</h1>
    <main>
      <header class="grid grid-cols-5 gap-2 mb-2">
        <span class="font-semibold">hotel</span>
        <span class="font-semibold">bus zone</span>
        <span class="font-semibold">start</span>
        <span class="font-semibold">end</span>
      </header>
      <ul>
        <li
          v-for="(res, index) in store.reservations"
          :key="index"
          class="grid grid-cols-5 items-start gap-2 px-2 py-1 -mx-2 hover:bg-gray-100"
        >
          <span>{{ res.user.label }}</span>
          <span>{{ res.zone.label }}</span>
          <span>{{ res.start.toLocaleString() }}</span>
          <span>{{ res.end.toLocaleString() }}</span>
          <router-link
            :to="`${path}/${res.id}`"
            custom
            v-slot="{ href, navigate }"
          >
            <Anchor :url="href" @click="navigate">View</Anchor>
          </router-link>
        </li>
      </ul>
    </main>
  </article>
</template>
