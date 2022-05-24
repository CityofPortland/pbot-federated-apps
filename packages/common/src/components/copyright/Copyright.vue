<template>
  <small class="grid grid-cols-1 gap-2">
    <slot>
      <h2 class="font-semibold text-lg">City of Portland, Oregon</h2>
      <div class="flex flex-wrap space-x-3 md:space-x-0 lg:space-x-3">
        <img
          class="max-w-16 max-h-16"
          alt="Portland City Seal"
          src="./city_seal@64.webp"
        />
        <img
          class="max-h-16"
          alt="PBOT Vertical Applications logo"
          src="./pbot-verticalapps-logo_dark@64.webp"
        />
      </div>
      <p class="text-gray-700 text-base">© Copyright {{ copyrightDate }}</p>
    </slot>
  </small>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    startDate: {
      type: Object as PropType<Date>,
      required: false,
    },
  },
  setup(props) {
    const nowYear = new Date().getFullYear();
    const startYear =
      props.startDate &&
      props.startDate.getFullYear() !== nowYear &&
      props.startDate.getFullYear();

    return {
      copyrightDate: `${
        startYear ? startYear + '-' : ''
      }${new Date().getFullYear()}`,
    };
  },
});
</script>
