<template>
  <div ref="componentRef" class="relative">
    <Button
      :as="as"
      :color="color"
      :variant="variant"
      :size="size"
      :id="id"
      :label="label"
      :aria-expanded="open"
      aria-haspopup="true"
      class="w-full md:w-auto inline-flex items-center justify-between"
      @click="open = !open"
      v-bind="$attrs"
    >
      <slot name="label" :open="open" :id="id">
        <span>{{ label }}</span>
        <Icon
          type="solid"
          :name="open ? 'chevron-up' : 'chevron-down'"
          class="ml-2 w-5 h-5"
      /></slot>
    </Button>
    <!--
    Dropdown menu, show/hide based on menu state.

    Entering: "transition ease-out duration-100"
      From: "transform opacity-0 scale-95"
      To: "transform opacity-100 scale-100"
    Leaving: "transition ease-in duration-75"
      From: "transform opacity-100 scale-100"
      To: "transform opacity-0 scale-95"
  -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <slot :open="open" :id="id"></slot>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';

import { useWindowEvent } from '@/composables/useWindowEvent';

import Button from '@/elements/button/Button.vue';
import { ButtonSize } from '@/elements/button/Button.types';
import Icon from '@/elements/icon/Icon.vue';
import { BoxColor, BoxColorVariant } from '@/elements/box/Box';

export default defineComponent({
  name: 'DropDown',
  components: { Button, Icon },
  props: {
    as: {
      type: String,
      default: 'button',
    },
    label: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    size: {
      type: String as () => ButtonSize,
      default: 'medium',
    },
    color: {
      type: String as () => BoxColor,
      default: 'transparent',
    },
    variant: {
      type: String as () => BoxColorVariant,
      default: 'neutral',
    },
  },
  inheritAttrs: false,
  setup() {
    const componentRef: Ref<HTMLElement | null> = ref(null);
    const open = ref(false);

    const listener = (event: Event) => {
      let target = event.target as HTMLElement;

      if (!open.value) return;

      if (componentRef.value && componentRef.value.contains(target)) return;

      open.value = false;
    };

    useWindowEvent('focusin', listener);
    useWindowEvent('mousedown', listener);

    return {
      open,
      componentRef,
    };
  },
});
</script>
