<template>
  <nav
    class="p-2 border border-gray-500 rounded bg-gray-100 flex items-center justify-between text-gray-900"
  >
    <button
      title="Go to previous page"
      rel="prev"
      class="py-2 px-3 rounded-md hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
      :class="{
        invisible: value == 0,
      }"
      :disabled="value == 0"
      @click="$emit('select', { index: value - 1, item: list[value - 1] })"
      @keyup.enter="
        $emit('select', { index: value - 1, item: list[value - 1] })
      "
    >
      <span class="sr-only">Previous page</span>
      <span class="flex items-center">
        <Icon type="solid" name="chevron-left" class="w-5 h-5" />
      </span>
    </button>
    <span class="mx-2">{{ value + 1 }} of {{ list.length }}</span>
    <button
      title="Go to next page"
      rel="prev"
      class="py-2 px-3 rounded-md hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
      :class="{
        invisible: list.length == value + 1,
      }"
      :disabled="list.length == value + 1"
      @click="$emit('select', { index: value + 1, item: list[value + 1] })"
      @keyup.enter="
        $emit('select', { index: value + 1, item: list[value + 1] })
      "
    >
      <span class="sr-only">Next page</span>
      <span class="flex items-center">
        <Icon type="solid" name="chevron-right" class="w-5 h-5" />
      </span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { Icon } from '@pbotapps/components';

withDefaults(defineProps<{ value?: number; list: unknown[] }>(), {
  value: 0,
});
</script>
