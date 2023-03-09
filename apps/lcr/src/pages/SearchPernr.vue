<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, reactive, computed, watchEffect } from 'vue';
import { PagedMaximoUsers, MaximoUser } from '../types/pagedMaximoUsers';
import { useLcrStore } from '../store/lcr';
import { Store, PiniaCustomStateProperties, storeToRefs } from 'pinia';
import { Pager } from '@pbotapps/components';

const lcr = useLcrStore();
//const sign = computed(() => lcr.fetchCopActiveComputers());
//let pernr = ref('');

const pageIndex = ref(0);
const PAGE_SIZE = 10;

const pageLength = computed(() => [
  ...Array(Math.floor(lcr.pagedMaximoUsers.length / PAGE_SIZE + 1)).keys(),
]);

const page = computed(() =>
  lcr.pagedMaximoUsers.slice(
    pageIndex.value * PAGE_SIZE,
    (pageIndex.value + 1) * PAGE_SIZE
  )
);
watchEffect(() => {
  if (pageLength.value.length < pageIndex.value) {
    pageIndex.value = pageLength.value.length - 1;
  }
});
// const filteredComputers = (person:MaximoUser) => {
//   return lcr.pagedCopActiveComputers.data.filter(
//     computers => computers.primaryUser === person.displayName
//   );
// };

onMounted(async () => {
  lcr.fetchMaximoUsers();
  lcr.fetchCopActiveComputers();
});

async function findPernr(submitEvent: {
  target: { elements: { pernr: { value: any } } };
}) {
  console.log(submitEvent.target.elements.pernr.value);
  const mUser: Partial<MaximoUser> = {
    personId: submitEvent.target.elements.pernr.value,
  };
  lcr.fetchMaximoUsers(mUser);
  // console.log(lcr.pagedMaximoUsers.data[0]);
  // lcr.getCopActiveComputers(lcr.pagedMaximoUsers.data[0].displayName);
}
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-2">Pernr</h2>
    <section>
      <form @submit.prevent="findPernr">
        <input
          type="text"
          name="pernr"
          autofocus
          class="border-b border-gray-600 py-2 px-4 w-1/3 rounded-lg mb-6 placeholder-blue-300"
          placeholder="Enter any number. Hit Enter or Click on Find."
        />
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ml-3"
        >
          Find
        </button>
      </form>
    </section>
    <div
      v-if="lcr.pagedMaximoUsers"
      class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
    >
      <p class="mb-4">
        Showing {{ pageIndex * PAGE_SIZE + 1 }} -
        {{ Math.min((pageIndex + 1) * PAGE_SIZE, lcr.pagedMaximoUsers.length) }}
        of {{ lcr.pagedMaximoUsers.length }} users
      </p>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              PBOT Cost Center & Org Unit
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Pernr
            </th>
            <!-- <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              LCR date & Quarter Order Date
            </th> -->
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Devices
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white divide-y divide-gray-200"
          v-for="person in page"
          :key="person.personId"
        >
          <tr class="hover:bg-slate-100">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {{ person.displayName }}
                  </div>
                  <div className="text-sm text-gray-500">
                    {{ person.emailAddress }}
                  </div>
                  <div className="text-sm text-gray-500">
                    {{ person.userName }}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {{ person.pbotOrgUnit }}
              </div>
              <div className="text-sm text-gray-500">
                {{ person.pbotCostCenter }}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className="px-2 inline-flex text-xs leading-5
                font-semibold rounded-full bg-green-100 text-green-800"
              >
                {{ person.personId }}
              </span>
            </td>
            <!-- <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              { contactname }
            </td> -->
            <td
              className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <div v-for="computer in lcr.getCopActiveComputers(person)">
                <a href="#" className="text-indigo-600 hover:text-indigo-900">
                  {{ computer.computerName }}
                </a>
              </div>
            </td>
          </tr>
        </tbody>
        <Pager
          :value="pageIndex"
          :list="pageLength"
          @select="pageIndex = $event.index"
          class="justify-self-center"
        />
      </table>
    </div>
  </div>
</template>
