<template>
  <li>
    <slot>
      <Anchor :url="url" v-bind="$attrs">
        {{ display }}
      </Anchor>
    </slot>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Anchor from '@/elements/anchor/Anchor.vue';

export default defineComponent({
  name: 'NavItem',
  components: { Anchor },
  inheritAttrs: false,
  props: {
    url: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  setup(props) {
    return {
      display: props.text || props.url,
    };
  },
});
</script>
