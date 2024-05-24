<script setup lang="ts">
import { Anchor, Box, Entry, Input, Message } from '@pbotapps/components';
import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useRoute } from 'vue-router';
import { useStore } from '../../store';
import { computed, onMounted, ref } from 'vue';

const { path } = useRoute();
const store = useStore();
const errors = ref<Error>();
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const now = toZonedTime(new Date(), tz);
const end = ref<Date>(endOfDay(addDays(now, 30)));
const start = ref<Date>(startOfDay(now));

const reservations = computed(() => {
  return store.reservations.filter(
    res => res.start <= end.value && res.end >= start.value
  );
});

const validateStart = (startDt: string) => {
  start.value = startOfDay(toZonedTime(startDt, tz));
  errors.value = undefined;
  if (start.value < startOfDay(now))
    errors.value = Error(`Start date is before today.`);
  else if (start.value > end.value)
    errors.value = Error(`Start date is after end date.`);
};

const validateEnd = (endDt: string) => {
  end.value = endOfDay(toZonedTime(endDt, tz));
  errors.value = undefined;
  if (end.value < now) {
    errors.value = Error(`End date is before today.`);
  } else if (end.value < start.value)
    errors.value = Error(`End date is before start date.`);
};

onMounted(() => {
  store.getReservations();
});
</script>

<template>
  <article class="max-w-7xl mx-auto px-4 my-8 space-y-4">
    <header class="flex mb-8">
      <h1 class="text-4xl font-bold">Reservations</h1>
      <router-link
        v-if="
          store.rules.find(
            r => r.subject == 'reservation' && r.action == 'write'
          )
        "
        :to="`${path}/add`"
        custom
        v-slot="{ href, navigate }"
      >
        <Anchor class="ml-auto" :url="href" @click="navigate">Add</Anchor>
      </router-link>
    </header>
    <main class="overflow-auto">
      <p>
        The table below lists reservations filtered by the start and end dates
        shown below. Past or cancelled reservations are not shown. Reservations
        that are currently active are
        <Box as="span" color="blue" variant="light">highlighted in blue</Box>.
        You can refine this list by changing the start and end dates.
      </p>
      <section class="gap-4 my-8" v-if="errors">
        <Message
          color="orange"
          variant="light"
          summary="Invalid filters selection"
        >
          {{ errors.message }}
        </Message>
      </section>
      <section class="flex gap-4 my-8">
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
            @changed="validateStart"
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
            @changed="validateEnd"
          />
        </Entry>
      </section>

      <table class="-ml-2 w-full table-auto border-separate border-spacing-y-1">
        <caption></caption>
        <thead class="pb-4">
          <tr class="text-left">
            <th class="font-semibold p-2">Hotel</th>
            <th class="font-semibold p-2">Bus zone</th>
            <th class="font-semibold p-2">Bus spot</th>
            <th class="font-semibold p-2">Start</th>
            <th class="font-semibold p-2">End</th>
            <th class="font-semibold p-2"></th>
          </tr>
        </thead>
        <tbody>
          <Box
            as="tr"
            v-for="res in reservations.sort(
              (a, b) => a.start.valueOf() - b.start.valueOf()
            )"
            :key="res.id"
            :color="res.start <= now && res.end >= now ? 'blue' : 'transparent'"
            variant="light"
          >
            <td class="p-2">
              {{ res.hotel.label }}
            </td>
            <td class="p-2">{{ res.spot.zone }}</td>
            <td class="p-2">{{ res.spot.label }}</td>
            <td class="p-2">{{ res.start.toLocaleDateString() }}</td>
            <td class="p-2">{{ res.end.toLocaleDateString() }}</td>
            <td class="flex gap-4 p-2">
              <router-link
                :to="`/reservations/${res.id}`"
                custom
                v-slot="{ href, navigate }"
              >
                <Anchor :url="href" @click="navigate">View</Anchor>
              </router-link>
              <router-link
                v-if="
                  store.rules.find(
                    r => r.subject == 'reservation' && r.action == 'write'
                  )
                "
                :to="`/reservations/${res.id}/edit`"
                custom
                v-slot="{ href, navigate }"
              >
                <Anchor :url="href" @click="navigate">Edit</Anchor>
              </router-link>
            </td>
          </Box>
        </tbody>
      </table>
    </main>
  </article>
</template>
