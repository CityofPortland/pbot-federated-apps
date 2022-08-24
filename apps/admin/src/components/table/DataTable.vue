<script setup lang="ts">
import { computed, toRefs } from 'vue';

import { Box } from '@pbotapps/common';

const props = defineProps({
  data: {
    type: Array<Record<string, unknown>>,
    required: true,
  },
});

const { data } = toRefs(props);

const keys = computed(() =>
  data.value.reduce((acc, curr) => {
    for (const key in curr) {
      if (Object.prototype.hasOwnProperty.call(curr, key)) {
        acc.add(key);
      }
    }
    return acc;
  }, new Set<string>())
);
</script>

<template>
  <table>
    <thead>
      <Box as="tr" color="gray" variant="light">
        <th
          v-for="key in keys"
          :key="key"
          class="border-b font-bold p-4 text-left capitalize"
        >
          {{ key }}
        </th>
      </Box>
    </thead>
    <tbody>
      <tr v-for="(e, i) in data" :key="i">
        <td v-for="key in keys" :key="key" class="border-b p-4">
          {{ e[key] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
