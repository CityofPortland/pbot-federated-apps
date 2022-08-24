<script setup lang="ts">
import { toRefs } from 'vue';
import { useRouter } from 'vue-router';
import {
  Button,
  Entry,
  Input,
  Textarea,
  query,
  useAuthStore,
} from '@pbotapps/common';

import { Application } from '../../models/application';
import { Rule } from '../../models/rule';

const { accessToken } = useAuthStore();
const router = useRouter();

const props = defineProps({
  rule: {
    type: Object as () => Rule,
    default: () => ({}),
  },
  application: {
    type: Object as () => Application,
    default: () => ({}),
  },
});

const { application, rule } = toRefs(props);

const handleSubmit = async () => {
  //send the application to GraphQL
  //if success, send to application page?
  //else show errors
  try {
    const res = await query<{ addRule: Rule }>({
      operation: `
          mutation addRule($data: NewRuleInput!) {
            addRule(data:$data) {
              uuid
              name
              description
            }
          }`,
      variables: {
        data: {
          ...rule.value,
          application: {
            uuid: application.value.uuid,
          },
        },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (res.errors) {
      // display them somehow
    }

    const r = res.data?.addRule;

    if (r && r.uuid) {
      const to = {
        name: 'Application',
        params: { uuid: application.value.uuid },
      };
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
