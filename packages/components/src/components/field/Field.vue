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
  props: {
    name: { type: String, required: true },
    display: {
      type: String as () => DisplayType,
      default: 'inline',
    },
  },
  setup(props) {
    return {
      labelClasses: computed(() => {
        const m = new Map<DisplayType, string[]>([
          ['hidden', ['sr-only']],
          ['inline', ['sm:w-1/3']]
        ]);

        return m.get(props.display) || [];
      }),
      layoutClasses: computed(() => {
        const m = new Map<DisplayType, string[]>([
          ['inline', ['sm:flex-row']],
        ]);

        return ['flex', 'flex-col', 'gap-1'].concat(
          ...(m.get(props.display) || [])
        );
      }),
      valueClasses: computed(() => {
        const m = new Map<DisplayType, string[]>([
          ['inline', ['flex-1']],
        ]);

        return ['break-words', ...(m.get(props.display) || [])];
      }),
    };
  },
});
</script>
