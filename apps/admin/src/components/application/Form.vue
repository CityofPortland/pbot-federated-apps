<script setup lang="ts">
import { toRefs } from 'vue';
import {
  Button,
  Entry,
  Input,
  Textarea,
  query,
  useAuthStore,
} from '@pbotapps/common';

import { Application } from '../../models/application';
import { useRouter } from 'vue-router';

const { accessToken } = useAuthStore();
const router = useRouter();

const props = defineProps({
  application: {
    type: Object as () => Application,
    default: () => ({}),
  },
});

const { application } = toRefs(props);

const handleSubmit = async () => {
  //send the application to GraphQL
  //if success, send to application page?
  //else show errors
  try {
    const res = await query<{ addApplication: Application }>({
      operation: `
          mutation AddApplication($data: NewApplicationInput!) {
            addApplication(data:$data) {
              uuid
              name
              description
            }
          }`,
      variables: {
        data: {
          ...application.value,
        },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (res.errors) {
      // display them somehow
    }

    const app = res.data?.addApplication;

    if (app && app.uuid) {
      const to = { name: 'Application', params: { uuid: app.uuid } };
      // route to new application
      router.push(to);
    }
  } catch (err) {
    // display them?
    console.error(err);
  }
};
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <Entry id="name" label="Name" required v-slot="{ id, required }">
      <Input
        :id="id"
        :name="id"
        :required="required"
        class="w-full"
        v-model="application.name"
      />
    </Entry>
    <Entry
      id="description"
      label="Description"
      required
      v-slot="{ id, required }"
    >
      <Textarea
        :id="id"
        :name="id"
        :required="required"
        class="w-full"
        v-model="application.description"
      />
    </Entry>
    <Button label="Save" />
  </form>
</template>
