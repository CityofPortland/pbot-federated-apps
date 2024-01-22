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
import { computed, defineComponent, toRefs } from 'vue';
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
    const { checked, disabled, required } = toRefs(props);

    return {
      classes: computed(() => {
        const { classes } = useInput(disabled);

        if (props.required && !checked.value) {
          classes.value.push('outline', 'outline-offset-1', 'outline-red-500');
        }

        return classes.value;
      }),
      invalid: computed(() => required.value),
    };
  },
});
</script>
