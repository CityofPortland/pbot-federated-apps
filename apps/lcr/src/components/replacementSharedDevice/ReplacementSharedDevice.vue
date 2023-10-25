<script setup lang="ts">
import { ref } from 'vue';
import { useLcrStore } from '../../store/lcr';

import { IconExclamationCircle } from '@tabler/icons-vue';

const lcr = useLcrStore();
const savingSharedDevice = ref(false);

const errorWhileSaving = ref(false);

async function updateSharedDevice(event: Event) {
  let updatedShared = (event.target as HTMLSelectElement).value;
  console.log(
    `setting ${props.computerShared} shared device to ${updatedShared}`
  );
  savingSharedDevice.value = true;
  errorWhileSaving.value = false;

  let status = await lcr.updateSharedDevice(props.computerName, updatedShared);

  if (status == 200) {
    emit('update:computerShared', updatedShared);
    setTimeout(async () => {
      savingSharedDevice.value = false;
    }, 200);
  } else {
    savingSharedDevice.value = false;
    errorWhileSaving.value = true;
  }
}

const props = defineProps({
  computerName: {
    type: String,
    required: true,
  },
  computerShared: {
    type: String,
    required: true,
  },
});

const emit = defineEmits<{
  (eventName: 'update:computerShared', value: string): void;
}>();
</script>

<template>
  <div class="align-middle">
    <select
      :value="props.computerShared"
      :disabled="savingSharedDevice"
      @change="updateSharedDevice"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg inline-block p-2.5"
    >
      <option
        v-for="shared in lcr.getDomainValues('sharedDeviceOptions')"
        :key="shared"
        :value="shared"
      >
        {{ shared }}
      </option>
    </select>
    <svg
      v-if="savingSharedDevice"
      class="w-4 h-4 ml-2 mr-3 inline-block animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <IconExclamationCircle
      color="red"
      :size="18"
      class="ml-2 inline"
      v-if="errorWhileSaving"
    />
  </div>
</template>
