<script setup lang="ts">
import { Box } from '@pbotapps/components';
import { computed } from 'vue';
import { Status } from '../types';

const props = defineProps({
  comment: {
    type: String,
  },
});

const comment = computed(() => {
  const markup = '<p>{}</p>';
  markup.replace('{}', props.comment?.replace());
});
</script>

<template>
  <Box
    as="span"
    color="gray"
    variant="light"
    class="border border-current rounded px-1 text-sm"
  >
    {{ status || 'NULL' }}
  </Box>
</template>
