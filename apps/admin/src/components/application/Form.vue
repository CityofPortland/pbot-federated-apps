<script setup lang="ts">
import {
  Button,
  Entry,
  Input,
  Message,
  Spinner,
  Textarea,
} from '@pbotapps/components';
import { computed, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';

import { Application } from '../../models/application';
import { useApplicationStore } from '../../store/application';
import { useErrorStore } from '../../store/error';

const { add } = useApplicationStore();
const errorStore = useErrorStore();
const router = useRouter();

errorStore.remove('add-application');

const props = defineProps({
  application: {
    type: Object as () => Application,
    default: () => ({}),
  },
});

const { application } = toRefs(props);
const saving = ref(false);

const errors = computed(() => [
  ...errorStore.get('add-application'),
  ...errorStore.get('edit-application'),
]);
const title = computed(
  () => `${application.value.id == undefined ? 'Add' : 'Edit'} application`
);

const handleSubmit = async () => {
  saving.value = true;

  //send the application to GraphQL
  const res = await add(application.value);

  saving.value = false;

  console.debug(res);

  //if success, send to application page?
  if (res) {
    const to = { name: 'Application', params: { id: res.id } };
    // route to new application
    router.push(to);
  }
  //else show errors
};
</script>

<template>
  <form class="flex flex-col gap-4 items-start" @submit.prevent="handleSubmit">
    <header class="mb-8">
      <h1 class="text-4xl font-bold">{{ title }}</h1>
    </header>
    <section>
      <Message
        v-for="(error, i) in errors"
        :key="i"
        color="red"
        variant="light"
        summary="Error saving application"
        @close="errorStore.remove('add-application')"
      >
        {{ error[1].message }}
      </Message>
    </section>
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
      class="w-full"
      required
      v-slot="{ id, required }"
    >
      <Textarea
        :id="id"
        :name="id"
        :required="required"
        class="w-full"
        rows="5"
        v-model="application.description"
      />
    </Entry>
    <Button label="Save" class="min-w-24 inline-flex justify-center">
      <template v-slot:default="{ label }">
        <Spinner v-if="saving" class="h-6 w-6" />
        <span v-else>{{ label }}</span>
      </template>
    </Button>
  </form>
</template>
