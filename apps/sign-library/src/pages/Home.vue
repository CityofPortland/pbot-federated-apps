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
import { computed, ref } from 'vue';
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
import { SHAPES, STATUSES, Sign, TYPES } from '../types';

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

  results = results.sort((a, b) =>
    a[sort.value]
      ? b[sort.value]
        ? (a[sort.value] || 0) < (b[sort.value] || 0)
          ? sortOrder.value == 'desc'
            ? 1
            : -1
          : sortOrder.value == 'asc'
          ? 1
          : -1
        : 0
      : 0
  );

  return results;
});

const pageIndex = computed(
  () => Number.parseInt(route.query.page as string) - 1
);

const pageSize = computed(
  () => Number.parseInt(route.query.pageSize as string) || 0
);

const pageLength = computed(() => [
  ...Array(Math.floor(signs.value.length / pageSize.value + 1)).keys(),
]);

const getPage = () => {
  let start = pageIndex.value * pageSize.value;
  let end = (pageIndex.value + 1) * pageSize.value;

  if (start >= signs.value.length) {
    changeQuery({ page: ['1'] });
  }

  let s = signs.value.slice(start, end);

  return s;
};

const sort = computed<keyof Sign>(() => route.query.sort as keyof Sign);

const sortOrder = computed<'asc' | 'desc'>(
  () => route.query.sortOrder as 'asc' | 'desc'
);
// watchEffect(() => {
//   if (pageLength.value.length < pageIndex.value) {
//     pageIndex.value = pageLength.value.length - 1;
//   }
// });

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
  if (!field.value || field.value == 'none') return undefined;

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
      id: x || 'NULL',
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
        <form class="grid grid-cols-1 gap-4" @submit.prevent="">
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
                v-model="field"
                @changed="
                  field = $event;
                  includes[$event] = [];
                "
                class="px-2 py-1"
              >
                <option value="none">none</option>
                <option
                  v-for="key in Object.keys(signs[0])
                    .filter(key => !key.startsWith('_'))
                    .filter(
                      key =>
                        ![
                          'color',
                          'comment',
                          'shape',
                          'status',
                          'type',
                        ].includes(key)
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
            :options="types"
            id="type"
            label="Type"
            @changed="changeQuery({ type: $event })"
          />
          <Checkboxes
            :options="shapes"
            id="shape"
            label="Shape"
            @changed="changeQuery({ shape: $event })"
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
          <div class="flex flex-wrap gap-4">
            <Entry id="pageSize" label="Page size" v-slot="{ id }">
              <Select
                :id="id"
                :name="id"
                @changed="changeQuery({ pageSize: $event })"
                class="px-2 py-1"
              >
                <option :value="10" :selected="pageSize == 10">10</option>
                <option :value="20" :selected="pageSize == 20">20</option>
                <option :value="50" :selected="pageSize == 50">50</option>
              </Select>
            </Entry>
            <Entry id="sort" label="Sort by" v-slot="{ id }">
              <Select
                :id="id"
                :name="id"
                @changed="changeQuery({ sort: $event })"
                class="px-2 py-1"
              >
                <option value="_id" :selected="sort == '_id'">code</option>
                <option value="_changed" :selected="sort == '_changed'">
                  date changed
                </option>
                <option value="_created" :selected="sort == '_created'">
                  date created
                </option>
              </Select>
            </Entry>
            <Entry id="sortOrder" label="Sort order" v-slot="{ id }">
              <Select
                :id="id"
                :name="id"
                @changed="changeQuery({ sortOrder: $event })"
                class="px-2 py-1"
              >
                <option value="asc" :selected="sortOrder == 'asc'">
                  ascending
                </option>
                <option value="desc" :selected="sortOrder == 'desc'">
                  descending
                </option>
              </Select>
            </Entry>
          </div>
          <p class="text-center">
            Showing {{ pageIndex * pageSize + 1 }} -
            {{ Math.min((pageIndex + 1) * pageSize, signs.length) }} of
            {{ signs.length }} signs
          </p>
          <ul class="list-none flex flex-col divide-y divide-current">
            <li v-for="sign in getPage()" :key="sign.code" class="py-8">
              <article class="flex flex-col sm:flex-row items-start gap-4">
                <figure>
                  <MissingImage
                    v-if="!sign.image || !sign.image.thumbnail"
                    class="w-32 h-32"
                  />
                  <img
                    async
                    loading="lazy"
                    v-else
                    :src="sign.image.thumbnail"
                    :alt="sign.legend"
                  />
                </figure>
                <main class="flex-1 w-full flex flex-col gap-4">
                  <header class="inline-flex items-center gap-4">
                    <h2 class="text-3xl font-bold leading-none">
                      {{ sign.code }}
                    </h2>
                    <Status :status="sign.status" />
                  </header>
                  <p class="text-lg">{{ sign.legend }}</p>
                  <section class="flex flex-wrap gap-2">
                    <Box
                      class="inline-flex items-center gap-2 border border-current rounded-md"
                    >
                      <Box
                        color="gray"
                        variant="light"
                        class="flex justify-center items-center border-r border-current rounded-l-md h-full px-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </Box>
                      <div class="px-2 py-1 text-sm leading-tight">
                        <label class="font-semibold text-sm">Type</label>
                        <p>
                          {{ sign.type }}
                        </p>
                      </div>
                    </Box>
                    <Box
                      class="inline-flex items-center gap-2 border border-current rounded-md"
                    >
                      <Box
                        color="gray"
                        variant="light"
                        class="flex justify-center items-center border-r border-current rounded-l-md h-full px-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z"
                          />
                        </svg>
                      </Box>
                      <div class="px-2 py-1 text-sm leading-tight">
                        <label class="font-semibold text-sm">Shape</label>
                        <p>
                          {{ sign.shape }}
                        </p>
                      </div>
                    </Box>
                    <Box
                      class="inline-flex items-center gap-2 border border-current rounded-md"
                    >
                      <Box
                        color="gray"
                        variant="light"
                        class="flex justify-center items-center border-r border-current rounded-l-md h-full px-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
                          />
                        </svg>
                      </Box>
                      <div class="px-2 py-1 text-sm leading-tight">
                        <label class="font-semibold text-sm">Color</label>
                        <p>
                          {{ sign.color }}
                        </p>
                      </div>
                    </Box>
                    <Box
                      class="inline-flex items-center gap-2 border border-current rounded-md"
                    >
                      <Box
                        color="gray"
                        variant="light"
                        class="flex justify-center items-center border-r border-current rounded-l-md h-full px-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                          />
                        </svg>
                      </Box>
                      <div class="px-2 py-1 text-sm leading-tight">
                        <label class="font-semibold text-sm">Size</label>
                        <p>
                          {{ `${sign.width}" by ${sign.height}"` || 'NULL' }}
                        </p>
                      </div>
                    </Box>
                  </section>
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
            v-if="pageLength"
            :value="pageIndex"
            :list="pageLength"
            @select="changeQuery({ page: $event.index + 1 })"
            class="justify-self-center"
          />
        </div>
      </section>
    </main>
  </article>
</template>
