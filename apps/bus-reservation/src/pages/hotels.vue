<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { useRoute } from 'vue-router';
import { useStore } from '../store';

const { path } = useRoute();
const store = useStore();
</script>

<template>
  <article class="max-w-7xl mx-auto px-4 mt-4 mb-12 flex flex-col space-y-4">
    <h1 class="text-3xl">hotels</h1>
    <main>
      <header class="grid grid-cols-4 gap-2 mb-2">
        <span class="font-semibold">label</span>
        <span class="font-semibold">email</span>
        <span class="font-semibold">enabled</span>
      </header>
      <ul>
        <li
          v-for="user in store.users"
          :key="user.id"
          class="grid grid-cols-4 items-start gap-2 px-2 py-1 -mx-2 hover:bg-gray-100"
        >
          <span>{{ user.label }}</span>
          <span>{{ user.email }}</span>
          <span>{{ user.enabled }}</span>
          <router-link
            :to="`${path}/${user.id}`"
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
