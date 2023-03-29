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

import { MaximoUser } from "../types/pagedMaximoUsers";
import { PagedMaximoUsers } from "../types/pagedMaximoUsers";

// const props = defineProps({ personid: { type: String, required: true } });
const props = defineProps({
  personid: { type: String, required: true },
});
</script>

<template>
  <div class="mt-20">
    <h1 class="flex justify-center font-bold text-blue-600 text-md lg:text-3xl">
      User {{ props.personid }}
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
                  for="firstName"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >FirstName</label
                >
                <input
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div class="w-full lg:w-1/2">
                <label
                  for="firstName"
                  class="block mb-3 text-sm font-semibold text-gray-500"
                  >Name</label
                >
                <input
                  name="Last Name"
                  type="text"
                  placeholder="Last Name"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div class="mt-4">
              <div class="w-full">
                <label for="Email" class="block mb-3 text-sm font-semibold text-gray-500"
                  >Email</label
                >
                <input
                  name="Last Name"
                  type="text"
                  placeholder="Email"
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div class="mt-4 space-x-0 lg:flex lg:space-x-4">
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
                  value="${props.userid}"
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
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div class="mt-4 space-x-0 lg:flex lg:space-x-4">
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
                  class="w-full px-4 py-3 text-sm border border-gray-300 rounded lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
            <div class="relative pt-3 xl:pt-6">
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
      <div class="flex flex-col w-full ml-0 lg:ml-12 lg:w-2/5 mt-2">
        <div class="pt-12 md:pt-0 2xl:ps-4">
          <h2 class="text-xl font-bold">Computers</h2>
          <div class="mt-8"></div>
          <div class="max-w-xs rounded shadow-md shadow-gray-300">
            <div class="p-4">
              <div>
                <h2 class="text-xl font-bold text-gray-600">
                  <router-link
                    :to="`/computer/WS30582`"
                    custom
                    v-slot="{ href, navigate }"
                  >
                    <Anchor :url="href" @click="navigate" class="no-underline">
                      WS30582
                    </Anchor>
                  </router-link>
                </h2>
                <p class="text-gray-600">12/31/2020</p>
              </div>
            </div>
          </div>

          <div class="mt-4 max-w-xs rounded shadow-md shadow-gray-300">
            <div class="p-4">
              <div>
                <h2 class="text-xl font-bold text-gray-600">WS30395</h2>
                <p class="text-gray-600">04/01/2022</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
