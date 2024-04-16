<script setup lang="ts">
import { Anchor, Box } from '@pbotapps/components';
import { startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useRoute } from 'vue-router';
import { useStore } from '../../store';

const { path } = useRoute();
const store = useStore();

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const now = toZonedTime(new Date(), tz);
</script>

<template>
  <article class="max-w-7xl mx-auto px-4 my-8 space-y-4">
    <header class="flex mb-8">
      <h1 class="text-4xl font-bold">Reservations</h1>
      <router-link :to="`${path}/add`" custom v-slot="{ href, navigate }">
        <Anchor class="ml-auto" :url="href" @click="navigate">Add</Anchor>
      </router-link>
    </header>
    <main>
      <table
        class="-ml-2 w-full table-fixed border-separate border-spacing-y-1"
      >
        <thead class="pb-4">
          <tr class="text-left">
            <th class="font-semibold p-2">Hotel</th>
            <th class="font-semibold p-2">Bus zone</th>
            <th class="font-semibold p-2">Start</th>
            <th class="font-semibold p-2">End</th>
            <th class="font-semibold p-2"></th>
          </tr>
        </thead>
        <tbody>
          <Box
            as="tr"
            v-for="res in store.reservations.sort(
              (a, b) => a.start.valueOf() - b.start.valueOf()
            )"
            :key="res.id"
            :color="res.start <= now && res.end >= now ? 'blue' : 'transparent'"
            variant="light"
          >
            <td class="p-2">
              {{ res.user.label }}
            </td>
            <td class="p-2">{{ res.zone.label }}</td>
            <td class="p-2">{{ res.start.toLocaleDateString() }}</td>
            <td class="p-2">{{ res.end.toLocaleDateString() }}</td>
            <td class="flex gap-4 p-2">
              <router-link
                :to="`/reservations/${res.id}`"
                custom
                v-slot="{ href, navigate }"
              >
                <Anchor :url="href" @click="navigate">View</Anchor>
              </router-link>
              <router-link
                :to="`/reservations/${res.id}/edit`"
                custom
                v-slot="{ href, navigate }"
              >
                <Anchor :url="href" @click="navigate">Edit</Anchor>
              </router-link>
            </td>
          </Box>
        </tbody>
      </table>
    </main>
  </article>
</template>
