<template>
  <div :class="layoutClasses">
    <dt class="font-semibold" :class="labelClasses">
      <slot name="name">{{ name }}</slot>
    </dt>
    <dd :class="valueClasses">
      <slot></slot>
    </dd>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

type DisplayType = 'inline' | 'above' | 'hidden';

export default defineComponent({
  name: 'Field',
  props: {
    name: { type: String, required: true },
    display: {
      type: String as () => DisplayType,
      default: 'inline',
    },
  },
  setup(props) {
    return {
      layoutClasses: computed(() => {
        const m = new Map<DisplayType, string[]>([
          ['inline', ['sm:grid-cols-3']],
        ]);

        return ['grid', 'grid-cols-1', 'gap-1'].concat(
          ...(m.get(props.display) || [])
        );
      }),
      labelClasses: computed(() => {
        const m = new Map<DisplayType, string[]>([['hidden', ['sr-only']]]);

        return m.get(props.display) || [];
      }),
      valueClasses: computed(() => {
        const m = new Map<DisplayType, string[]>([
          ['inline', ['sm:col-span-2']],
        ]);

        return ['break-words', ...(m.get(props.display) || [])];
      }),
    };
  },
});
</script>
