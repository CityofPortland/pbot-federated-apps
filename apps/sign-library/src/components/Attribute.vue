<script setup lang="ts">
import { Box } from '@pbotapps/components';

defineProps({
  name: {
    required: true,
    type: String,
  },
});
</script>

<template>
  <Box class="inline-flex gap-2">
    <slot name="icon"></slot>
    <div class="text-sm leading-tight">
      <label class="font-semibold text-sm">{{ name }}</label>
      <p>
        <slot></slot>
      </p>
    </div>
  </Box>
</template>
