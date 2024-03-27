<script setup lang="ts">
import { Button, Entry, Input, Textarea, query } from '@pbotapps/components';
import { toRefs } from 'vue';

import { Application } from '../../models/application';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';

const { getToken } = useAuthStore();
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
  const token = await getToken();

  try {
    const res = await query<{ addApplication: Application }>({
      operation: `
          mutation AddApplication($input: ApplicationInput!) {
            addApplication(input:$input) {
              _id
              name
              description
            }
          }`,
      variables: {
        input: {
          ...application.value,
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.errors) {
      // display them somehow
    }

    const app = res.data?.addApplication;

    if (app && app._id) {
      const to = { name: 'Application', params: { id: app._id } };
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
  <form class="flex flex-col gap-4 items-start" @submit.prevent="handleSubmit">
    <Entry id="name" label="Name" required v-slot="{ id, required }">
      <Input
        :id="id"
        :name="id"
        :required="required"
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
        v-model="application.description"
      />
    </Entry>
    <Button label="Save" />
  </form>
</template>
