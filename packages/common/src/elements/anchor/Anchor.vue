<template>
  <a
    :href="url"
    class="rounded focus:outline-none focus:ring-2 focus:ring-black"
  >
    <slot name="before"></slot>
    <span :class="{ ...borderClasses }">
      <slot>{{ url }}</slot>
    </span>
    <slot name="after">
      <Icon
        v-if="externalIcon"
        type="solid"
        name="external-link"
        class="h-4 w-4 ml-1 inline"
      />
    </slot>
  </a>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import Icon from '@/elements/icon/Icon.vue';

export default defineComponent({
  name: 'Anchor',
  components: { Icon },
  props: {
    url: {
      type: String,
      required: true,
    },
    border: {
      type: Boolean,
      default: true,
    },
    external: {
      type: Boolean,
    },
  },
  setup(props) {
    return {
      externalIcon:
        props.external === undefined
          ? props.external
          : /[////]{2}/.test(props.url), // matches '//'
      borderClasses: computed(() => {
        return {
          'border-b-2': props.border,
          'border-current': props.border,
        };
      }),
    };
  },
});
</script>
