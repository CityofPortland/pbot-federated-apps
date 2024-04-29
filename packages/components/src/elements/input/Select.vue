<template>
  <select
    :id="id"
    :name="name"
    :class="classes"
    :required="required"
    :multiple="multiple"
    class="px-2 py-1"
    @change="handleChange"
  >
    <option v-if="placeholder && !modelValue" value="">
      {{ placeholder }}
    </option>
    <slot></slot>
  </select>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

import { useInput } from '../../composables/use-input';

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

      for (const option of Array.from(target.options)) {
        if (option.selected) {
          if (props.multiple) {
            value = [...(value as string[]), option.value];
          } else {
            value = option.value;
          }
        }
      }

      emit('update:modelValue', value);
      emit('changed', value);
    };

    const { disabled } = toRefs(props);

    const { classes } = useInput(disabled);

    return {
      classes,
      handleChange,
    };
  },
});
</script>
