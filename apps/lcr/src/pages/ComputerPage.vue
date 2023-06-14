<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLcrStore } from '../store/lcr';
import { useRouter } from 'vue-router';
import { IconUserCircle } from '@tabler/icons-vue';
import CollapsablePanel from '../components/CollapsablePanel/CollapsablePanel.vue';

import ReplacementStatus from '../components/replacementStatus/ReplacementStatus.vue';

const store = useLcrStore();
const router = useRouter();

const props = defineProps({
  computerName: { type: String, required: true },
});

onMounted(async () => {
  store.fetchCopActiveComputer(props.computerName);
});

const formChanged = ref(false);
const currentlySaving = ref(false);
const changesRecentlySaved = ref(false);

function setFormChanged() {
  formChanged.value = true;
  changesRecentlySaved.value = false;
}

function loadUser(username: string | undefined) {
  if (username) {
    router.push({ name: 'UserPage', params: { username: username } });
  }
}

async function saveNotes() {
  currentlySaving.value = true;

  let status = await store.updateNoteField(
    store.activeComputer?.computerName || '',
    store.activeComputer?.workstationNotes || ''
  );

  if (status == 200) {
    setTimeout(async () => {
      currentlySaving.value = false;
      formChanged.value = false;
      changesRecentlySaved.value = true;
    }, 200);
  } else {
    console.log('Error while saving.', status);
  }
}
</script>

<template>
  <div
    class="container p-12 mx-auto"
    v-if="
      store.activeComputer &&
      store.activeComputer.computerName == props.computerName
    "
  >
    <div class="flex flex-col w-full px-0 mx-auto md:flex-row">
      <div class="flex flex-col md:w-full">
        <h1 class="mb-4 font-bold text-blue-600 text-3xl">
          {{ props.computerName }}
        </h1>

        <form class="justify-center w-full mx-auto">
          <div class="">
            <div class="space-x-0 lg:flex lg:space-x-4">
              <div class="w-full lg:w-1/4">
                <label
                  for="deploymentDate"
                  class="block mb-3 text-sm font-semibold text-gray-800"
                  >Deployment Date</label
                >
                <input
                  disabled="true"
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
                  class="block mb-3 text-sm font-semibold text-gray-800"
                  >Device Location</label
                >
                <input
                  disabled="true"
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
                  class="block mb-3 text-sm font-semibold text-gray-800"
                  >Primary User</label
                >
                <input
                  disabled="true"
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
                  class="block mb-3 text-sm font-semibold text-gray-800"
                  >Last Communication</label
                >
                <input
                  disabled="true"
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
                        class="block mb-3 text-sm font-semibold text-gray-800"
                        >Manufacturer</label
                      >
                      <input
                        disabled="true"
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
                        class="block mb-3 text-sm font-semibold text-gray-800"
                        >CPU Type</label
                      >
                      <input
                        disabled="true"
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
                        class="block mb-3 text-sm font-semibold text-gray-800"
                        >CPU Number</label
                      >
                      <input
                        disabled="true"
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
                        class="block mb-3 text-sm font-semibold text-gray-800"
                        >CPU Speed</label
                      >
                      <input
                        disabled="true"
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
                        class="block mb-3 text-sm font-semibold text-gray-800"
                        >Physical Memory</label
                      >
                      <input
                        disabled="true"
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
                        class="block mb-3 text-sm font-semibold text-gray-800"
                        >OS Name</label
                      >
                      <input
                        disabled="true"
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
                        class="block mb-3 text-sm font-semibold text-gray-800"
                        >Last Logon User</label
                      >
                      <form class="flex flex-row">
                        <span
                          class="flex items-center rounded rounded-r-none border-0 font-bold text-grey-100 pr-1"
                          ><IconUserCircle
                            :size="30"
                            v-on:click="
                              loadUser(store.activeComputer?.lastLogonUser)
                            "
                            v-if="store.activeComputer.lastLogonUser"
                        /></span>
                        <input
                          disabled="true"
                          name="lastLogonUser"
                          type="text"
                          placeholder="Last Logon User"
                          :value="store.activeComputer.lastLogonUser"
                          class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </form>
                    </div>
                    <div class="w-full lg:w-1/4">
                      <label
                        for="lastLogonUser"
                        class="block mb-3 text-sm font-semibold text-gray-800"
                        >Primary Username</label
                      >
                      <form class="flex flex-row">
                        <span
                          class="flex items-center rounded rounded-r-none border-0 font-bold text-grey-100 pr-1"
                          ><IconUserCircle
                            :size="30"
                            v-on:click="
                              loadUser(store.activeComputer?.primaryUserName)
                            "
                            v-if="store.activeComputer.primaryUserName"
                        /></span>
                        <input
                          disabled="true"
                          name="primaryUsername"
                          type="text"
                          placeholder="Primary Username"
                          :value="store.activeComputer.primaryUserName"
                          class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </form>
                    </div>
                  </div>
                </template>
              </CollapsablePanel>
            </div>
          </div>
        </form>
        <div class="relative pt-3 xl:pt-6">
          <div class="flex mb-2">
            <div class="mt-2">
              <label
                for="replacementStatus"
                class="mr-2 text-sm font-semibold text-gray-800"
              >
                Status</label
              >
            </div>
            <ReplacementStatus
              :computerName="store.activeComputer.computerName"
              :computerStatus="store.activeComputer.replacementStatus"
              @update:computerStatus="
                if (store.activeComputer) {
                  store.activeComputer.replacementStatus = $event;
                }
              "
            ></ReplacementStatus>
          </div>
          <div class="flex mb-2">
            <div class="mt-1">
              <label
                for="note"
                class="mr-2 text-sm font-semibold text-gray-800"
              >
                Notes</label
              >
            </div>

            <button
              class="flex px-2 py-2 text-sm text-blue-200 bg-blue-600 hover:bg-blue-900 disabled:bg-blue-400"
              :disabled="currentlySaving || !formChanged"
              v-on:click="saveNotes"
            >
              Save notes
              <svg
                v-if="currentlySaving"
                class="w-4 h-4 mt-1 ml-2 mr-3 text-white animate-spin"
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
            </button>

            <div
              class="mt-2 ml-2 text-sm font-semibold text-green-600 transition duration-200 ease-in-out"
              v-if="changesRecentlySaved"
            >
              Changes Saved
            </div>
          </div>
          <textarea
            name="note"
            class="flex items-center w-full px-4 py-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            rows="4"
            placeholder="Notes"
            v-model="store.activeComputer.workstationNotes"
            v-on:keyup="setFormChanged"
          ></textarea>
        </div>
        <div
          class="mt-5 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
          v-if="store.activeComputer.copActiveComputersHistory"
        >
          <h2
            class="text-xl font-bold text-blue-600 mb-5"
            v-if="store.activeComputer.copActiveComputersHistory"
          >
            Device History
          </h2>
          <table
            className="min-w-full divide-y divide-gray-200"
            v-if="store.activeComputer.copActiveComputersHistory"
          >
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Import Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Device Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Logon User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Communication
                </th>
              </tr>
            </thead>
            <tbody
              class="bg-white divide-y divide-gray-200"
              v-for="history in store.activeComputer.copActiveComputersHistory"
              :key="history.importDate"
            >
              <tr class="hover:bg-slate-100">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-blue-400">
                        {{ history.importDate?.substring(0, 10) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {{ history.replacementStatus }}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {{ history.deviceLocation }}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {{ history.lastLogonUser }}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {{ history.lastCommunication?.substring(0, 10) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
