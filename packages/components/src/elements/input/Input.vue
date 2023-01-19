<template>
  <input
    :id="id"
    :name="id"
    :type="type"
    :required="required"
    :disabled="disabled"
    :pattern="pattern"
    :class="classes"
    class="px-2 py-1"
    :value="modelValue"
    @input.prevent="handleInput"
  />
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { TextInputType, useInput } from '@/composables/use-input';

export default defineComponent({
  name: 'Input',
  props: {
    id: {
      type: String,
      required: true,
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
    pattern: {
      type: String,
    },
    patternModifiers: {
      type: Object,
      default: () => ({}),
    },
    size: {
      type: Number,
    },
    modelValue: {
      type: [String, Number],
      default: undefined,
    },
    modelModifiers: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['changed', 'keypress', 'update:modelValue'],
  setup(props, { emit }) {
    const { required, disabled, modelValue } = toRefs(props);

    const { classes } = useInput(required, disabled, modelValue);

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      let value: string | undefined = target.value;

      if (props.pattern && props.patternModifiers.input) {
        const regex = new RegExp(props.pattern);
        const matches = regex.exec(value);

        // if any part matches, keep the first part, otherwise, clear
        matches
          ? (value = target.value = matches[0])
          : (value = target.value = '');
      }

      if (props.size) {
        if (value.length >= props.size) {
          value = value.substring(0, props.size);
          target.value = value;
        }
      }

      const modifierMap = new Map<string, (value: string) => string>([
        ['uppercase', value => value.toLocaleUpperCase()],
        ['lowercase', value => value.toLocaleLowerCase()],
        [
          'capitalize',
          value => value.charAt(0).toLocaleUpperCase() + value.slice(1),
        ],
      ]);

      if (value) {
        Object.keys(props.modelModifiers).forEach(modifier => {
          const func = modifierMap.get(modifier);

          if (func && value) {
            value = func(value);
          }
        });
      }

      if (!(value == modelValue.value)) {
        emit('update:modelValue', value);
        emit('changed', value);
      }
    };

    return {
      classes,
      handleInput,
    };
  },
});
</script>
