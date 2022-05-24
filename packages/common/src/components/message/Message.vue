<template>
  <Box
    :color="color"
    :variant="variant"
    class="p-4 border border-current rounded shadow flex space-x-4"
  >
    <Icon
      v-if="icon"
      type="outline"
      :name="icon"
      class="h-6 w-6 flex-shrink-0"
    />
    <div class="flex flex-col space-y-3">
      <p class="font-semibold" v-if="summary">{{ summary }}</p>
      <slot></slot>
    </div>
  </Box>
</template>

<script lang="ts">
import Box, { BoxColor, BoxColorVariant } from '@/elements/box/Box';
import { defineComponent } from 'vue';
import Icon from '@/elements/icon/Icon.vue';

export default defineComponent({
  components: {
    Icon,
    Box,
  },
  props: {
    color: {
      type: String as () => BoxColor,
      default: 'transparent',
    },
    variant: {
      type: String as () => BoxColorVariant,
      default: 'neutral',
    },
    summary: {
      type: String,
      required: false,
    },
    icon: {
      type: String,
      required: false,
    },
  },
});
</script>
