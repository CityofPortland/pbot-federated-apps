<template>
  <Box
    :color="color"
    :variant="variant"
    class="p-4 border border-current rounded shadow flex gap-4 w-full"
  >
    <Icon v-if="icon" type="outline" :name="icon" class="h-6 w-6 flex-shrink-0" />
    <div class="flex flex-col space-y-3">
      <p class="font-semibold" v-if="summary">{{ summary }}</p>
      <slot></slot>
    </div>
    <Icon
      v-if="dismissible"
      type="outline"
      name="x"
      class="h-6 w-6 flex-shrink-0 ml-auto"
      @click="$emit('close')"
    />
  </Box>
</template>

<script lang="ts">
import Box, { type BoxColor, type BoxColorVariant } from '@/elements/box/Box'
import { defineComponent } from 'vue'
import Icon from '@/elements/icon/Icon.vue'

export default defineComponent({
  components: {
    Icon,
    Box
  },
  props: {
    color: {
      type: String as () => BoxColor,
      default: 'transparent'
    },
    dismissible: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String as () => BoxColorVariant,
      default: 'neutral'
    },
    summary: {
      type: String,
      required: false
    },
    icon: {
      type: String,
      required: false
    }
  },
  emits: ['close']
})
</script>
