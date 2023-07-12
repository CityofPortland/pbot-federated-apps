<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { v4 as uuid } from 'uuid';
import { useRoute } from 'vue-router';
import Rules from './Rules.vue';
import { useRuleStore } from '../store/rules';

defineProps({
  schema: { type: Object, required: true },
});

const { params, path } = useRoute();

const rules = useRuleStore();
</script>

<template>
  <article class="flex flex-col space-y-4">
    <h1 class="text-4xl font-bold mb-4">{{ schema.name }}</h1>
    <p v-if="schema.description" class="mb-2">{{ schema.description }}</p>
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
            class="grid grid-cols-2 items-start gap-2 hover:bg-gray-100"
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
        :rules="
          rules.rules({
            zone: params.zone as string,
            schema: params.schema as string,
            table: params.table as string,
          })
        "
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
        @changed="(index, rule) => rules.data.find(r => rule.id === r.id)"
      />
    </aside>
  </article>
</template>
