<script setup lang="ts">
import { ref } from 'vue';
const showComputerDetails = ref(false);
</script>

<template>
  <div>
    <div
      class="flex w-full pl-9 py-2 text-blue-200 bg-blue-600 hover:bg-blue-900"
      v-on:click="showComputerDetails = !showComputerDetails"
    >
      <slot name="showHideText"></slot>
      <div
        class="w-10 px-2 transform transition duration-300 ease-in-out"
        :class="{
          '-rotate-90': !showComputerDetails,
        }"
      >
        <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#c7e1f2"
            d="M13.7,6.3C13.5,6.1,13.3,6,13,6H5C4.7,6,4.5,6.1,4.3,6.3c-0.4,0.4-0.4,1,0,1.4l4,4C8.5,11.9,8.7,12,9,12 s0.5-0.1,0.7-0.3l4-4C14.1,7.3,14.1,6.7,13.7,6.3L13.7,6.3z"
          />
        </svg>
      </div>
    </div>
    <div
      v-if="showComputerDetails"
      class="transform transition duration-300 ease-in-out"
    >
      <slot name="content"></slot>
    </div>
  </div>
</template>
