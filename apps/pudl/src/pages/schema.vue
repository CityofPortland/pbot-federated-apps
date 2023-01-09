<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { useRoute } from 'vue-router';

defineProps({
  schema: { type: Object, required: true },
});

const { path } = useRoute();
</script>

<template>
  <article class="flex flex-col space-y-4">
    <h1 class="text-3xl capitalize">{{ schema.name }}</h1>
    <p v-if="schema.description">{{ schema.description }}</p>
    <h2 class="text-2xl">Tables</h2>
    <ul>
      <li v-for="(table, index) in schema.tables" :key="index">
        <div>
          <router-link
            :to="`${path}/${table.name}`"
            custom
            v-slot="{ href, navigate }"
          >
            <Anchor :url="href" @click="navigate">
              {{ table.name }}
            </Anchor>
          </router-link>
        </div>
      </li>
    </ul>
  </article>
</template>
