<script setup lang="ts">
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

defineProps({
  color: {
    type: String,
    required: true,
  },
});

const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const config = resolveConfig(tailwindConfig);
</script>

<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col">
      <div class="h-32" :class="[`bg-${color}-500`]"></div>
      <div class="flex flex-row">
        <span
          v-for="(weight, index) in weights"
          :key="index"
          class="w-full h-8"
          :class="[`bg-${color}-${weight}`]"
        ></span>
      </div>
    </div>
    <ul class="list-none flex flex-col space-y-3">
      <li
        v-for="(bgWeight, index) in weights"
        :key="index"
        class="flex flex-col"
      >
        <dl class="flex flex-row space-x-4 text-xl">
          <dt class="font-semibold">Weight:</dt>
          <dd>{{ bgWeight }}</dd>
        </dl>
        <div
          class="rounded-lg flex flex-row flex-wrap space-x-4 p-4"
          :class="[`bg-${color}-${bgWeight}`]"
        >
          <div
            v-for="(textWeight, index) in weights"
            :key="index"
            class="p-4 flex flex-row space-x-1"
            :class="`text-${color}-${textWeight}`"
          >
            <div class="flex flex-row items-center space-x-2">
              <div
                class="flex flex-col items-center justify-between"
                style="font-size: 18px"
              >
                <span>{{ textWeight }}</span>
              </div>
              <div
                class="flex flex-col items-center justify-between"
                style="font-size: 16px"
              >
                <span>{{ textWeight }}</span>
              </div>
              <div
                class="flex flex-col items-center justify-between"
                style="font-size: 14px; font-weight: bold"
              >
                <span>{{ textWeight }}</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
