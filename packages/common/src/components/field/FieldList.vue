<template>
  <Box :as="as" class="grid grid-cols-1">
    <slot></slot>
  </Box>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Box, { BoxProps } from '@/elements/box/Box';

export default defineComponent({
  name: 'FieldList',
  components: { Box },
  props: {
    ...BoxProps,
    as: {
      type: String,
      default: 'dl',
    },
  },
});
</script>
