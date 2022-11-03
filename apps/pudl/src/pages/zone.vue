<script setup lang="ts">
import { Anchor } from '@pbotapps/common';
import { useRoute } from 'vue-router';

defineProps({ zone: { type: Object, required: true } });

const { path } = useRoute();
</script>

<template>
  <article class="flex flex-col space-y-4">
    <h1 class="text-3xl capitalize">{{ zone.name }}</h1>
    <h2 class="text-2xl">Schemas</h2>
    <ul>
      <li v-for="(schema, index) in zone.schemas" :key="index">
        <div>
          <router-link
            :to="`${path}/${schema.name}`"
            custom
            v-slot="{ href, navigate }"
          >
            <Anchor :url="href" @click="navigate">
              {{ schema.name }}
            </Anchor>
          </router-link>
        </div>
      </li>
    </ul>
  </article>
</template>
