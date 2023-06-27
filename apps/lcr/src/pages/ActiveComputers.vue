<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useLcrStore } from '../store/lcr';
import Pager from '../components/pager/Pager.vue';
import ReplacementStatus from '../components/replacementStatus/ReplacementStatus.vue';
import computerTypeIcon from '../components/icons/computerTypeIcon.vue';
import moment from 'moment';
import { Button } from '@pbotapps/components';

const lcr = useLcrStore();

const activeComputerPager = ref();

onMounted(async () => {
  lcr.fetchPbotGroups();
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

const calYear = ['2022', '2023', '2024', '2025'];
const calMonth = ['01', '04', '07', '10'];

function openReport() {
  if (
    lcr.activeComputersSearch.replacementQuarter &&
    lcr.activeComputersSearch.pbotGroup
  ) {
    const reportParams = new URLSearchParams();
    reportParams.set(
      'quarterOrderDate',
      lcr.activeComputersSearch.replacementQuarter
    );
    reportParams.set('pbotGroup', lcr.activeComputersSearch.pbotGroup);

    window.open(
      import.meta.env.VITE_REPORT_SERVER_URL +
        '/ReportServer/Pages/ReportViewer.aspx?%2FWorkstation+LCR%2FComps+Up+For+Refresh&rs%3ACommand=Render&' +
        reportParams.toString(),
      '_blank'
    );

    return false;
  } else {
    alert('Please select Group & LCR Quarter to load report');
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4 font-bold text-blue-600 text-3xl">Active Computers</h2>
    <section>
      <form
        @submit.prevent="searchComputers"
        class="grid grid-cols-6 gap-4 max-w-screen-2xl mb-2"
      >
        <div>
          <div class="relative">
            <input
              type="text"
              id="computerName"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-model="lcr.activeComputersSearch.computerName"
              v-on:keyup="searchComputers"
            />
            <label
              for="computername"
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
              v-model="lcr.activeComputersSearch.primaryUser"
              v-on:keyup="searchComputers"
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
            <input
              type="text"
              id="lastLogonUser"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-model="lcr.activeComputersSearch.lastLogonUser"
              v-on:keyup="searchComputers"
            />
            <label
              for="lastLogonUser"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Last Login User</label
            >
          </div>
        </div>
        <div>
          <div class="relative">
            <select
              v-model="lcr.activeComputersSearch.pbotGroup"
              @change="searchComputers"
              class="px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 focus:ring-0 focus:border-blue-600 peer"
            >
              <option value=""></option>
              <template v-for="group in lcr.pbotGroups" :key="group">
                <option :value="group">
                  {{ group }}
                </option>
              </template>
            </select>

            <label
              for="device"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >PBOT Groups</label
            >
          </div>
        </div>
        <div>
          <div class="relative">
            <select
              v-model="lcr.activeComputersSearch.replacementQuarter"
              @change="searchComputers"
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
        <div>
          <Button role="link" @click="openReport" class="mt-1"
            >View Report</Button
          >
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
    class="mb-2"
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
            Status
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
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Group
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Replacement Quarter
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
                <computerTypeIcon
                  :computer-type="computer.computerType"
                  v-if="computer.computerType"
                />
              </router-link>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
            <ReplacementStatus
              v-if="computer.computerName && computer.replacementStatus"
              :computerName="computer.computerName"
              :computerStatus="computer.replacementStatus"
              @update:computerStatus="computer.replacementStatus = $event"
            ></ReplacementStatus>
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
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
            {{ computer.pbotGroup }}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
            {{ moment(computer.replacementQuarter).format('YYYY-MM-DD') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
