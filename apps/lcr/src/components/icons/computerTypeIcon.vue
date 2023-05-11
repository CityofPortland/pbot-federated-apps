<script setup lang="ts">
import {
  IconDeviceLaptop,
  IconDeviceDesktop,
  IconDeviceTablet,
} from '@tabler/icons-vue';

const props = defineProps({
  computerType: {
    type: String,
    required: true,
  },
});
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
