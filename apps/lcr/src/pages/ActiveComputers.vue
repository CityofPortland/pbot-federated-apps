<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useLcrStore } from '../store/lcr';
import Pager from '../components/pager/Pager.vue';

const lcr = useLcrStore();

const activeComputerPager = ref();

onMounted(async () => {
  lcr.fetchActiveComputers(
    lcr.activeComputersSearch,
    lcr.activeComputersPageNumber
  );
});

function pagerChanged(pageNumber: number) {
  lcr.homePageNumber = pageNumber;
  lcr.fetchActiveComputers(lcr.activeComputersSearch, pageNumber);
}

async function searchComputers() {
  lcr.fetchActiveComputers(
    lcr.activeComputersSearch,
    lcr.activeComputersPageNumber
  );
}
</script>

<template>
  <div>
    <h2 class="mb-4 font-bold text-blue-600 text-3xl">Active Computers</h2>
    <section>
      <form
        @submit.prevent="searchComputers"
        class="grid grid-cols-4 gap-4 max-w-2xl m-2"
      >
        <div>
          <div class="relative">
            <input
              type="text"
              id="lastname"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-model="lcr.activeComputersSearch.computerName"
              v-on:keyup="searchComputers"
            />
            <label
              for="lastname"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Last Name</label
            >
          </div>
        </div>
        <div>
          <div class="relative">
            <input
              type="text"
              id="firstname"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-on:keyup="searchComputers"
            />
            <label
              for="firstname"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >First Name</label
            >
          </div>
        </div>
        <div>
          <div class="relative">
            <input
              type="text"
              id="device"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-on:keyup="searchComputers"
            />
            <label
              for="device"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Device</label
            >
          </div>
        </div>
        <div>
          <div class="relative">
            <input
              type="text"
              id="personId"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-on:keyup="searchComputers"
            />
            <label
              for="personId"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Person ID</label
            >
          </div>
        </div>
      </form>
    </section>
  </div>

  <Pager
    v-if="lcr.activeComputers"
    @pager-changed="pagerChanged"
    :pagedData="lcr.activeComputers"
    :page-number="lcr.activeComputersPageNumber"
    ref="activeComputerPager"
  ></Pager>

  <div>
    <table
      className="min-w-full divide-y divide-gray-200"
      v-if="lcr.activeComputers != null"
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
            Primary User
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Primary User Name
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Last Logon User
          </th>
        </tr>
      </thead>
      <tbody
        class="bg-white divide-y divide-gray-200"
        v-for="computer in lcr.activeComputers?.data"
        :key="computer.computerName"
      >
        <tr class="hover:bg-slate-100">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
            <div>
              <router-link :to="`/computer/${computer.computerName}`">
                {{ computer.computerName }}
              </router-link>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
            {{ computer.primaryUser }}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
            {{ computer.primaryUserName }}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
            {{ computer.lastLogonUser }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
