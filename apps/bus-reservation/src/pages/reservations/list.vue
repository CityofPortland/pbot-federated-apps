<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { useRoute } from 'vue-router';
import { useStore } from '../../store';

const { path } = useRoute();
const store = useStore();
</script>

<template>
  <article class="max-w-7xl mx-auto px-4 mt-4 mb-12 flex flex-col space-y-4">
    <header class="flex">
      <h1 class="text-4xl font-bold">Reservations</h1>
      <router-link :to="`${path}/add`" custom v-slot="{ href, navigate }">
        <Anchor class="ml-auto" :url="href" @click="navigate">Add</Anchor>
      </router-link>
    </header>
    <main>
      <header class="grid grid-cols-5 gap-2 mb-2">
        <span class="font-semibold">hotel</span>
        <span class="font-semibold">bus zone</span>
        <span class="font-semibold">start</span>
        <span class="font-semibold">end</span>
      </header>
      <ul>
        <li v-for="res in store.reservations" :key="res.id"
          class="grid grid-cols-5 items-start gap-2 px-2 py-1 -mx-2 hover:bg-gray-100">
          <span>{{ res.user.label }}</span>
          <span>{{ res.zone.label }}</span>
          <span>{{ res.start.toLocaleDateString() }}</span>
          <span>{{ res.end.toLocaleDateString() }}</span>
          <div class="flex gap-4">
            <router-link :to="`/reservations/${res.id}`" custom v-slot="{ href, navigate }">
              <Anchor :url="href" @click="navigate">View</Anchor>
            </router-link>
            <router-link :to="`/reservations/${res.id}/edit`" custom v-slot="{ href, navigate }">
              <Anchor :url="href" @click="navigate">Edit</Anchor>
            </router-link>
          </div>
        </li>
      </ul>
    </main>
  </article>
</template>
