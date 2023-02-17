<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import {
  Anchor,
  Box,
  Checkboxes,
  Entry,
  Input,
  Message,
} from '@pbotapps/components';
import Status from '../components/Status.vue';
import { useStore } from '../store';
import { COLORS, SHAPES, STATUSES, TYPES } from '../types';

const store = useStore();
const query = ref('');

const includes = reactive({
  color: [],
  shape: [],
  status: ['in_use'],
  type: [],
});

const signs = computed(() => {
  let results = store.data.signs;

  if (query.value) {
    const r = new RegExp(query.value, 'i');
    results = results.filter(
      s => r.test(s.code) || r.test(s.legend) || r.test(s.mutcdCode)
    );
  }

  if (includes.color.length) {
    results = results.filter(s =>
      s.color.some(c => includes.color.some(i => i == c))
    );
  }

  if (includes.shape.length) {
    results = results.filter(s => includes.shape.some(i => i == s.shape));
  }

  if (includes.status.length) {
    results = results.filter(s => includes.status.some(i => i == s.status));
  }

  if (includes.type.length) {
    results = results.filter(s => includes.type.some(i => i == s.type));
  }

  return results;
});

const colors = computed(() => {
  const counts = store.data.signs.reduce((acc, curr) => {
    curr.color.forEach(c => {
      acc.set(c, (acc.get(c) || 0) + 1);
    });
    return acc;
  }, new Map<string, number>());

  return COLORS.map(c => ({
    id: c,
    checked: includes.color.some(i => i == c),
    count: counts.get(c) || 0,
    label: `${c} (${counts.get(c) || 0})`,
    value: c,
  }))
    .filter(x => x.count > 0)
    .sort((a, b) => {
      const diffCount = b.count - a.count;

      if (diffCount) return diffCount;

      return a.id > b.id ? 1 : -1;
    });
});

const shapes = computed(() => {
  const counts = store.data.signs.reduce((acc, curr) => {
    acc.set(curr.shape, (acc.get(curr.shape) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  return SHAPES.map(x => ({
    id: x,
    checked: includes.shape.some(i => i == x),
    count: counts.get(x) || 0,
    label: `${x} (${counts.get(x) || 0})`,
    value: x,
  }))
    .filter(x => x.count > 0)
    .sort((a, b) => {
      const diffCount = b.count - a.count;

      if (diffCount) return diffCount;

      return a.id > b.id ? 1 : -1;
    });
});

const statuses = computed(() => {
  const counts = store.data.signs.reduce((acc, curr) => {
    acc.set(curr.status, (acc.get(curr.status) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  return STATUSES.map(x => ({
    id: x,
    checked: includes.status.some(i => i == x),
    count: counts.get(x) || 0,
    label: `${x} (${counts.get(x) || 0})`,
    value: x,
  }))
    .filter(x => x.count > 0)
    .sort((a, b) => {
      const diffCount = b.count - a.count;

      if (diffCount) return diffCount;

      return a.id > b.id ? 1 : -1;
    });
});

const types = computed(() => {
  const counts = store.data.signs.reduce((acc, curr) => {
    acc.set(curr.type, (acc.get(curr.type) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  return TYPES.map(x => ({
    id: x,
    checked: includes.type.some(i => i == x),
    count: counts.get(x) || 0,
    label: `${x} (${counts.get(x) || 0})`,
    value: x,
  }))
    .filter(x => x.count > 0)
    .sort((a, b) => {
      const diffCount = b.count - a.count;

      if (diffCount) return diffCount;

      return a.id > b.id ? 1 : -1;
    });
});
</script>

<template>
  <article>
    <header
      class="prose prose-lg max-w-none flex flex-col sm:flex-row justify-between items-start"
    >
      <h1>Signs</h1>
      <router-link to="/add" custom v-slot="{ href, navigate }">
        <Anchor :url="href" @click="navigate" class="no-underline">
          Add sign
        </Anchor>
      </router-link>
    </header>
    <main class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      <aside>
        <form class="grid grid-cols-1 gap-4">
          <Entry id="search">
            <Input type="search" v-model="query" placeholder="Search..." />
          </Entry>
          <Checkboxes
            :options="statuses"
            id="status"
            label="Status"
            @changed="includes.status = $event"
          />
          <Checkboxes
            :options="shapes"
            id="shape"
            label="Shape"
            @changed="includes.shape = $event"
          />
          <Checkboxes
            :options="types"
            id="type"
            label="Type"
            @changed="includes.type = $event"
          />
          <Checkboxes
            :options="colors"
            id="color"
            label="Color"
            @changed="includes.color = $event"
          />
        </form>
      </aside>
      <section class="md:col-span-3">
        <Message v-if="!signs || !signs.length" color="blue" variant="light">
          Loading signs..
        </Message>
        <ul v-else class="list-none flex flex-col gap-4">
          <li v-for="sign in signs" :key="sign.code">
            <article class="flex flex-col sm:flex-row items-start gap-4">
              <figure>
                <Box
                  v-if="!sign.image"
                  color="gray"
                  variant="light"
                  class="flex justify-center items-center h-32 w-32 p-4"
                >
                  Sign image here
                </Box>
                <img v-else :src="sign.image.thumbnail" />
              </figure>
              <main class="flex-1 prose">
                <header class="inline-flex items-start gap-4">
                  <h2 class="mt-0">
                    {{ sign.code }}
                  </h2>
                  <Status :status="sign.status" />
                </header>
                <p>{{ sign.legend }}</p>
              </main>
              <aside class="flex gap-4">
                <router-link
                  :to="`/${sign.code}`"
                  custom
                  v-slot="{ href, navigate }"
                >
                  <Anchor :url="href" @click="navigate" class="no-underline">
                    View
                  </Anchor>
                </router-link>
                <router-link
                  :to="`/${sign.code}/edit`"
                  custom
                  v-slot="{ href, navigate }"
                >
                  <Anchor :url="href" @click="navigate" class="no-underline">
                    Edit
                  </Anchor>
                </router-link>
              </aside>
            </article>
          </li>
        </ul>
      </section>
    </main>
  </article>
</template>
