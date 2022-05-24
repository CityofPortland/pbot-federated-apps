<template>
  <Box
    as="ul"
    role="listbox"
    tabindex="-1"
    aria-orientation="vertical"
    class="grid grid-cols-1 gap-1"
    :class="{ hidden: !open }"
  >
    <slot></slot>
  </Box>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Box from '@/elements/box/Box';

export default defineComponent({
  name: 'CandidateList',
  components: { Box },
  props: {
    open: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
