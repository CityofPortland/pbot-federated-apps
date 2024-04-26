<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { useStore } from '../../store';
import { onMounted } from 'vue';

const store = useStore();
onMounted(() => {
  store.getHotels();
});
</script>

<template>
  <article class="mx-auto max-w-7xl px-4 my-8 space-y-4">
    <header class="flex mb-8">
      <h1 class="text-4xl font-bold">Hotels</h1>
      <RouterLink
        v-if="
          store.rules.find(r => r.subject == 'hotel' && r.action == 'write')
        "
        to="/hotels/add"
        custom
        v-slot="{ href, navigate }"
      >
        <Anchor :url="href" @click="navigate" class="ml-auto">Add</Anchor>
      </RouterLink>
    </header>
    <main class="overflow-auto">
      <table class="-ml-2 w-full table-auto border-separate border-spacing-y-1">
        <thead class="text-left">
          <tr>
            <th class="font-semibold p-2">Name</th>
            <th class="font-semibold p-2">Email</th>
            <th class="font-semibold p-2">Enabled</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in store.users" :key="user.id">
            <td class="p-2 truncate">
              {{ user.label }}
            </td>
            <td class="p-2 truncate">
              {{ user.email }}
            </td>
            <td class="p-2 truncate">
              {{ user.enabled }}
            </td>
            <td class="flex gap-4 p-2">
              <router-link
                :to="`/hotels/${user.id}`"
                custom
                v-slot="{ href, navigate }"
              >
                <Anchor :url="href" @click="navigate">View</Anchor>
              </router-link>
              <router-link
                v-if="
                  store.rules.find(
                    r => r.subject == 'hotel' && r.action == 'write'
                  )
                "
                :to="`/hotels/${user.id}/edit`"
                custom
                v-slot="{ href, navigate }"
              >
                <Anchor :url="href" @click="navigate">Edit</Anchor>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  </article>
</template>
