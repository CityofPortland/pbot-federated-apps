<template>
  <input
    :id="id"
    :name="id"
    type="file"
    :required="required"
    :disabled="disabled"
    :multiple="multiple"
    :class="classes"
    class="px-2 py-1"
    @input.prevent="handleInput"
  />
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { type TextInputType, useInput } from '../../composables/use-input';

export default defineComponent({
  name: 'Input',
  props: {
    id: {
      type: String,
      required: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String as () => TextInputType,
      default: 'text',
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: FileList,
    },
  },
  emits: ['changed', 'keypress', 'update:modelValue'],
  setup(props, { emit }) {
    const { disabled } = toRefs(props);

    const { classes } = useInput(disabled);

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;

      emit('update:modelValue', target.files);
      emit('changed', target.files);
    };

    return {
      classes,
      handleInput,
    };
  },
});
</script>
