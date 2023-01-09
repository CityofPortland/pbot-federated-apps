<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { useRoute } from 'vue-router';
import { useStore } from '../store';

const { path } = useRoute();
const { zones } = useStore();
</script>

<template>
  <article class="flex flex-col space-y-4">
    <h1 class="text-3xl">Zones</h1>
    <ul>
      <li v-for="(zone, index) in zones" :key="index">
        <div>
          <router-link
            :to="`${path}/${zone.name}`"
            custom
            v-slot="{ href, navigate }"
          >
            <h2 class="text-2xl capitalize">
              <Anchor :url="href" @click="navigate">
                {{ zone.name }}
              </Anchor>
            </h2>
          </router-link>
          <span>{{ zone.schemas.length }} schemas</span>
        </div>
      </li>
    </ul>
  </article>
</template>
