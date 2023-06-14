<script setup lang="ts">
import { ref } from 'vue';
import { useLcrStore } from '../../store/lcr';

import { IconExclamationCircle } from '@tabler/icons-vue';

const lcr = useLcrStore();
const savingStatus = ref(false);

const errorWhileSaving = ref(false);

async function updateComputerStatus(event: Event) {
  //console.log(`setting ${props.computerName} status to ${updatedStatus}`);
  let updatedStatus = (event.target as HTMLSelectElement).value;

  savingStatus.value = true;
  errorWhileSaving.value = false;

  let status = await lcr.updateComputerStatus(
    props.computerName,
    updatedStatus
  );

  if (status == 200) {
    emit('update:computerStatus', updatedStatus);
    setTimeout(async () => {
      savingStatus.value = false;
    }, 200);
  } else {
    savingStatus.value = false;
    errorWhileSaving.value = true;
  }
}

const props = defineProps({
  computerName: {
    type: String,
    required: true,
  },
  computerStatus: {
    type: String,
    required: true,
  },
});

const emit = defineEmits<{
  (eventName: 'update:computerStatus', value: string): void;
}>();
</script>

<template>
  <div class="align-middle">
    <select
      :value="props.computerStatus"
      :disabled="savingStatus"
      @change="updateComputerStatus"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg inline-block p-2.5"
    >
      <option
        v-for="status in lcr.getDomainValues('wsReplacementStatus')"
        :key="status"
        :value="status"
      >
        {{ status }}
      </option>
    </select>
    <svg
      v-if="savingStatus"
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
