<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLcrStore } from '../store/lcr';
import Pager from '../components/pager/Pager.vue';
import moment from 'moment';

import { PbotLcrScheduleSearchFilter } from '../types/pagedPbotLcrSchedule';
import { IconExternalLink } from '@tabler/icons-vue';

import computerTypeIcon from '../components/icons/computerTypeIcon.vue';

const lcr = useLcrStore();

const ourSearch: PbotLcrScheduleSearchFilter = lcr.pbotLcrScheduleSearch;
const lcrPager = ref();

function pagerChanged(pageNumber: number) {
  lcr.pbotLcrSchedulePageNumber = pageNumber;
  lcr.fetchLcrSchedule(ourSearch, lcr.pbotLcrSchedulePageNumber);
}

async function searchSchedule() {
  lcr.pbotLcrSchedulePageNumber = 1;
  lcr.fetchLcrSchedule(ourSearch, lcr.pbotLcrSchedulePageNumber);
}

const calYear = ['2023', '2024', '2025'];
const calMonth = ['01', '04', '07', '11'];

onMounted(async () => {
  // when loaded and recent, refresh from cache instead of refreshing
  if (
    !lcr.pbotLcrSchedulePaged ||
    lcr.getPbotLcrScheduleMinutesSinceLastSearch() > 2
  ) {
    lcr.fetchLcrSchedule(ourSearch, lcr.pbotLcrSchedulePageNumber);
  }
});
</script>

<template>
  <div>
    <h2 class="mb-4 font-bold text-blue-600 text-3xl">PBOT LCR Schedule</h2>
    <section>
      <form
        @submit.prevent="searchSchedule"
        class="grid grid-cols-4 gap-4 max-w-3xl m-2"
      >
        <div>
          <div class="relative">
            <input
              type="text"
              id="computerName"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-model="ourSearch.computerName"
              v-on:keyup="searchSchedule"
            />
            <label
              for="computerName"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Computer Name</label
            >
          </div>
        </div>
        <div>
          <div class="relative">
            <input
              type="text"
              id="primaryUser"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-model="ourSearch.primaryUser"
              v-on:keyup="searchSchedule"
            />
            <label
              for="primaryUser"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Primary User</label
            >
          </div>
        </div>
        <div>
          <div class="relative">
            <select
              @change="searchSchedule"
              v-model="ourSearch.quarterOrderDate"
              class="px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 focus:ring-0 focus:border-blue-600 peer"
            >
              <option value=""></option>
              <template v-for="currYear in calYear" :key="currYear">
                <option
                  v-for="currMonth in calMonth"
                  :key="currMonth"
                  :value="currYear + '-' + currMonth + '-01'"
                >
                  {{ currYear }}-{{ currMonth }}-01
                </option>
              </template>
            </select>

            <label
              for="device"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Quarter Order Date</label
            >
          </div>
        </div>
      </form>
    </section>

    <Pager
      v-if="lcr.pbotLcrSchedulePaged"
      @pager-changed="pagerChanged"
      :pagedData="lcr.pbotLcrSchedulePaged"
      :pageNumber="lcr.pbotLcrSchedulePageNumber"
      ref="lcrPager"
    ></Pager>

    <div
      class="mt-5 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
    >
      <table
        className="min-w-full divide-y divide-gray-200"
        v-if="lcr.pbotLcrSchedulePaged"
      >
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Computer Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Primary User
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Device Location
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Deployment Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Last Communication
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Qt. Order Date
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white divide-y divide-gray-200"
          v-for="schedule in lcr.pbotLcrSchedulePaged.data"
          :key="schedule.computerName"
        >
          <tr class="hover:bg-slate-100">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
              <router-link :to="'/computer/' + schedule.computerName">
                {{ schedule.computerName }}
                <computerTypeIcon :computer-type="schedule.computerType" />
              </router-link>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className="px-2 inline-flex text-xs leading-5
                font-semibold rounded-full bg-green-100 text-green-800"
              >
                {{ schedule.primaryUser }}
                <IconExternalLink
                  color="black"
                  :size="18"
                  class="inline"
                  v-if="schedule.computerType === 'LT'"
                />
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
              {{ schedule.deviceLocation }}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
              {{ moment(schedule.deploymentDate).format('YYYY/MM/DD') }}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
              {{ moment(schedule.lastCommunication).format('YYYY/MM/DD') }}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
              {{ moment(schedule.quarterOrderDate).format('YYYY/MM/DD') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
