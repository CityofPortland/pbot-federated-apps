<script setup lang="ts">
import { Field, FieldList } from '@pbotapps/components';
import { onMounted, ref } from 'vue';
import { Reservation, useStore } from '../../store';

const reservation = ref<Reservation>();
const props = defineProps({ id: { type: String, required: true } });
const store = useStore();

onMounted(() => {
  if (props.id) {
    reservation.value = store.reservation(props.id);
  }
});
</script>

<template>
  <article v-if="reservation" class="max-w-7xl mx-auto px-4 mt-4 mb-12">
    <header class="mb-8">
      <h1 class="text-3xl font-bold">Reservation details</h1>
    </header>
    <main class="flex flex-col md:flex-row">
      <section class="md:w-2/3">
        <FieldList class="flex flex-col gap-4">
          <Field name="Hotel" display="inline">
            {{ reservation.hotel.label }}
          </Field>
          <Field name="Zone" display="inline">
            {{ reservation.spot.zone }}
          </Field>
          <Field name="Spot" display="inline">
            {{ reservation.spot.label }}
          </Field>
          <Field name="Start" display="inline">
            {{ reservation.start.toLocaleDateString() }}
          </Field>
          <Field name="End" display="inline">
            {{ reservation.end.toLocaleDateString() }}
          </Field>
        </FieldList>
      </section>
      <aside class="text-sm">
        <Fieldlist class="flex flex-col gap-4">
          <Field v-if="reservation.creator" name="Creator" display="above">
            {{ reservation.creator }}
          </Field>
          <Field name="Created" display="above">
            {{ reservation.created.toLocaleString() }}
          </Field>
          <Field v-if="reservation.updater" name="Updater" display="above">
            {{ reservation.updater }}
          </Field>
          <Field name="Updated" display="above">
            {{ reservation.updated.toLocaleString() }}
          </Field>
        </Fieldlist>
      </aside>
    </main>
  </article>
</template>
