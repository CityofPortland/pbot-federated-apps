<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import {
  Anchor,
  Box,
  Checkboxes,
  Input,
  Message,
  Pager,
} from '@pbotapps/components';

import MissingImage from '../components/MissingImage.vue';
import Status from '../components/Status.vue';
import { useStore } from '../store';
import { SHAPES, STATUSES } from '../types';

const store = useStore();
const { refreshSigns } = useStore();
const query = ref('');

const includes = reactive({
  color: new Array<string>(),
  shape: [],
  status: ['in_use'],
  type: new Array<string>(),
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
    results = results.filter(
      s => s.color && s.color.some(c => includes.color.some(i => i == c))
    );
  }

  if (includes.shape.length) {
    results = results.filter(s => includes.shape.some(i => i == s.shape));
  }

  if (includes.status.length) {
    results = results.filter(s => includes.status.some(i => i == s.status));
  }

  if (includes.type.length) {
    results = results.filter(
      s => s.type && s.type.some(t => includes.type.some(i => i == t))
    );
  }

  return results;
});

const pageIndex = ref(0);
const PAGE_SIZE = 10;

const pageLength = computed(() => [
  ...Array(Math.floor(signs.value.length / PAGE_SIZE + 1)).keys(),
]);

const page = computed(() =>
  signs.value.slice(
    pageIndex.value * PAGE_SIZE,
    (pageIndex.value + 1) * PAGE_SIZE
  )
);

watchEffect(() => {
  if (pageLength.value.length < pageIndex.value) {
    pageIndex.value = pageLength.value.length - 1;
  }
});

type Include = {
  id: string;
  checked: boolean;
  count: number;
  label: string;
  value: string;
};

const sort = (a: Include, b: Include) =>
  b.count != a.count ? b.count - a.count : a.id > b.id ? 1 : -1;

const colors = computed(() => {
  const [unique, counts] = store.data.signs.reduce(
    (acc, curr) => {
      if (curr.color)
        curr.color.forEach(c => {
          acc[0].add(c);
          acc[1].set(c, (acc[1].get(c) || 0) + 1);
        });
      return acc;
    },
    [new Set<string>(), new Map<string, number>()]
  );

  return [...unique.values()]
    .map(c => ({
      id: c,
      checked: includes.color.includes(c),
      count: counts.get(c) || 0,
      label: `${c} (${counts.get(c) || 0})`,
      value: c,
    }))
    .sort(sort);
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
    .sort(sort);
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
    .sort(sort);
});

const types = computed(() => {
  const counts = store.data.signs.reduce((acc, curr) => {
    if (curr.type && curr.type.length)
      curr.type.forEach(c => acc.set(c, (acc.get(c) || 0) + 1));

    return acc;
  }, new Map<string, number>());

  return [...counts.keys()]
    .map(c => ({
      id: c,
      checked: includes.type.includes(c),
      count: counts.get(c) || 0,
      label: `${c} (${counts.get(c) || 0})`,
      value: c,
    }))
    .sort(sort);
});
</script>

<template>
  <article>
    <header
      class="prose prose-lg max-w-none flex flex-col sm:flex-row justify-between items-start"
    >
      <h1>Signs</h1>
      <nav class="flex gap-4">
        <router-link to="/add" custom v-slot="{ href, navigate }">
          <Anchor :url="href" @click="navigate" class="no-underline">
            Add sign
          </Anchor>
        </router-link>
        <router-link to="/" custom v-slot="{ href }">
          <Anchor
            :url="href"
            @click.prevent="refreshSigns"
            class="no-underline"
          >
            Refresh signs
          </Anchor>
        </router-link>
      </nav>
    </header>
    <main class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      <aside>
        <form class="grid grid-cols-1 gap-4">
          <Input
            type="search"
            v-model="query"
            placeholder="Search..."
            class="w-full"
          />
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
        <Message
          v-if="!store.data.signs || !store.data.signs.length"
          color="blue"
          variant="light"
        >
          Loading signs..
        </Message>
        <div v-else class="grid grid-cols-1 gap-4">
          <p class="mb-4">
            Showing {{ pageIndex * PAGE_SIZE + 1 }} -
            {{ Math.min((pageIndex + 1) * PAGE_SIZE, signs.length) }} of
            {{ signs.length }} signs
          </p>
          <ul class="list-none flex flex-col gap-4">
            <li v-for="sign in page" :key="sign.code">
              <article class="flex flex-col sm:flex-row items-start gap-4">
                <figure>
                  <MissingImage v-if="!sign.image" class="w-32 h-32" />
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
          <Pager
            :value="pageIndex"
            :list="pageLength"
            @select="pageIndex = $event.index"
            class="justify-self-center"
          />
        </div>
      </section>
    </main>
  </article>
</template>
