<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useCounterStore } from '../store/counter';
import { PagedMaximoUsers, MaximoUser } from '../types/pagedMaximoUsers';
import { useLcrStore } from '../store/lcr';

const counter = useCounterStore();
const lcr = useLcrStore();
counter.increment();

let searchLastName = ref('');

onMounted(async () => {
  lcr.fetchMaximoUsers();
});

async function doStuff() {
  lcr.fetchMaximoUsers(searchLastName.value);
  counter.increment();
}
</script>

<template>
  Count : {{ counter.count }} <br />

  Search Last Name:
  <input
    type="text"
    v-model="searchLastName"
    @keyup="doStuff()"
    class="border border-black"
  /><br />

  <div v-if="lcr.pagedMaximoUsers.data">
    Showing ({{ lcr.pagedMaximoUsers.pageSize }}) users / page
    {{ lcr.pagedMaximoUsers.pageNumber }} of
    {{ lcr.pagedMaximoUsers.totalPages }}

    <div
      v-for="pagedUser in lcr.pagedMaximoUsers.data"
      :key="pagedUser.personId"
    >
      {{ pagedUser.firstName }} {{ pagedUser.lastName }} ({{
        pagedUser.username
      }})
    </div>
  </div>
  <div v-else>Loading users...</div>
</template>
