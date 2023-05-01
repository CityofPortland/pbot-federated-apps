<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
import { Ref, ref, onMounted } from 'vue';
import { MaximoUser } from '../types/pagedMaximoUsers';
import { CopActiveComputer } from '../types/pagedCopActiveComputers';

import { useLcrStore } from '../store/lcr';

import moment from 'moment';

const store = useLcrStore();
const ourSearch: MaximoUser = {
  pernr: '',
  userName: '',
  personId: '',
  displayName: '',
  firstName: '',
  lastName: '',
  pbotCostCenter: '',
  pbotOrgUnit: '',
  emailAddress: '',
  computerNames: '',
};

const computerSearch: CopActiveComputer = {
  computerName: '',
  primaryUserName: '',
  lastLogonUser: '',
  costCenter: '',
  deploymentDate: '',
  primaryUser: '',
  deviceLocation: '',
  lastCommunication: '',
  osName: '',
  serialNumber: '',
  manufacturer: '',
  pcModel: '',
  cpuType: '',
  cpuNumber: '',
  cpuSpeed: '',
  totalPhysicalMemory: '',
};

const usersComputers: Ref<CopActiveComputer[]> = ref([]);

const props = defineProps({
  username: { type: String, required: true },
});

onMounted(async () => {
  if (props.username) {
    ourSearch.userName = props.username;
    store.fetchMaximoUser(ourSearch.userName);
    computerSearch.primaryUserName = props.username;
    usersComputers.value = await store.fetchCopActiveComputersByUsername(
      computerSearch.primaryUserName
    );

    //console.log('users computer', usersComputers.value);
  }
});
</script>

<template>
  <div v-if="!store.activeMaximoUser">Loading...</div>
  <div v-if="store.activeMaximoUser">
    <div class="container p-12 mx-auto">
      <div class="flex flex-col w-full px-0 mx-auto md:flex-row">
        <div class="flex flex-col md:w-full">
          <h1 class="mb-4 font-bold text-blue-600 text-3xl">
            {{ store.activeMaximoUser?.firstName }}
            {{ store.activeMaximoUser?.lastName }}
          </h1>
          <form>
            <div class="">
              <div class="mt-6 space-x-0 lg:flex lg:space-x-4">
                <div class="w-full lg:w-1/2">
                  <label
                    for="Supervisor"
                    class="block mb-3 text-sm font-semibold text-gray-500"
                    >Supervisor</label
                  >
                  <input
                    disabled
                    name="Supervisor"
                    type="text"
                    v-model="store.activeMaximoUser.supervisorName"
                    class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div class="w-full lg:w-1/2">
                  <label
                    for="Email"
                    class="block mb-3 text-sm font-semibold text-gray-500"
                    >Email</label
                  >
                  <input
                    disabled
                    name="Last Name"
                    type="text"
                    placeholder="Email"
                    v-model="store.activeMaximoUser.emailAddress"
                    class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div class="mt-6 space-x-0 lg:flex lg:space-x-4">
                <div class="w-full lg:w-1/2">
                  <label
                    for="personId"
                    class="block mb-3 text-sm font-semibold text-gray-500"
                    >Person ID</label
                  >
                  <input
                    disabled
                    name="personId"
                    type="text"
                    placeholder="Person ID"
                    v-model="store.activeMaximoUser.personId"
                    class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div class="w-full lg:w-1/2">
                  <label
                    for="Username"
                    class="block mb-3 text-sm font-semibold text-gray-500"
                    >Username</label
                  >
                  <input
                    disabled
                    name="Username"
                    type="text"
                    placeholder="Username"
                    v-model="store.activeMaximoUser.userName"
                    class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div class="mt-6 space-x-0 lg:flex lg:space-x-4">
                <div class="w-full lg:w-1/2">
                  <label
                    for="costCenter"
                    class="block mb-3 text-sm font-semibold text-gray-500"
                    >Cost Center
                  </label>
                  <input
                    disabled
                    name="costCenter"
                    type="text"
                    placeholder="Cost Center"
                    v-model="store.activeMaximoUser.pbotCostCenter"
                    class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div class="w-full lg:w-1/2">
                  <label
                    for="orgUnit"
                    class="block mb-3 text-sm font-semibold text-gray-500"
                    >Org Unit</label
                  >
                  <input
                    disabled
                    name="orgUnit"
                    type="text"
                    placeholder="Org Unit"
                    v-model="store.activeMaximoUser.pbotOrgUnit"
                    class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="flex flex-col w-full ml-0 lg:ml-12 lg:w-2/5 mt-2">
          <div class="pt-12 md:pt-0 2xl:ps-4" v-if="usersComputers">
            <h2 class="text-xl font-bold">Computers</h2>
            <div
              class="mt-8"
              v-for="device in usersComputers"
              :key="device.computerName"
            >
              <div class="max-w-xs rounded shadow-md shadow-gray-300">
                <div class="p-4">
                  <div>
                    <h2 class="text-base font-bold text-gray-600">
                      <RouterLink
                        :to="`/computer/${device.computerName}`"
                        custom
                        v-slot="{ href, navigate }"
                      >
                        <Anchor
                          :url="href"
                          @click="navigate"
                          class="no-underline"
                        >
                          {{ device.computerName }}
                        </Anchor>
                      </RouterLink>
                    </h2>
                    <p class="text-sm text-gray-400">
                      Deployment Date:
                      {{ moment(device.deploymentDate).format('YYYY/MM/DD') }}
                    </p>
                    <p class="text-sm text-gray-400">
                      Last Logon User: {{ device.lastLogonUser }}
                    </p>
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
