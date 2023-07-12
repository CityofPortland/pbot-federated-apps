<script setup lang="ts">
import { Box } from '@pbotapps/components';
import { useRoute } from 'vue-router';
import Rules from './Rules.vue';
import { useRuleStore } from '../store/rules';

const props = defineProps({ table: { type: Object, required: true } });

const { params } = useRoute();
const rules = useRuleStore();

const columns = [...props.table.columns].sort((a, b) => a.index - b.index);
</script>

<template>
  <article class="flex flex-col space-y-4">
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
              class="grid grid-cols-2 items-start gap-2 hover:bg-gray-100"
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
      <Rules
        :rules="
          rules.rules({
            zone: params.zone as string,
            schema: params.schema as string,
            table: params.table as string,
          })
        "
        :default-rule="{
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
