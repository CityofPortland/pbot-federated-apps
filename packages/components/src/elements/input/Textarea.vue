<script setup lang="ts">
import { toRefs } from 'vue';
import { useInput } from '@/composables/use-input';

const props = defineProps({
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
  modelValue: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(['changed', 'keypress', 'update:modelValue']);

const { required, disabled, modelValue } = toRefs(props);

const { classes } = useInput(required, disabled, modelValue);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value: string | undefined = target.value;

  if (!(value == modelValue?.value)) {
    emit('update:modelValue', value);
    emit('changed', value);
  }
};
</script>

<template>
  <textarea
    :id="id"
    :name="id"
    :required="required"
    :disabled="disabled"
    :class="classes"
    class="px-2 py-1"
    :value="modelValue"
    @input.prevent="handleInput"
  />
</template>
