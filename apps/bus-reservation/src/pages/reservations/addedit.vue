<script setup lang="ts">
import {
  Button,
  Checkbox,
  Entry,
  Input,
  Message,
  Select,
} from '@pbotapps/components';
import { endOfDay, format, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Hotel, Reservation, Zone, useStore } from '../../store';

const props = defineProps({
  id: { type: String, required: false },
  title: { type: String, required: true },
});

const router = useRouter();
const store = useStore();

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const now = toZonedTime(new Date(), tz);

const active = ref(true);
const end = ref<Date>(endOfDay(now));
const errors = ref<Error>();
const existing = ref<Reservation>();
const formRef = ref<HTMLFormElement>();
const hotel = ref<Hotel>(store.hotels.filter(h => h.enabled)[0]);
const start = ref<Date>(startOfDay(now));
const zone = ref<Zone>(store.zones[0]);

const save = async () => {
  if (formRef.value?.reportValidity()) {
    try {
      if (props.id && existing.value) {
        if (zone.value && hotel.value && start.value && end.value) {
          await store.editReservation(props.id, existing.value.zone.id, {
            zone: zone.value,
            hotel: hotel.value,
            start: start.value,
            end: end.value,
            active: active.value,
          });
          router.push({ path: '/reservations' });
        }
      } else {
        await store.addReservation({
          zone: zone.value,
          hotel: hotel.value,
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

onMounted(async () => {
  await store.getZones();
  await store.getHotels();

  hotel.value = store.hotels.filter(h => h.enabled)[0];
  zone.value = store.zones[0];

  if (props.id) {
    existing.value = store.reservation(props.id);
    if (existing.value) {
      active.value = existing.value.active;
      hotel.value = existing.value.hotel;
      zone.value = existing.value.zone;
      start.value = existing.value.start;
      end.value = existing.value.end;
    }
  }
});

const setZone = (id: string) => {
  const z = store.zone(id);
  if (z) zone.value = z;
};

const setHotel = (id: string) => {
  const h = store.hotel(id);
  if (h) hotel.value = h;
};
</script>

<template>
  <form
    ref="formRef"
    class="max-w-7xl mx-auto px-4 my-8 space-y-4"
    @submit.prevent="save"
  >
    <h1 class="text-4xl font-bold mb-8">{{ title }}</h1>
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
          v-for="h in store.hotels.filter(u => u.enabled)"
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
        :modelValue="format(toZonedTime(start, tz), 'yyyy-MM-dd')"
        @changed="start = startOfDay(toZonedTime($event, tz))"
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
        :modelValue="format(toZonedTime(end, tz), 'yyyy-MM-dd')"
        @changed="end = endOfDay(toZonedTime($event, tz))"
      />
    </Entry>
    <Entry
      v-if="existing"
      id="active"
      label="Active"
      :inline="false"
      v-slot="{ id, required }"
    >
      <Checkbox
        :id="id"
        :required="required"
        :checked="active"
        v-model="active"
        @changed="active = !active"
      >
      </Checkbox>
    </Entry>
    <Button label="Save" />
  </form>
</template>
