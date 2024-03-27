<script setup lang="ts">
import { Entry, Select } from '@pbotapps/components';
import { ref } from 'vue';
import { User, Zone, useStore } from '../../store';

const store = useStore();

const hotel = ref<User>(store.users[0]);
const zone = ref<Zone>(store.zones[4]);
</script>

<template>
  <form class="max-w-7xl mx-auto px-4 mt-4 mb-12 flex flex-col space-y-4">
    <h1 class="text-3xl">Add a reservation</h1>
    <Entry
      id="zone"
      label="Zone"
      required
      :inline="false"
      v-slot="{ id, required }"
    >
      <Select
        :id="id"
        :required="required"
        v-model="zone"
        @changed="zone = $event"
      >
        <option
          v-for="z in store.zones"
          :key="z.id"
          :value="z"
          :selected="z.id == zone?.id"
        >
          {{ z.label }}
        </option>
      </Select>
    </Entry>
    <Entry
      id="hotel"
      label="Hotel"
      required
      :inline="false"
      v-slot="{ id, required }"
    >
      <Select :id="id" :required="required" @changed="hotel = $event">
        <option
          v-for="h in store.users.filter(u => u.enabled)"
          :key="h.id"
          :value="h"
          :selected="h.id == hotel?.id"
        >
          {{ h.label }}
        </option>
      </Select>
    </Entry>
  </form>
</template>
