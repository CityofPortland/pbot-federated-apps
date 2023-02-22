<script setup lang="ts">
import { Box } from '@pbotapps/components';
import { computed } from 'vue';
import { Status } from '../types';

const props = defineProps({
  status: {
    type: String as () => Status,
  },
});

const status = computed(() =>
  props.status == 'in_use' ? 'in use' : props.status
);
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
