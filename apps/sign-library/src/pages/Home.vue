<script setup lang="ts">
import {
  Anchor,
  Box,
  Checkboxes,
  Entry,
  Input,
  Message,
  Pager,
  Select,
} from '@pbotapps/components';
import { computed, ref, watchEffect } from 'vue';
import {
  useRouter,
  useRoute,
  RouteQueryAndHash,
  LocationAsRelativeRaw,
  RouteLocationOptions,
} from 'vue-router';

import MissingImage from '../components/MissingImage.vue';
import Status from '../components/Status.vue';
import { useStore } from '../store';
import { SHAPES, STATUSES, TYPES } from '../types';

const route = useRoute();
const router = useRouter();
const store = useStore();
const { refreshSigns } = useStore();

const field = ref(route.query.field as string);
const query = ref(route.query.query as string);

const changeQuery = (query: Record<string, string[]>) => {
  changeRoute({
    query: {
      ...route.query,
      ...query,
    },
  });
};

const changeRoute = (
  to: RouteQueryAndHash & LocationAsRelativeRaw & RouteLocationOptions
) => {
  router.replace({
    ...route,
    query: {
      ...route.query,
      ...to.query,
    },
  });
};

const includes = computed(() =>
  Object.keys(route.query).reduce((acc, curr) => {
    acc[curr] = Array.isArray(route.query[curr])
      ? (route.query[curr] as string[])
      : [route.query[curr] as string];
    return acc;
  }, {} as Record<string, string[]>)
);

const signs = computed(() => {
  let results = store.data.signs;

  if (route.query.query) {
    const r = new RegExp(route.query.query as string, 'i');
    results = results.filter(
      s => r.test(s.code) || r.test(s.legend) || r.test(s.mutcdCode)
    );
  }

  if (includes.value.color && includes.value.color.length) {
    results = results.filter(
      s => s.color && s.color.some(c => includes.value.color.some(i => i == c))
    );
  }

  if (includes.value.shape && includes.value.shape.length) {
    results = results.filter(s => includes.value.shape.some(i => i == s.shape));
  }

  if (includes.value.status && includes.value.status.length) {
    results = results.filter(s =>
      includes.value.status.some(i => i == s.status)
    );
  }

  if (includes.value.type && includes.value.type.length) {
    results = results.filter(
      s => s.type && s.type.some(t => includes.value.type.some(i => i == t))
    );
  }

  if (includes.value[field.value] && includes.value[field.value].length) {
    results = results.filter(s =>
      includes.value[field.value].some(i => {
        if (!i) {
          // i is null, undefined, ''
          return (s as Record<string, unknown>)[field.value] ? false : true;
        }

        return i == (s as Record<string, unknown>)[field.value];
      })
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

const colors = computed(() => {
  const [unique, counts] = signs.value.reduce(
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
      checked: includes.value.color ? includes.value.color.includes(c) : false,
      count: counts.get(c) || 0,
      label: counts.get(c) ? `${c} (${counts.get(c)})` : `${c}`,
      value: c,
    }))
    .sort((a, b) => b.count - a.count);
});

const shapes = computed(() => {
  const counts = signs.value.reduce((acc, curr) => {
    acc.set(curr.shape, (acc.get(curr.shape) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  return SHAPES.map(x => ({
    id: x,
    checked: includes.value.shape
      ? includes.value.shape.some(i => i == x)
      : false,
    count: counts.get(x) || 0,
    label: counts.get(x) ? `${x} (${counts.get(x)})` : `${x}`,
    value: x,
  }));
});

const statuses = computed(() => {
  const counts = signs.value.reduce((acc, curr) => {
    acc.set(curr.status, (acc.get(curr.status) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  return STATUSES.map(x => {
    const count = counts.get(x) || 0;

    return {
      id: x,
      checked: includes.value.status
        ? includes.value.status.some(i => i == x)
        : false,
      count,
      label: counts.get(x) ? `${x} (${counts.get(x)})` : `${x}`,
      value: x,
    };
  });
});

const types = computed(() => {
  const counts = signs.value.reduce((acc, curr) => {
    if (curr.type && curr.type.length)
      curr.type.forEach(c => acc.set(c, (acc.get(c) || 0) + 1));

    return acc;
  }, new Map<string, number>());

  return TYPES.map(x => ({
    id: x,
    checked: includes.value.type
      ? includes.value.type.some(i => i == x)
      : false,
    count: counts.get(x) || 0,
    label: counts.get(x) ? `${x} (${counts.get(x)})` : `${x}`,
    value: x,
  }));
});

const property = (key: string, object: Record<string, any>) =>
  (object[key] || '').toString();

const fieldValues = computed(() => {
  if (!field.value) return undefined;

  const counts = signs.value.reduce((acc, curr) => {
    acc.set(
      property(field.value, curr),
      (acc.get(property(field.value, curr)) || 0) + 1
    );
    return acc;
  }, new Map<string, number>());

  return [...counts.keys()]
    .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))
    .slice(0, 20)
    .map(x => ({
      id: x,
      checked: includes.value[field.value]
        ? includes.value[field.value].some(i => i == x)
        : false,
      count: counts.get(x) || 0,
      label: `${x || 'NULL'} (${counts.get(x) || 0})`,
      value: x,
    }));
});
</script>

<template>
  <article>
    <header
      class="prose prose-lg max-w-none flex flex-col sm:flex-row justify-between items-start"
    >
      <h1>Search</h1>
      <nav class="flex gap-4">
        <router-link
          v-if="store.hasRule('create', 'sign')"
          to="/add"
          custom
          v-slot="{ href, navigate }"
        >
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
            id="query"
            type="search"
            v-model="query"
            placeholder="Search..."
            class="w-full"
            @changed="changeQuery({ query: $event })"
          />
          <Box class="p-2 border border-current rounded-md space-y-2">
            <Entry
              v-if="signs && signs.length"
              id="field"
              label="Field"
              v-slot="{ id }"
            >
              <Select
                :id="id"
                :name="id"
                placeholder="Select one"
                v-model="field"
                @changed="
                  field = $event;
                  includes[$event] = [];
                "
                class="px-2 py-1"
              >
                <option
                  v-for="key in Object.keys(signs[0])
                    .filter(key => !key.startsWith('_'))
                    .filter(
                      key => !['color', 'shape', 'status', 'type'].includes(key)
                    )"
                  :key="key"
                  :value="key"
                >
                  {{ key }}
                </option>
              </Select>
            </Entry>
            <Checkboxes
              v-if="fieldValues"
              :options="fieldValues"
              id="fieldValue"
              label="Field value(s)"
              @changed="changeQuery({ [field]: $event })"
          /></Box>
          <Checkboxes
            :options="statuses"
            id="status"
            label="Status"
            @changed="changeQuery({ status: $event })"
          />
          <Checkboxes
            :options="shapes"
            id="shape"
            label="Shape"
            @changed="changeQuery({ shape: $event })"
          />
          <Checkboxes
            :options="types"
            id="type"
            label="Type"
            @changed="changeQuery({ type: $event })"
          />
          <Checkboxes
            :options="colors"
            id="color"
            label="Color"
            @changed="changeQuery({ color: $event })"
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
                  <MissingImage
                    v-if="!sign.image || !sign.image.thumbnail"
                    class="w-32 h-32"
                  />
                  <img v-else :src="sign.image.thumbnail" />
                </figure>
                <main class="flex-1 space-y-4">
                  <header class="inline-flex items-center gap-4">
                    <h2 class="text-3xl font-bold leading-none">
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
                    v-if="store.hasRule('edit', 'sign')"
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
