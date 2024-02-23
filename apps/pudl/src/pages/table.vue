<script setup lang="ts">
import { Box, BoxColor } from '@pbotapps/components';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import Rules from './rules.vue';
import { useStore } from '../store';
import { useRuleStore } from '../store/rules';

const { params } = useRoute();
const ruleStore = useRuleStore();
const store = useStore();

const table = computed(() =>
  store
    .tables(params.zone as string, params.schema as string)
    ?.find(t => t.name == params.table)
);

const columns = computed(() => {
  if (table.value) {
    return [...table.value.columns].sort((a, b) => a.index - b.index);
  } else {
    return undefined;
  }
});

const pipelines = computed(() =>
  store.tablePipelines(
    params.zone as string,
    params.schema as string,
    params.table as string
  )
);

const rules = computed(() =>
  ruleStore.rules({
    zone: params.zone as string,
    schema: params.schema as string,
    table: params.table as string,
  })
);

const statusColor = (status?: string): BoxColor => {
  const m = new Map<string, BoxColor>([
    ['success', 'green'],
    ['running', 'tangerine'],
    ['failed', 'red'],
  ]);

  return status ? m.get(status) || 'transparent' : 'transparent';
};
</script>

<template>
  <article
    v-if="table"
    class="max-w-7xl mx-auto px-4 mt-4 mb-12 flex flex-col space-y-4"
  >
    <h1 class="text-4xl font-bold mb-4 break-all">{{ table.name }}</h1>
    <main>
      <h2 class="text-2xl font-semibold mb-2">fields</h2>
      <section>
        <header class="grid grid-cols-2 gap-2 mb-2">
          <span class="font-semibold">name</span>
          <span class="font-semibold">type</span>
        </header>
        <main>
          <ul>
            <li
              v-for="column in columns"
              :key="column.name"
              class="grid grid-cols-2 items-start gap-2 py-1 hover:bg-gray-100"
            >
              <span class="break-all">
                {{ column.name }}
              </span>
              <span class="break-all">
                {{ column.type }}
              </span>
            </li>
          </ul>
        </main>
      </section>
    </main>
    <section>
      <header class="grid gap-2 mb-4">
        <h2 class="text-2xl font-semibold mb-2">pipelines</h2>
      </header>
      <ul
        v-if="pipelines && pipelines.length"
        class="grid md:grid-cols-2 gap-4"
      >
        <Box
          as="li"
          v-for="pipeline in pipelines"
          :key="pipeline.id"
          class="px-3 py-2 border rounded-md"
        >
          <header class="flex gap-2 mb-2">
            <h3 class="text-xl font-semibold">{{ pipeline.id }}</h3>
            <Box
              v-if="pipeline.lastRun"
              :color="statusColor(pipeline.lastRun.status)"
              variant="light"
              class="border border-current rounded-md px-1"
              >{{ pipeline.lastRun.status }}</Box
            >
          </header>
          <dl
            class="grid grid-flow-row justify-stretch gap-4"
            v-if="pipeline.lastRun"
          >
            <div>
              <dt class="text-sm">started</dt>
              <dd>
                {{ pipeline.lastRun.startTime.toLocaleString() }}
              </dd>
            </div>
            <div v-if="pipeline.lastRun.endTime">
              <dt class="text-sm">ended</dt>
              <dd>
                {{ pipeline.lastRun.endTime.toLocaleString() }}
              </dd>
            </div>
            <div>
              <dt class="text-sm">schedule</dt>
              <dd>
                {{ pipeline.schedule }}
              </dd>
            </div>
          </dl>
          <p v-else>This pipeline has not been run</p>
        </Box>
      </ul>
      <p v-else>
        There are no pipelines that have been associated with this table
      </p>
    </section>
    <section>
      <Rules
        :rules="rules"
        :default-rule="{
          id: '',
          inverted: false,
          action: 'read',
          subject: 'table',
          conditions: {
            name: table.name,
            zone: params.zone as string,
            schema: params.schema as string,
          },
          users: [],
        }"
      />
    </section>
  </article>
</template>
