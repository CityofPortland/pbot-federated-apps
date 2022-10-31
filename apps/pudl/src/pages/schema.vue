<script setup lang="ts">
import { useRoute } from 'vue-router';
defineProps({
  schema: { type: Object, required: true },
});
const { path } = useRoute();
</script>

<template>
  <article>
    <div class="flex flex-col space-y-4">
      <div>
        <h1 class="text-3xl capitalize">{{ schema.name }}</h1>
        <h2>{{ schema.description }}</h2>
      </div>
      <div>
        <h4 class="indent-8">{{ schema.tables.length }} tables</h4>
        <ul>
          <li v-for="(table, index) in schema.tables" :key="index">
            <div>
              <router-link :to="`${path}/${table.name}`">
                <h2>{{ table.name }}</h2>
              </router-link>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!-- <main>
      <ul>
        <li v-for="(schema, index) in zone.schemas" :key="index">
          <div>
            <router-link :to="`/zones/${zone.name}/${schema.name}`">
              <h2>{{ schema.name }}</h2>
            </router-link>
            <span> {{ zone.schemas.length }} schemas </span>
          </div>
          {{ schema.name }}
        </li>
      </ul>
    </main> -->
    <!-- <main>
      <ul>
        <li v-for="(schema, index) in zone.schemas" :key="index">
          <div>
            <router-link :to="`/zones/${zone.name}/${schema.name}`">
              <h2>{{ schema.name }}</h2>
            </router-link>
            <span> {{ zone.schemas.length }} schemas </span>
          </div>
          {{ schema.name }}
        </li>
      </ul>
    </main> -->
  </article>
</template>
