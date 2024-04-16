<script setup lang="ts">
import { Entry, Select, Input, Button, Message } from '@pbotapps/components';
import { onMounted, ref } from 'vue';
import { User, Zone, useStore } from '../../store';
import { toZonedTime } from 'date-fns-tz';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';

const props = defineProps({
  id: { type: String, required: false },
  title: { type: String, required: true },
});

const store = useStore();

const hotel = ref<User>(store.users[0]);
const zone = ref<Zone>(store.zones[0]);
const formRef = ref<HTMLFormElement>();
const errors = ref<Error>();
const router = useRouter();

const start = ref<Date>(new Date());
const end = ref<Date>(new Date());

const save = async () => {
  if (formRef.value?.reportValidity()) {
    try {
      if (props.id) {
        if (zone.value && hotel.value && start.value && end.value) {
          await store.editReservation({
            id: props.id,
            zone: zone.value,
            user: hotel.value,
            start: start.value,
            end: end.value,
          });
          router.push({ path: '/reservations' });
        }
      } else {
        await store.addReservation({
          zone: zone.value,
          user: hotel.value,
          start: start.value,
          end: end.value,
        });
        router.push({ path: '/reservations' });
      }
    } catch (error) {
      errors.value = error as Error;
    }
  }
};

onMounted(() => {
  if (props.id) {
    const r = store.reservation(props.id);
    if (r) {
      hotel.value = r.user;
      zone.value = r.zone;
      start.value = r.start;
      end.value = r.end;
    }
  }
});

const setZone = (id: string) => {
  const z = store.zone(id);
  if (z) zone.value = z;
};

const setHotel = (id: string) => {
  const h = store.user(id);
  if (h) hotel.value = h;
};
</script>

<template>
  <form
    ref="formRef"
    class="max-w-7xl mx-auto px-4 mt-4 mb-12 space-y-4"
    @submit.prevent="save"
  >
    <h1 class="text-4xl font-bold">{{ title }}</h1>
    <section v-if="errors">
      <Message color="red" variant="light" summary="Error saving reservation">
        {{ errors.message }}
      </Message>
    </section>
    <Entry
      id="zone"
      label="Zone"
      required
      :inline="false"
      v-slot="{ id, required }"
    >
      <Select :id="id" :required="required" @changed="setZone">
        <option
          v-for="z in store.zones"
          :key="z.id"
          :value="z.id"
          :selected="z.id == zone?.id"
        >
          {{ z.label }}
        </option>
      </Select>
    </Entry>
    <Entry
      id="hotel"
      label="Hotel"
      required
      :inline="false"
      v-slot="{ id, required }"
    >
      <Select :id="id" :required="required" @changed="setHotel">
        <option
          v-for="h in store.users.filter(u => u.enabled)"
          :key="h.id"
          :value="h.id"
          :selected="h.id == hotel?.id"
        >
          {{ h.label }}
        </option>
      </Select>
    </Entry>
    <Entry
      id="start"
      label="Start"
      required
      :inline="false"
      v-slot="{ id, required }"
    >
      <Input
        :id="id"
        :required="required"
        type="date"
        :modelValue="start.toISOString().slice(0, 10)"
        @changed="start = toZonedTime($event, 'America/Los_Angeles')"
      />
    </Entry>
    <Entry
      id="end"
      label="End"
      required
      :inline="false"
      v-slot="{ id, required }"
    >
      <Input
        :id="id"
        :required="required"
        type="date"
        :modelValue="format(end, 'yyyy-MM-dd')"
        @changed="end = toZonedTime($event, 'America/Los_Angeles')"
      />
    </Entry>
    <Button label="Save" />
  </form>
</template>
