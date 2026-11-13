<template>
  <section :id="id">
    <div v-html="content"></div>
    <Section
      v-for="section in sections"
      :key="section.id"
      :id="section.id"
      :content="section.content"
      :sections="section.sections"
    />
  </section>
</template>

<script setup lang="ts">
import type { TextSection } from '../../store/text';

defineProps<{
  id: string;
  content: string;
  sections?: TextSection[];
}>();
</script>
