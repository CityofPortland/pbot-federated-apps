<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { useRoute } from 'vue-router';
import { useStore } from '../../store';

const { path } = useRoute();
const store = useStore();
</script>

<template>
  <article class="mx-auto max-w-7xl px-4 mt-4 mb-12 flex flex-col space-y-4">
    <header class="flex">
      <h1 class="text-3xl">Hotels</h1>
      <RouterLink to="/hotels/add" custom v-slot="{ href, navigate }">
        <Anchor :url="href" @click="navigate" class="ml-auto"> Add </Anchor>
      </RouterLink>
    </header>
    <main>
      <header class="grid grid-cols-4 gap-2 mb-2">
        <span class="font-semibold">Name</span>
        <span class="font-semibold">Email</span>
        <span class="font-semibold">Enabled</span>
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
            :to="`/hotels/view/${user.id}`"
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
