<template>
  <Entry :id="id" :label="label" :required="required" v-slot="{ id }">
    <Checkbox
      v-for="option in options"
      :key="option.id"
      :id="option.id"
      :name="id"
      :value="option.value"
      :checked="option.checked"
      :required="invalid"
      @changed="toggle(option)"
    >
      {{ option.label }}
    </Checkbox>
  </Entry>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, toRefs } from 'vue';
import Entry from '../../components/field/Entry.vue';
import { useInput } from '../../composables/use-input';
import Checkbox from './Checkbox.vue';

type Option = { checked: boolean; id: string; label: string; value: string };

export default defineComponent({
  name: 'Checkboxes',
  components: { Checkbox, Entry },
  props: {
    id: {
      type: String,
      required: true,
    },
    label: { type: String, required: true },
    options: {
      type: Array<Option>,
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
      type: Array,
    },
  },
  setup(props, { emit }) {
    const { disabled } = toRefs(props);
    const options = reactive(props.options);

    const { classes } = useInput(disabled);

    return {
      classes,
      toggle: (option: Option) => {
        option.checked = !option.checked;
        const value = options
          .filter(option => option.checked)
          .map(option => option.value);
        emit('update:modelValue', value);
        emit('changed', value);
      },
      invalid: computed(() => {
        if (!props.required) return false;

        return options.find(o => o.checked) ? false : true;
      }),
    };
  },
});
</script>
