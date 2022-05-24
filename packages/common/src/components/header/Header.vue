<template>
  <Box as="nav" :color="color" :variant="variant">
    <div class="px-4">
      <div class="flex items-center space-x-3 h-16">
        <div class="flex items-center truncate">
          <!-- @slot Branding area, should contain app name and logo -->
          <slot name="branding"></slot>
        </div>
        <div
          v-if="hasMenu"
          class="hidden md:flex md:flex-row items-center flex-grow"
        >
          <!-- @slot Menu area, should contain navigation menu for the site -->
          <slot name="menu"></slot>
        </div>
        <div v-if="hasMenu" class="-mr-2 flex md:hidden flex-grow">
          <button
            class="inline-flex items-center justify-center p-2 ml-auto rounded-md hover:opacity-50"
            :class="buttonClasses"
            @click="handleToggle"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="h-6 w-6"
              :class="{ hidden: open, block: !open }"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              class="h-6 w-6"
              :class="{ hidden: !open, block: open }"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="px-4 md:hidden" :class="{ hidden: !open }">
      <slot name="menu"></slot>
    </div>
  </Box>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import Box, { BoxColor, BoxColorVariant } from '@/elements/box/Box';

export default defineComponent({
  name: 'Header',
  components: { Box },
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String as () => BoxColor,
      default: 'white',
    },
    variant: {
      type: String as () => BoxColorVariant,
      default: 'neutral',
    },
  },
  setup(props, { slots, emit }) {
    const hasMenu = slots.menu !== undefined;

    const buttonClasses = computed(() => {
      const classMap = new Map([
        ['white', []],
        [
          'cyan',
          [
            'hover:bg-cyan-300',
            'focus:bg-cyan-300',
            'focus:ring-offset-cyan-500',
          ],
        ],
        [
          'gray',
          [
            'hover:bg-gray-400',
            'focus:bg-gray-400',
            'focus:ring-offset-gray-500',
          ],
        ],
        [
          'orange',
          [
            'hover:bg-orange-400',
            'focus:bg-orange-400',
            'focus:ring-offset-orange-500',
          ],
        ],
        [
          'blue',
          [
            'hover:bg-blue-400',
            'focus:bg-blue-400',
            'focus:ring-offset-blue-500',
          ],
        ],
      ]);

      return classMap.get(props.color);
    });

    const handleToggle = () => {
      emit('toggle');
    };

    return {
      hasMenu,
      buttonClasses,
      handleToggle,
    };
  },
});
</script>
