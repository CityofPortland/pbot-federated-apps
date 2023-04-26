<script setup lang="ts">
import {
  Anchor,
  Button,
  Checkboxes,
  Entry,
  File,
  Input,
  Select,
  Textarea,
} from "@pbotapps/components";
import { ref } from "vue";
import { MaximoUser } from "../types/pagedMaximoUsers";
import { PagedMaximoUsers } from "../types/pagedMaximoUsers";
import { PagedCopActiveComputers } from "../types/pagedCopActiveComputers";

import { useLcrStore } from "../store/lcr";

const store = useLcrStore();
const ourSearch: MaximoUser = {
  pernr: "",
  username: "",
  personId: "",
  displayName: "",
  firstName: "",
  lastName: "",
  pbotCostCenter: "",
  pbotOrgUnit: "",
  emailAddress: "",
  computerNames: "",
};

const computerSearch: CopActiveComputers = {
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

const props = defineProps({
  username: { type: String, required: true },
});

if (props.username) {
  ourSearch.username = props.username;
  console.log("Search MaximoUsers by Username = " + ourSearch.username);
  store.fetchMaximoUsers(ourSearch, 1);

  computerSearch.primaryUserName = props.username;
  console.log(
    "Search COPActiveComputers by Username = " + computerSearch.primaryUserName
  );
  store.fetchCopActiveComputers(computerSearch, 1);

  // const computers = store.fetchCopActiveComputers(primaryUser);
  // console.log("Devices = ", computers);
}

function getFormattedDate(input) {
  const dateObj = new Date(input);

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const date = dateObj.getDate().toString().padStart(2, "0");

  // const result = `${year}-${month}-${date}`;
  const result = `${year}/${month}/${date}`;

  console.log(result);
  return result;
}
</script>

<template>
  <div class="mt-20" v-if="store.pagedMaximoUsers != null">
    <h1 class="flex font-bold text-blue-600 text-md lg:text-3xl ml-10">
      {{ store.pagedMaximoUsers.data[0].firstName }}
      {{ store.pagedMaximoUsers.data[0].lastName }}
    </h1>
  </div>
  <div
    class="container p-12 mx-auto"
    v-for="person in store.pagedMaximoUsers.data"
    :key="person.personId"
  >
    <div class="flex flex-col w-full px-0 mx-auto md:flex-row">
      <div class="flex flex-col md:w-full">
        <h2 class="mb-4 font-bold md:text-xl text-heading">Detail Information</h2>
        <form class="justify-center w-full mx-auto" method="post" action>
          <div class="">
            <div class="space-x-0 lg:flex lg:space-x-4">
              <!-- <div class="w-full lg:w-1/2">
                <label
                  for="firstName"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >First Name
                </label>
                <input
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  v-model="person.firstName"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/2">
                <label
                  for="firstName"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Last Name</label
                >
                <input
                  name="Last Name"
                  type="text"
                  placeholder="Last Name"
                  v-model="person.lastName"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div> -->
            </div>
            <div class="mt-6 space-x-0 lg:flex lg:space-x-4">
              <div class="w-full lg:w-1/2">
                <label
                  for="Supervisor"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Supervisor</label
                >
                <input
                  name="Supervisor"
                  type="text"
                  placeholder="Supervisor"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div class="w-full lg:w-1/2">
                <label for="Email" class="block mb-3 text-sm font-semibold text-gray-500"
                  >Email</label
                >
                <input
                  name="Last Name"
                  type="text"
                  placeholder="Email"
                  v-model="person.emailAddress"
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
                  name="personId"
                  type="text"
                  placeholder="Person ID"
                  v-model="person.personId"
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
                  name="Username"
                  type="text"
                  placeholder="Username"
                  v-model="person.userName"
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
                  name="costCenter"
                  type="text"
                  placeholder="Cost Center"
                  v-model="person.pbotCostCenter"
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
                  name="orgUnit"
                  type="text"
                  placeholder="Org Unit"
                  v-model="person.pbotOrgUnit"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div class="mt-6 relative pt-3 xl:pt-8">
              <label for="note" class="block mb-3 text-sm font-semibold text-gray-500"
                >Notes (Optional)</label
              >
              <textarea
                name="note"
                class="flex items-center w-full px-4 py-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
                rows="4"
                placeholder="Notes"
              ></textarea>
            </div>
            <div class="mt-8">
              <button
                class="w-full px-6 py-2 text-blue-100 bg-blue-600 hover:bg-blue-900 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
      <div class="flex flex-col w-full ml-0 lg:ml-12 lg:w-2/5 mt-2">
        <div class="pt-12 md:pt-0 2xl:ps-4" v-if="store.pagedCopActiveComputers != null">
          <h2 class="text-xl font-bold">Computers</h2>
          <div
            class="mt-8"
            v-for="device in store.pagedCopActiveComputers.data"
            :key="device"
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
                      <Anchor :url="href" @click="navigate" class="no-underline">
                        {{ device.computerName }}
                      </Anchor>
                    </RouterLink>
                  </h2>
                  <p class="text-sm text-gray-400">
                    Deployment Date: {{ getFormattedDate(device.deploymentDate) }}
                  </p>
                  <p class="text-sm text-gray-400">
                    Last Logon User: {{ device.lastLogonUser }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <!-- <div class="mt-4 max-w-xs rounded shadow-md shadow-gray-300">
            <div class="p-4">
              <div>
                <h2 class="text-xl font-bold text-gray-600">WS30395</h2>
                <p class="text-gray-600">04/01/2022</p>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>
