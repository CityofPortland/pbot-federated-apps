<script setup lang="ts">
const props = defineProps({
  computerType: {
    type: String,
    required: true,
  },
});

import {
  IconDeviceLaptop,
  IconDeviceDesktop,
  IconDeviceTablet,
} from '@tabler/icons-vue';
</script>

<template>
  <IconDeviceLaptop
    color="black"
    :size="18"
    class="inline"
    v-if="props.computerType === 'LT'"
  />

  <IconDeviceDesktop
    color="black"
    :size="18"
    class="inline"
    v-else-if="props.computerType === 'WS'"
  />

  <IconDeviceTablet
    color="black"
    :size="18"
    class="inline"
    v-else-if="props.computerType === 'TB'"
  />

  <b v-else>({{ props.computerType }})</b>
</template>
