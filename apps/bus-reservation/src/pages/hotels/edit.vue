<script setup lang="ts">
import { Checkbox, Entry, Input, Button, Message } from '@pbotapps/components';
import { onMounted, ref } from 'vue';
import { User, Zone, useStore } from '../../store';
import { useRouter } from 'vue-router';

const store = useStore();
const hotel = ref<User>();
const formRef = ref<HTMLFormElement>();
const errors = ref<Error>();
const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();

const save = async () => {
  if (formRef.value?.reportValidity()) {
    console.log('Saved: ', hotel.value);
    try {
      await store.editUser(hotel.value as User);
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
  }
});
</script>

<template>
  <form
    v-if="hotel"
    ref="formRef"
    class="max-w-7xl mx-auto px-4 mt-4 mb-12 space-y-4"
    @submit.prevent="save"
  >
    <header><h1 class="text-3xl mb-4 font-bold">Edit Hotel</h1></header>
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
    <div>{{ hotel }}</div>
    <Button>Save</Button>
  </form>
</template>
