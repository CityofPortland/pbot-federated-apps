<script setup lang="ts">
import { Anchor, Box } from '@pbotapps/components';
import { ref } from 'vue';

import { Application } from '../../models/application.js';
import Form from '../rule/Form.vue';

defineProps({
  app: {
    type: Object as () => Application,
    required: true,
  },
});

const showForm = ref(false);
</script>

<template>
  <Box as="article" class="grid grid-cols-1 gap-4 mb-12">
    <header class="flex flex-col md:flex-row md:justify-between">
      <h1 class="text-4xl">{{ app.name }}</h1>
    </header>
    <main class="grid grid-cols-1 gap-4">
      <section>
        <p v-html="app.description" />
      </section>
      <section>
        <header class="flex items-start justify-between mb-4">
          <h2 class="text-3xl">Rules</h2>
          <Anchor url="#" @click="showForm = true">Add rule</Anchor>
        </header>
        <Form
          v-if="showForm"
          :application="app"
          @cancel="showForm = false"
          class="my-4"
        />
        <section v-if="app.rules && app.rules.length">
          <table class="w-full">
            <thead>
              <Box as="tr" color="gray" variant="light">
                <th class="border-b font-bold p-4 text-left capitalize">
                  Inverted
                </th>
                <th class="border-b font-bold p-4 text-left capitalize">
                  Action
                </th>
                <th class="border-b font-bold p-4 text-left capitalize">
                  Subject
                </th>
                <th class="border-b font-bold p-4 text-left capitalize">
                  Conditions
                </th>
                <th class="border-b font-bold p-4 text-left capitalize">
                  Fields
                </th>
                <th class="border-b p-4"></th>
              </Box>
            </thead>
            <tbody>
              <tr v-for="rule in app.rules" :key="rule._id">
                <td class="border-b p-4">
                  {{ rule.inverted ? 'cannot' : 'can' }}
                </td>
                <td class="border-b p-4">
                  {{ rule.action }}
                </td>
                <td class="border-b p-4">
                  {{ rule.subject }}
                </td>
                <td class="border-b p-4">
                  {{ JSON.stringify(rule.conditions) }}
                </td>
                <td class="border-b p-4">
                  {{ JSON.stringify(rule.fields) }}
                </td>
                <td class="border-b p-4">
                  <router-link
                    :to="{ name: 'Rule', params: { id: rule._id } }"
                    custom
                    v-slot="{ href, navigate }"
                  >
                    <Anchor :url="href" @click="navigate">View</Anchor>
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <p v-else>
          No rules have been added yet. Use the 'Add rule' button above to add
          rules.
        </p>
      </section>
    </main>
  </Box>
</template>
