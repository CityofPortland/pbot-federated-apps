<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import Rules from './rules.vue';
import { useStore } from '../store';
import { useRuleStore } from '../store/rules';

const { params, path } = useRoute();
const ruleStore = useRuleStore();
const store = useStore();

const zone = computed(() => store.zones.find(z => z.name == params.zone));

const rules = computed(() => ruleStore.rules({
            zone: params.zone as string,
            schema: params.schema as string,
            table: params.table as string,
          }));
</script>

<template>
  <article v-if="zone" class="flex flex-col space-y-4">
    <h1 class="text-4xl font-bold mb-4">{{ zone.name }}</h1>
    <main>
      <h2 class="text-2xl font-semibold mb-2">schemas</h2>
      <section>
        <header class="grid grid-cols-2 gap-2 mb-2">
          <span class="font-semibold">name</span>
          <span class="font-semibold">table count</span>
        </header>
        <ul>
          <li
            v-for="(schema, index) in zone.schemas"
            :key="index"
            class="grid grid-cols-2 items-start gap-2 hover:bg-gray-100"
          >
            <span>
              <router-link
                :to="`${path}/${schema.name}`"
                custom
                v-slot="{ href, navigate }"
              >
                <Anchor :url="href" @click="navigate">
                  {{ schema.name }}
                </Anchor>
              </router-link>
            </span>
            <span>{{ schema.tables.length }}</span>
          </li>
        </ul>
      </section>
    </main>
    <section>
      <Rules
        :rules="
          rules
        "
      />
    </section>
  </article>
</template>
