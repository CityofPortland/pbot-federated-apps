<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { v4 as uuid } from 'uuid';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import Rules from './rules.vue';
import { useStore } from '../store';
import { useRuleStore } from '../store/rules';

const { params, path } = useRoute();
const store = useStore();
const ruleStore = useRuleStore();

const schema = computed(() =>
  store.schemas(params.zone as string)?.find(s => s.name == params.schema)
);

const rules = computed(() =>
  ruleStore.rules({
    zone: params.zone as string,
    schema: params.schema as string,
    table: params.table as string,
  })
);
</script>

<template>
  <article
    v-if="schema"
    class="max-w-7xl mx-auto px-4 mt-4 mb-12 flex flex-col space-y-4"
  >
    <h1 class="text-4xl font-bold mb-4">{{ schema.name }}</h1>
    <main>
      <h2 class="text-2xl font-semibold mb-2">tables</h2>

      <main>
        <header class="grid grid-cols-2 gap-2 mb-2">
          <span class="font-semibold">name</span>
          <span class="font-semibold">column count</span>
        </header>
        <ul>
          <li
            v-for="(table, index) in schema.tables"
            :key="index"
            class="grid grid-cols-2 items-start gap-2 py-1 hover:bg-gray-100"
          >
            <span class="break-all">
              <router-link
                :to="`${path}/${table.name}`"
                custom
                v-slot="{ href, navigate }"
              >
                <Anchor :url="href" @click="navigate">
                  {{ table.name }}
                </Anchor>
              </router-link>
            </span>
            <span>{{ table.columns.length }}</span>
          </li>
        </ul>
      </main>
    </main>
    <aside>
      <Rules
        :rules="rules"
        :default-rule="{
          id: uuid(),
          inverted: false,
          action: 'read',
          subject: 'schema',
          conditions: {
            name: schema.name,
            zone: params.zone as string,
          },
          users: [],
        }"
      />
    </aside>
  </article>
</template>
