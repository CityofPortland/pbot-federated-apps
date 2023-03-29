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

import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useLcrStore } from "../store/lcr";
import { MaximoUser } from "../types/pagedMaximoUsers";

const router = useRouter();
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

const props = defineProps({
  computer: { type: String, required: true },
});
</script>

<template>
  <div class="mt-20">
    <h1 class="flex justify-center font-bold text-blue-600 text-md lg:text-3xl">
      Computer {{ props.computer }}
    </h1>
  </div>
  <div class="container p-12 mx-auto">
    <div class="flex flex-col w-full px-0 mx-auto md:flex-row">
      <div class="flex flex-col md:w-full">
        <h2 class="mb-4 font-bold md:text-xl text-heading">Information</h2>
        <form class="justify-center w-full mx-auto" method="post" action>
          <div class="">
            <div class="space-x-0 lg:flex lg:space-x-4">
              <div class="w-full lg:w-1/2">
                <label
                  for="deploymentDate"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Deployment Date</label
                >
                <input
                  name="deploymentDate"
                  type="datetime"
                  placeholder="Deployment Date"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/2">
                <label
                  for="deviceLocation"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Device Location</label
                >
                <input
                  name="deviceLocation"
                  type="text"
                  placeholder="Device Location"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div class="mt-4 space-x-0 lg:flex lg:space-x-4">
              <div class="w-full lg:w-1/2">
                <label
                  for="serialNumber"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Serial Number</label
                >
                <input
                  name="serialNumber"
                  type="text"
                  placeholder="Serial Number"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/2">
                <label
                  for="pcModel"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >PC Model</label
                >
                <input
                  name="pcModel"
                  type="text"
                  placeholder="PC Model"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div class="mt-4 space-x-0 lg:flex lg:space-x-4">
              <div class="w-full lg:w-1/2">
                <label
                  for="manufacturer"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Manufacturer</label
                >
                <input
                  name="manufacturer"
                  type="text"
                  placeholder="Manufacturer"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/2">
                <label
                  for="cpuType"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >CPU Type</label
                >
                <input
                  name="cpuType"
                  type="text"
                  placeholder="CPU Type"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div class="mt-4 space-x-0 lg:flex lg:space-x-4">
              <div class="w-full lg:w-1/2">
                <label
                  for="cpuNumber"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >CPU Number</label
                >
                <input
                  name="cpuNumber"
                  type="text"
                  placeholder="CPU Number"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/2">
                <label
                  for="cpuSpeed"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >CPU Speed</label
                >
                <input
                  name="cpuSpeed"
                  type="text"
                  placeholder="CPU Speed"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/2">
                <label
                  for="physicalMemory"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Physical Memory</label
                >
                <input
                  name="physicalMemory"
                  type="text"
                  placeholder="Total Physical Memory"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/2">
                <label for="osName" class="block mb-3 text-sm font-semibold text-gray-500"
                  >OS Name</label
                >
                <input
                  name="osName"
                  type="text"
                  placeholder="OS Name"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div class="mt-4 space-x-0 lg:flex lg:space-x-4">
              <div class="w-full lg:w-1/2">
                <label
                  for="primaryUser"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Primary User</label
                >
                <input
                  name="primaryUser"
                  type="text"
                  placeholder="Primary User"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/2">
                <label
                  for="lastLogonUser"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Last Logon User</label
                >
                <input
                  name="lastLogonUser"
                  type="datetime"
                  placeholder="Last Logon User"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/2">
                <label
                  for="lastCommunication"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Last Communication</label
                >
                <input
                  name="lastCommunication"
                  type="datetime"
                  placeholder="Last Communication"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/2">
                <label
                  for="costCenter"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Cost Center</label
                >
                <input
                  name="costCenter"
                  type="datetime"
                  placeholder="Cost Center"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div class="relative pt-3 xl:pt-6">
              <label for="note" class="block mb-3 text-sm font-semibold text-gray-500">
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
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
