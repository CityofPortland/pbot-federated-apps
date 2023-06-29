<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLcrStore } from '../store/lcr';
import { useRouter } from 'vue-router';
import { IconUserCircle } from '@tabler/icons-vue';
import CollapsablePanel from '../components/CollapsablePanel/CollapsablePanel.vue';
import ReplacementStatus from '../components/replacementStatus/ReplacementStatus.vue';
import computerTypeIcon from '../components/icons/computerTypeIcon.vue';
import { CopActiveComputer } from './../types/pagedCopActiveComputers';

const store = useLcrStore();
const router = useRouter();

const props = defineProps({
  computerName: { type: String, required: true },
});

onMounted(async () => {
  activeComputer.value = await store.fetchCopActiveComputer(props.computerName);
});

const activeComputer = ref(null as CopActiveComputer | null);
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
    activeComputer.value?.computerName || '',
    activeComputer.value?.workstationNotes || ''
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
    v-if="activeComputer && activeComputer.computerName == props.computerName"
  >
    <div class="flex flex-col max-w-7xl px-0 mx-auto flex-row">
      <div class="flex flex-col w-full">
        <div class="flex items-center space-x-2">
          <h1 class="font-bold text-blue-600 text-3xl">
            {{ props.computerName }}
          </h1>
          <computerTypeIcon
            :computer-type="activeComputer.computerType"
            v-if="activeComputer.computerType"
            size="24"
          />
        </div>

        <form class="justify-center w-full mx-auto mt-4">
          <div class="w-full">
            <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label
                  for="deploymentDate"
                  class="block text-sm font-semibold text-gray-800"
                  >Deployment Date

                  <input
                    disabled="true"
                    name="deploymentDate"
                    type="datetime"
                    :value="activeComputer.deploymentDate?.substring(0, 10)"
                    placeholder="Deployment Date"
                    class="w-full mt-2 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                /></label>
              </div>
              <div>
                <label
                  for="deviceLocation"
                  class="block text-sm font-semibold text-gray-800"
                  >Device Location

                  <input
                    disabled="true"
                    name="deviceLocation"
                    type="text"
                    placeholder="Device Location"
                    :value="activeComputer.deviceLocation"
                    class="w-full mt-2 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                /></label>
              </div>
              <div>
                <label
                  for="primaryUser"
                  class="block text-sm font-semibold text-gray-800"
                  >Primary User

                  <input
                    disabled="true"
                    name="primaryUser"
                    type="text"
                    :value="activeComputer.primaryUser"
                    placeholder="Primary User"
                    class="w-full mt-2 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                /></label>
              </div>
              <div>
                <label
                  for="lastCommunication"
                  class="block text-sm font-semibold text-gray-800"
                  >Last Communication

                  <input
                    disabled="true"
                    name="lastCommunication"
                    type="datetime"
                    placeholder="Last Communication"
                    :value="activeComputer.lastCommunication?.substring(0, 10)"
                    class="w-full mt-2 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                /></label>
              </div>
            </div>

            <div class="py-4">
              <CollapsablePanel class="w-full">
                <template v-slot:showHideText>Show/Hide Details</template>
                <template v-slot:content>
                  <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    <div>
                      <label
                        for="manufacturer"
                        class="block text-sm font-semibold text-gray-800"
                        >Manufacturer

                        <input
                          disabled="true"
                          name="manufacturer"
                          type="text"
                          :value="activeComputer.manufacturer"
                          placeholder="Manufacturer"
                          class="w-full mt-2 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      /></label>
                    </div>
                    <div>
                      <label
                        for="cpuType"
                        class="block text-sm font-semibold text-gray-800"
                        >CPU Type

                        <input
                          disabled="true"
                          name="cpuType"
                          type="text"
                          :value="activeComputer.cpuType"
                          placeholder="CPU Type"
                          class="w-full mt-2 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      /></label>
                    </div>
                    <div>
                      <label
                        for="cpuNumber"
                        class="block text-sm font-semibold text-gray-800"
                        >CPU Number

                        <input
                          disabled="true"
                          name="cpuNumber"
                          type="text"
                          :value="activeComputer.cpuNumber"
                          placeholder="CPU Number"
                          class="w-full mt-2 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      /></label>
                    </div>
                    <div>
                      <label
                        for="cpuSpeed"
                        class="block text-sm font-semibold text-gray-800"
                        >CPU Speed

                        <input
                          disabled="true"
                          name="cpuSpeed"
                          type="text"
                          :value="activeComputer.cpuSpeed"
                          placeholder="CPU Speed"
                          class="w-full mt-2 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      /></label>
                    </div>
                  </div>

                  <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    <div>
                      <label
                        for="physicalMemory"
                        class="block text-sm font-semibold text-gray-800"
                        >Physical Memory

                        <input
                          disabled="true"
                          name="physicalMemory"
                          type="text"
                          :value="activeComputer.totalPhysicalMemory"
                          placeholder="Total Physical Memory"
                          class="w-full mt-2 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      /></label>
                    </div>
                    <div>
                      <label
                        for="osName"
                        class="block text-sm font-semibold text-gray-800"
                        >OS Name

                        <input
                          disabled="true"
                          name="osName"
                          type="text"
                          :value="activeComputer.osName"
                          placeholder="OS Name"
                          class="w-full mt-2 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                      /></label>
                    </div>
                    <div>
                      <label
                        class="relative block text-sm font-semibold text-gray-800"
                        >Last Logon User

                        <IconUserCircle
                          :size="30"
                          class="absolute top-1/2 transform left-3"
                          v-on:click="loadUser(activeComputer?.lastLogonUser)"
                          v-if="activeComputer.lastLogonUser"
                        />
                        <input
                          disabled="true"
                          name="lastLogonUser"
                          type="text"
                          placeholder="Last Logon User"
                          :value="activeComputer.lastLogonUser"
                          class="w-full mt-2 pl-12 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </label>
                    </div>
                    <div>
                      <label
                        class="relative block text-sm font-semibold text-gray-800"
                        >Primary Username

                        <IconUserCircle
                          :size="30"
                          class="absolute top-1/2 transform left-3"
                          v-on:click="loadUser(activeComputer?.primaryUserName)"
                          v-if="activeComputer.primaryUserName"
                        />
                        <input
                          disabled="true"
                          name="lastLogonUser"
                          type="text"
                          placeholder="Last Logon User"
                          :value="activeComputer.primaryUserName"
                          class="w-full mt-2 pl-12 px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </label>
                    </div>
                  </div>
                </template>
              </CollapsablePanel>
            </div>
          </div>
        </form>
        <div class="relative pt-3 pt-6">
          <div class="flex items-center mb-2">
            <div>
              <label
                for="replacementStatus"
                class="mr-2 text-sm font-semibold text-gray-800"
              >
                Status</label
              >
            </div>
            <ReplacementStatus
              :computerName="activeComputer.computerName"
              :computerStatus="activeComputer.replacementStatus"
              @update:computerStatus="
                if (activeComputer) {
                  activeComputer.replacementStatus = $event;
                }
              "
            ></ReplacementStatus>
          </div>
          <div class="flex items-center mb-2">
            <div>
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
            v-model="activeComputer.workstationNotes"
            v-on:keyup="setFormChanged"
          ></textarea>
        </div>
        <div
          class="mt-5 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
          v-if="activeComputer.copActiveComputersHistory"
        >
          <h2
            class="text-xl font-bold text-blue-600 mb-5"
            v-if="activeComputer.copActiveComputersHistory"
          >
            Device History
          </h2>
          <table
            className="min-w-full divide-y divide-gray-200"
            v-if="activeComputer.copActiveComputersHistory"
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
              v-for="history in activeComputer.copActiveComputersHistory"
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
