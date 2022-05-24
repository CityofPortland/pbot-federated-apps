<template>
  <Box :as="as" role="menuitem" tabindex="-1">
    <slot></slot>
  </Box>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Box from '@/elements/box/Box';

export default defineComponent({
  name: 'DropdownItem',
  components: { Box },
  props: {
    as: {
      type: String,
      default: 'li',
    },
  },
});
</script>
