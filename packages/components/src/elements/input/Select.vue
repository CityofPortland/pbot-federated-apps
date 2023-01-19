<template>
  <select
    :id="id"
    :name="name"
    :class="classes"
    :required="required"
    :multiple="multiple"
    @change="handleChange"
  >
    <option v-if="placeholder" value="" disabled selected>
      {{ placeholder }}
    </option>
    <slot></slot>
  </select>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

import { useInput } from '@/composables/use-input';

export default defineComponent({
  name: 'Select',
  props: {
    id: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: [String, Array<string>],
    },
    multiple: { type: Boolean, default: false },
    name: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const handleChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;

      let value: string | Array<string> | undefined = props.multiple
        ? []
        : undefined;

      for (const option of target.options) {
        if (option.selected) {
          if (props.multiple) {
            value = [...value, option.value];
          } else {
            value = option.value;
          }
        }
      }

      emit('update:modelValue', value);
      emit('changed', value);
    };

    const { disabled, modelValue, required } = toRefs(props);

    const { classes } = useInput(required, disabled, modelValue);

    return {
      classes,
      handleChange,
    };
  },
});
</script>
