<template>
  <div class="inline-flex items-center space-x-2 cursor-pointer">
    <Box
      as="button"
      :color="modelValue ? 'blue' : 'red'"
      variant="light"
      :id="id"
      role="switch"
      :aria-checked="String(modelValue)"
      :aria-labelledby="`${id}-label`"
      :class="classes"
      class="inline-flex items-center text-sm p-1"
      @click="toggle"
    >
      <Box
        as="span"
        :color="modelValue ? 'blue' : 'transparent'"
        class="px-1 rounded"
        :class="{ 'shadow-lg': modelValue }"
        >on</Box
      >
      <Box
        as="span"
        :color="modelValue ? 'transparent' : 'red'"
        class="px-1 rounded"
        :class="{ 'shadow-lg': modelValue }"
        >off</Box
      >
    </Box>
    <slot>
      <label :id="`${id}-label`">{{ label }}</label>
    </slot>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue';

import Box from '@/elements/box/Box';
import { useInput } from '@/composables/use-input';

export default defineComponent({
  name: 'Toggle',
  components: { Box },
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    modelValue: Boolean,
  },
  setup(props, { emit }) {
    const { modelValue } = toRefs(props);

    const { classes } = useInput(ref(false));

    return {
      classes,
      toggle() {
        emit('update:modelValue', !modelValue.value);
        emit('changed', modelValue.value);
      },
    };
  },
});
</script>
