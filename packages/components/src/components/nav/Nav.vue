<template>
  <nav>
    <h2 v-if="title" class="text-lg font-bold mb-4">{{ title }}</h2>
    <ul class="list-none" :class="listClass">
      <slot></slot>
    </ul>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Nav',
  props: {
    title: String,
    listClass: String,
  },
});
</script>
