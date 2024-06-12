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
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Hotel, Reservation, Spot, useStore } from '../../store';
import Images from './images.vue';

const props = defineProps({
  id: { type: String, required: false },
  title: { type: String, required: true },
});

const router = useRouter();
const store = useStore();

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const now = toZonedTime(new Date(), tz);
const publicPath = import.meta.env.BASE_URL;

const active = ref(true);
const end = ref<Date>(endOfDay(now));
const errors = ref<Error>();
const existing = ref<Reservation>();
const formRef = ref<HTMLFormElement>();
const hotel = ref<Hotel>(store.hotels.filter(h => h.enabled)[0]);
const showImages = ref(false);
const start = ref<Date>(startOfDay(now));
const spot = ref<Spot>(store.spots[0]);

const save = async () => {
  if (formRef.value?.reportValidity()) {
    try {
      if (props.id && existing.value) {
        if (spot.value && hotel.value && start.value && end.value) {
          await store.editReservation(props.id, existing.value.spot.id, {
            spot: spot.value,
            hotel: hotel.value,
            start: start.value,
            end: end.value,
            active: active.value,
          });
          router.push({ path: '/reservations' });
        }
      } else {
        await store.addReservation({
          spot: spot.value,
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

const spots = computed(() => {
  const existing = (spot: Spot) =>
    store.reservations
      .filter(res => !(props.id && props.id == res.id))
      .filter(res => res.spot.id == spot.id)
      .filter(
        res =>
          (start.value >= res.start && start.value <= res.end) ||
          (end.value >= res.start && end.value <= res.end) ||
          (start.value <= res.start && end.value >= res.end)
      );

  const spots = new Array<Spot>();
  for (const zone of store.zones) {
    spots.push(
      ...store.spots
        .filter(spot => spot.zone == zone)
        .sort((a, b) => (a.label > b.label ? 1 : -1))
    );
  }

  return spots.filter((spot: Spot) => !(existing(spot).length > 0));
});

onMounted(async () => {
  await store.getSpots();
  await store.getHotels();

  hotel.value = store.hotels.filter(h => h.enabled)[0];
  spot.value = spots.value[0];

  if (props.id) {
    existing.value = store.reservation(props.id);
    if (existing.value) {
      active.value = existing.value.active;
      hotel.value = existing.value.hotel;
      spot.value = existing.value.spot;
      start.value = existing.value.start;
      end.value = existing.value.end;
    }
  }
});

const setSpot = (id: string) => {
  const z = store.spot(id);
  if (z) spot.value = z;
};

const setHotel = (id: string) => {
  const h = store.hotel(id);
  if (h) hotel.value = h;
};
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 my-8">
    <header>
      <h1 class="text-4xl font-bold mb-8">{{ title }}</h1>
    </header>
    <main class="flex flex-col md:flex-row gap-4 md:gap-8">
      <form
        ref="formRef"
        class="flex-none w-1/3 space-y-4"
        @submit.prevent="save"
      >
        <section v-if="errors">
          <Message
            color="red"
            variant="light"
            summary="Error saving reservation"
          >
            {{ errors.message }}
          </Message>
        </section>
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
          id="spot"
          label="Spot"
          required
          :inline="false"
          v-slot="{ id, required }"
        >
          <Select :id="id" :required="required" @changed="setSpot">
            <optgroup v-for="zone in store.zones" :key="zone" :label="zone">
              <option
                v-for="s in spots
                  .filter(s => s.zone == zone)
                  .sort((a, b) => (a.label > b.label ? 1 : -1))"
                :key="s.id"
                :value="s.id"
                :selected="s.id == spot?.id"
              >
                {{ s.label }}
              </option>
            </optgroup>
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
          v-if="existing"
          id="active"
          label="Active"
          :inline="false"
          v-slot="{ id, required }"
        >
          <small>
            Uncheck this to cancel the reservation. The reservation will no
            longer be accessible from this application.
          </small>
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
      <aside class="flex-1">
        <Images as="section" color="transparent" orientation="horizontal" />
      </aside>
    </main>
  </section>
</template>
