<script setup lang="ts">
import { onMounted } from 'vue';
import { useLcrStore } from '../store/lcr';
import CollapsablePanel from '../components/CollapsablePanel/CollapsablePanel.vue';

const store = useLcrStore();

const props = defineProps({
  computerName: { type: String, required: true },
});

onMounted(async () => {
  if (props.computerName != store.activeComputer?.computerName) {
    store.fetchCopActiveComputer(props.computerName);
  }
});
</script>

<template>
  <div class="mt-20">
    <h1 class="flex justify-center font-bold text-blue-600 text-md lg:text-3xl">
      Computer {{ props.computerName }}
    </h1>
  </div>

  <div
    class="container p-12 mx-auto"
    v-if="
      store.activeComputer &&
      store.activeComputer.computerName == props.computerName
    "
  >
    <div class="flex flex-col w-full px-0 mx-auto md:flex-row">
      <div class="flex flex-col md:w-full">
        <h2 class="mb-4 font-bold md:text-xl text-heading">Information</h2>

        <form class="justify-center w-full mx-auto">
          <div class="">
            <div class="space-x-0 lg:flex lg:space-x-4">
              <div class="w-full lg:w-1/4">
                <label
                  for="deploymentDate"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Deployment Date</label
                >
                <input
                  name="deploymentDate"
                  type="datetime"
                  :value="store.activeComputer.deploymentDate?.substring(0, 10)"
                  placeholder="Deployment Date"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/4">
                <label
                  for="deviceLocation"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Device Location</label
                >
                <input
                  name="deviceLocation"
                  type="text"
                  placeholder="Device Location"
                  :value="store.activeComputer.deviceLocation"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/4">
                <label
                  for="primaryUser"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Primary User</label
                >
                <input
                  name="primaryUser"
                  type="text"
                  :value="store.activeComputer.primaryUser"
                  placeholder="Primary User"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/4">
                <label
                  for="lastCommunication"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Last Communication</label
                >
                <input
                  name="lastCommunication"
                  type="datetime"
                  placeholder="Last Communication"
                  :value="
                    store.activeComputer.lastCommunication?.substring(0, 10)
                  "
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div class="py-4">
              <CollapsablePanel class="w-128">
                <template v-slot:showHideText>Show/Hide Details</template>
                <template v-slot:content>
                  <div class="py-4 space-x-0 lg:flex lg:space-x-4">
                    <div class="w-full lg:w-1/4">
                      <label
                        for="manufacturer"
                        class="block mb-3 text-sm font-semibold text-gray-500"
                        >Manufacturer</label
                      >
                      <input
                        name="manufacturer"
                        type="text"
                        :value="store.activeComputer.manufacturer"
                        placeholder="Manufacturer"
                        class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div class="w-full lg:w-1/4">
                      <label
                        for="cpuType"
                        class="block mb-3 text-sm font-semibold text-gray-500"
                        >CPU Type</label
                      >
                      <input
                        name="cpuType"
                        type="text"
                        :value="store.activeComputer.cpuType"
                        placeholder="CPU Type"
                        class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div class="w-full lg:w-1/4">
                      <label
                        for="cpuNumber"
                        class="block mb-3 text-sm font-semibold text-gray-500"
                        >CPU Number</label
                      >
                      <input
                        name="cpuNumber"
                        type="text"
                        :value="store.activeComputer.cpuNumber"
                        placeholder="CPU Number"
                        class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div class="w-full lg:w-1/4">
                      <label
                        for="cpuSpeed"
                        class="block mb-3 text-sm font-semibold text-gray-500"
                        >CPU Speed</label
                      >
                      <input
                        name="cpuSpeed"
                        type="text"
                        :value="store.activeComputer.cpuSpeed"
                        placeholder="CPU Speed"
                        class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div class="py-4 space-y-0 lg:flex lg:space-x-4">
                    <div class="w-full lg:w-1/4">
                      <label
                        for="physicalMemory"
                        class="block mb-3 text-sm font-semibold text-gray-500"
                        >Physical Memory</label
                      >
                      <input
                        name="physicalMemory"
                        type="text"
                        :value="store.activeComputer.totalPhysicalMemory"
                        placeholder="Total Physical Memory"
                        class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div class="w-full lg:w-1/4">
                      <label
                        for="osName"
                        class="block mb-3 text-sm font-semibold text-gray-500"
                        >OS Name</label
                      >
                      <input
                        name="osName"
                        type="text"
                        :value="store.activeComputer.osName"
                        placeholder="OS Name"
                        class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div class="w-full lg:w-1/4">
                      <label
                        for="lastLogonUser"
                        class="block mb-3 text-sm font-semibold text-gray-500"
                        >Last Logon User</label
                      >
                      <input
                        name="lastLogonUser"
                        type="datetime"
                        placeholder="Last Logon User"
                        :value="store.activeComputer.lastLogonUser"
                        class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </template>
              </CollapsablePanel>
            </div>
          </div>
        </form>
        <div class="relative pt-3 xl:pt-6">
          <label
            for="note"
            class="block mb-3 text-sm font-semibold text-gray-500"
          >
            Notes (Optional)</label
          >
          <textarea
            name="note"
            class="flex items-center w-full px-4 py-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            rows="4"
            placeholder="Notes"
          ></textarea>
        </div>
        <div class="mt-4">
          <button
            class="w-full px-6 py-2 text-blue-200 bg-blue-600 hover:bg-blue-900"
          >
            Save changes in notes section
          </button>
        </div>
        <div class="py-4">
          <div
            class="px-4 py-5 border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <h2 class="mb-4 font-bold md:text-xl text-heading">
              Device History
            </h2>
            <div class="space-x-0 lg:flex lg:space-x-4">
              <div class="w-full lg:w-1/4">
                <label class="block mb-3 text-sm font-semibold text-gray-500"
                  >Import Date</label
                >
              </div>
              <div class="w-full lg:w-1/4">
                <label class="block mb-3 text-sm font-semibold text-gray-500"
                  >Last Logon User</label
                >
              </div>
              <div class="w-full lg:w-1/4">
                <label class="block mb-3 text-sm font-semibold text-gray-500"
                  >Device Location</label
                >
              </div>
              <div class="w-full lg:w-1/4">
                <label class="block mb-3 text-sm font-semibold text-gray-500"
                  >Last Communication</label
                >
              </div>
            </div>

            <div v-if="store.activeComputer.copActiveComputersHistory">
              <div
                v-for="history in store.activeComputer
                  .copActiveComputersHistory"
                :key="history.importDate"
              >
                <div class="space-x-0 lg:flex lg:space-x-4">
                  <div class="w-full lg:w-1/4 text-sm lg:text-sm">
                    {{ history.importDate?.substring(0, 10) }}
                  </div>
                  <div class="w-full lg:w-1/4 text-sm lg:text-sm">
                    {{ history.lastLogonUser }}
                  </div>
                  <div class="w-full lg:w-1/4 text-sm lg:text-sm">
                    {{ history.deviceLocation }}
                  </div>
                  <div class="w-full lg:w-1/4 text-sm lg:text-sm">
                    {{ history.lastCommunication?.substring(0, 10) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
