<script setup lang="ts">
import { useStore } from '../store';
const { zones } = useStore();
</script>

<template>
  <article>
    <ul>
      <li v-for="(zone, index) in zones" :key="index">
        <div>
          <router-link :to="`/zones/${zone.name}`">
            <h2 class="text-2xl capitalize">{{ zone.name }}</h2>
          </router-link>
          <span> {{ zone.schemas.length }} schemas </span>
        </div>
      </li>
    </ul>
  </article>
</template>
