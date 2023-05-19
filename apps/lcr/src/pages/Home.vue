<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { MaximoUser } from "../types/pagedMaximoUsers";
import { useLcrStore } from "../store/lcr";
import Pager from "../components/pager/Pager.vue";
import { Anchor } from "@pbotapps/components";

const lcr = useLcrStore();
const router = useRouter();
const maxUserPager = ref();

async function findUsers() {
  if (maxUserPager.value) {
    maxUserPager.value.goToFirstPage();
  }
  lcr.fetchMaximoUsers(lcr.homeMaximoUserSearch, lcr.homePageNumber); //, pageNumber.value);
}
function pagerChanged(pageNumber: number) {
  lcr.homePageNumber = pageNumber;
  lcr.fetchMaximoUsers(lcr.homeMaximoUserSearch, pageNumber);
}
function loadUser(username: string) {
  router.push({ name: "UserPage", params: { username: username } });
}
findUsers();
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-2">Search Users</h2>
    <section>
      <form @submit.prevent="findUsers" class="grid grid-cols-8 gap-4 max-w-8xl m-5">
        <div>
          <div class="relative">
            <input
              type="text"
              id="lastname"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-model="lcr.homeMaximoUserSearch.lastName"
              v-on:keyup="findUsers"
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
              v-model="lcr.homeMaximoUserSearch.firstName"
              v-on:keyup="findUsers"
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
              v-model="lcr.homeMaximoUserSearch.computerNames"
              v-on:keyup="findUsers"
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
              v-model="lcr.homeMaximoUserSearch.personId"
              v-on:keyup="findUsers"
            />
            <label
              for="personId"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Person ID</label
            >
          </div>
        </div>
        <div>
          <div class="relative">
            <input
              type="text"
              id="pbotGroup"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-model="lcr.homeMaximoUserSearch.pbotGroup"
              v-on:keyup="findUsers"
            />
            <label
              for="pbotGroup"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Group</label
            >
          </div>
        </div>
        <div>
          <div class="relative">
            <input
              type="text"
              id="pbotDivision"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-model="lcr.homeMaximoUserSearch.pbotDivision"
              v-on:keyup="findUsers"
            />
            <label
              for="pbotDivision"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Division</label
            >
          </div>
        </div>
        <div>
          <div class="relative">
            <input
              type="text"
              id="section"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-model="lcr.homeMaximoUserSearch.section"
              v-on:keyup="findUsers"
            />
            <label
              for="section"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Section</label
            >
          </div>
        </div>
        <div>
          <div class="relative">
            <input
              type="text"
              id="pbotOrgUnit"
              class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              v-model="lcr.homeMaximoUserSearch.pbotOrgUnit"
              v-on:keyup="findUsers"
            />
            <label
              for="pbotOrgUnit"
              class="absolute text-md font-medium text-gray-600 text-bold duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >Org Unit</label
            >
          </div>
        </div>
      </form>
    </section>

    <Pager
      v-if="lcr.pagedMaximoUsers"
      @pager-changed="pagerChanged"
      :pagedData="lcr.pagedMaximoUsers"
      :page-number="lcr.homePageNumber"
      ref="maxUserPager"
      space-y-6
    ></Pager>

    <div class="mt-5 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table
        className="min-w-full divide-y divide-gray-200"
        v-if="lcr.pagedMaximoUsers != null"
      >
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
              PBOT
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Pernr
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Supervisor
            </th>
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
          v-for="person in lcr.pagedMaximoUsers.data"
          :key="person.personId"
        >
          <tr class="hover:bg-slate-100">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="ml-4" v-on:click="loadUser(person.userName)">
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
                {{ person.orgUnitDescription }}
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
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-semibold bg-green-100 text-green-800">
                {{ person.supervisorName }}
              </div>
              <div className="text-sm text-gray-500">
                {{ person.pbotGroup }}
              </div>
              <div className="text-sm text-gray-500">
                {{ person.pbotDivision }}
              </div>
              <div className="text-sm text-gray-500">
                {{ person.section }}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div v-if="person.computerNames">
                <div v-for="computer in person.computerNames.split(',')" :key="computer">
                  <router-link
                    :to="`/computer/${computer}`"
                    custom
                    v-slot="{ href, navigate }"
                  >
                    <Anchor :url="href" @click="navigate" class="no-underline">
                      {{ computer }}
                    </Anchor>
                  </router-link>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
