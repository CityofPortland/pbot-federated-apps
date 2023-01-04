<template>
  <Box
    :as="as"
    role="menu"
    tabindex="-1"
    aria-orientation="vertical"
    :aria-labelledby="id"
    :class="{ hidden: !open }"
    class="p-2 flex flex-col z-50"
  >
    <slot></slot>
  </Box>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Box from '@/elements/box/Box';

export default defineComponent({
  name: 'DropdownList',
  components: { Box },
  props: {
    as: {
      type: String,
      default: 'ul',
    },
    id: {
      type: String,
      required: true,
    },
    open: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
