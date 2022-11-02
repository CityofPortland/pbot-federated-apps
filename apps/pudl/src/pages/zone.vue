<script setup lang="ts">
defineProps({ zone: { type: Object, required: true } });
</script>

<template>
  <article>
    <h1 class="text-3xl capitalize">{{ zone.name }}</h1>
    <main>
      <ul>
        <li v-for="(schema, index) in zone.schemas" :key="index">
          <div>
            <router-link :to="`/zones/${zone.name}/${schema.name}`">
              <h2>{{ schema.name }}</h2>
            </router-link>
          </div>
        </li>
      </ul>
    </main>
  </article>
</template>
