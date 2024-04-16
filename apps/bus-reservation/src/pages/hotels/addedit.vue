<script setup lang="ts">
import { Checkbox, Entry, Input, Button, Message } from '@pbotapps/components';
import { onMounted, ref } from 'vue';
import { User, useStore } from '../../store';
import { useRouter } from 'vue-router';

const props = defineProps({
  id: { type: String, required: false },
  title: { type: String, required: true },
});

const errors = ref<Error>();
const formRef = ref<HTMLFormElement>();
const hotel = ref<Partial<User>>();

const router = useRouter();
const store = useStore();

const save = async () => {
  if (formRef.value?.reportValidity()) {
    try {
      if (props.id) {
        await store.editUser(hotel.value as User);
      } else {
        await store.addUser(hotel.value as User);
      }
      router.push({ path: '/hotels' });
    } catch (error) {
      errors.value = error as Error;
    }
  }
};

onMounted(() => {
  if (props.id) {
    const h = store.user(props.id);
    if (h) {
      hotel.value = { ...h };
    }
  } else {
    hotel.value = { enabled: true };
  }
});
</script>

<template>
  <form
    v-if="hotel"
    ref="formRef"
    class="max-w-7xl mx-auto px-4 my-8 space-y-4"
    @submit.prevent="save"
  >
    <header class="mb-8">
      <h1 class="text-4xl font-bold">{{ title }}</h1>
    </header>
    <section v-if="errors">
      <Message color="red" variant="light" summary="Error saving hotel">
        {{ errors.message }}
      </Message>
    </section>
    <Entry id="name" label="Name" required v-slot="{ id, required }">
      <Input :id="id" :required="required" v-model="hotel.label" />
    </Entry>
    <Entry id="email" label="Email" required v-slot="{ id, required }">
      <Input :id="id" :required="required" v-model="hotel.email" type="email" />
    </Entry>
    <Entry id="enabled" label="Enabled" v-slot="{ id, required }">
      <Checkbox
        :id="id"
        :required="required"
        :checked="hotel.enabled"
        v-model="hotel.enabled"
        @changed="hotel.enabled = !hotel.enabled"
      >
      </Checkbox>
    </Entry>
    <Button label="Save" />
  </form>
</template>
