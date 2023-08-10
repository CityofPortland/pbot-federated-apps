<template>
  <div class="flex items-center">
    <input
      :id="id"
      :name="id"
      type="checkbox"
      :required="required"
      :disabled="disabled"
      :class="classes"
      class="mr-1"
      :checked="checked"
      @input="$emit('changed', id)"
    />
    <label :for="id"><slot></slot></label>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useInput } from '@/composables/use-input';

export default defineComponent({
  name: 'Checkbox',
  props: {
    checked: { type: Boolean, required: true },
    id: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  inheritAttrs: false,
  setup(props) {
    const { disabled } = toRefs(props);

    const { classes } = useInput(disabled);

    return {
      classes,
    };
  },
});
</script>
