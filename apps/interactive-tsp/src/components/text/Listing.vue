<template>
  <li class="hover:text-blue-900">
    <router-link :to="{ hash: `#${id}` }" :class="classes">{{
      name
    }}</router-link>
    <ol v-if="depth < maxDepth">
      <Listing
        v-for="section in sections"
        :key="section.id"
        :id="section.id"
        :name="section.name"
        :depth="section.depth"
        :max-depth="maxDepth"
        :sections="section.sections"
      />
    </ol>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TextSection } from '../../store/text';

const props = defineProps<{
  id: string;
  name: string;
  depth: number;
  maxDepth: number;
  sections?: TextSection[];
}>();

const classes = computed(() => [
  'px-2',
  'py-1',
  'flex',
  'border-2',
  'border-transparent',
  'hover:text-blue-800',
  'focus:text-blue-800',
  'focus:border-2',
  'focus:border-current',
  props.depth == 0 ? 'font-bold' : 'font-base',
]);
</script>
