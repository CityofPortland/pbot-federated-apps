<script setup lang="ts">
import { Anchor } from "@pbotapps/components";
import { Ref, ref, onMounted } from "vue";
import { MaximoUser } from "../types/pagedMaximoUsers";
import { CopActiveComputer } from "../types/pagedCopActiveComputers";

import { useLcrStore } from "../store/lcr";
import { useRouter } from "vue-router";
import moment from "moment";

const store = useLcrStore();
const ourSearch: MaximoUser = {
  pernr: "",
  userName: "",
  personId: "",
  displayName: "",
  firstName: "",
  lastName: "",
  pbotCostCenter: "",
  pbotOrgUnit: "",
  emailAddress: "",
  computerNames: "",
};

const computerSearch: CopActiveComputer = {
  computerName: "",
  primaryUserName: "",
  lastLogonUser: "",
  costCenter: "",
  deploymentDate: "",
  primaryUser: "",
  deviceLocation: "",
  lastCommunication: "",
  osName: "",
  serialNumber: "",
  manufacturer: "",
  pcModel: "",
  cpuType: "",
  cpuNumber: "",
  cpuSpeed: "",
  totalPhysicalMemory: "",
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
const router = useRouter();
function loadComputer(computer: string) {
  router.push({ name: "ComputerPage", params: { computer: computer } });
}
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
              <div class="mt-6 space-x-0 lg:flex lg:space-x-6">
                <div class="w-full lg:w-1/3">
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

                <div class="w-full lg:w-1/3">
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
                <div class="w-full lg:w-1/3">
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
              </div>
              <div class="mt-6 space-x-0 lg:flex lg:space-x-4">
                <div class="w-full lg:w-1/3">
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
                <div class="w-full lg:w-1/3">
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
                <div class="w-full lg:w-1/3">
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
              <div class="mt-6 space-x-0 lg:flex lg:space-x-4"></div>
            </div>
            <h2 class="text-xl font-bold text-blue-600 mb-5">Computers</h2>

            <div
              class="mt-5 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
            >
              <table
                className="min-w-full divide-y divide-gray-200"
                v-if="usersComputers != null"
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Computer Name
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
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Deployment Date
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="bg-white divide-y divide-gray-200"
                  v-for="device in usersComputers"
                  :key="device.computerName"
                >
                  <tr class="hover:bg-slate-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="ml-4"
                          v-on:click="loadComputer(device.computerName)"
                        >
                          <div className="text-sm font-medium text-blue-400">
                            {{ device.computerName }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {{ device.lastLogonUser }}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {{ moment(device.lastCommunication).format("YYYY-MM-DD") }}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {{ moment(device.deploymentDate).format("YYYY-MM-DD") }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>