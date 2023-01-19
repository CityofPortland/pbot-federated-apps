<script setup lang="ts">
import { computed, toRefs } from 'vue';

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  inline: { type: Boolean },
});

const { inline, required, disabled } = toRefs(props);

const layoutClasses = computed(() => ({
  'md:grid': inline.value,
  'md:grid-cols-3': inline.value,
  flex: !inline.value,
  'flex-col': !inline.value,
  'items-center': inline.value,
  'gap-2': true,
  'opacity-50': disabled.value,
}));

const labelClasses = computed(() => ({
  'font-semibold': true,
}));

const inputClasses = computed(() => ({
  'col-span-2': inline.value,
}));
</script>

<template>
  <div :class="layoutClasses">
    <slot
      name="label"
      :id="id"
      :required="required"
      :disabled="disabled"
      :label="label"
    >
      <label :id="`${id}-label`" :class="labelClasses">{{ label }}</label>
    </slot>
    <div :class="inputClasses">
      <slot :id="id" :required="required" :disabled="disabled"></slot>
    </div>
  </div>
</template>
