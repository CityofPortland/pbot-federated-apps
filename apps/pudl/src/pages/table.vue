<script setup lang="ts">
import { Box } from '@pbotapps/common';
import { Breadcrumbs } from '@pbotapps/common';
import { useRoute } from 'vue-router';

const props = defineProps({ table: { type: Object, required: true } });

const columns = [...props.table.columns].sort((a, b) => a.index - b.index);

const { path } = useRoute();
</script>

<template>
  <article class="flex flex-col space-y-4">
    <Breadcrumbs :path="path"></Breadcrumbs>
    <h1 class="text-3xl capitalize">{{ table.name }}</h1>
    <h2 class="text-2xl">Fields</h2>
    <table class="table-fixed w-full">
      <Box as="thead">
        <tr>
          <th class="border-b font-semibold p-2 pl-4 text-left">Name</th>
          <th class="border-b font-semibold p-2 pl-4 text-left">Type</th>
        </tr>
      </Box>
      <tbody>
        <tr v-for="column in columns" :key="column.name" class="border-b">
          <td class="p-2 pl-4">
            {{ column.name }}
          </td>
          <td class="p-2 pl-4">
            {{ column.type }}
          </td>
        </tr>
      </tbody>
    </table>
  </article>
</template>
