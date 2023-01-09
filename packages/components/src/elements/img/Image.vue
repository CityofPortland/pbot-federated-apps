<template>
  <img :srcset="srcset" />
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'Image',
  props: {
    src: {
      type: String,
      required: true,
    },
    sizes: {
      type: Array as () => Array<number>,
      default: () => [2048, 1024, 640],
    },
  },
  setup(props) {
    const srcset = computed(() => {
      const parts = props.src.split('.');
      const ext = parts.splice(-1);
      const filename = parts.join('');

      return props.sizes
        .map(size => `${filename}@${size}.${ext} ${size}w,`)
        .reduce((acc, curr) => {
          return acc.concat(curr);
        }, '');
    });
    return { srcset };
  },
});
</script>
