<script setup lang="ts">
import {
  IconSortAscending2,
  IconSortDescending2,
  IconArrowsSort,
} from '@tabler/icons-vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  sortByName: {
    type: String,
    required: true,
  },
  sortDirection: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <IconSortAscending2
    class="inline ml-1"
    :size="22"
    v-if="props.sortByName === props.name && sortDirection == 'ASC'"
  ></IconSortAscending2>
  <IconSortDescending2
    class="inline ml-1"
    :size="22"
    v-if="props.sortByName == props.name && sortDirection == 'DESC'"
  ></IconSortDescending2>
  <IconArrowsSort
    class="inline ml-1"
    :size="18"
    v-if="props.sortByName != props.name"
  ></IconArrowsSort>
</template>
