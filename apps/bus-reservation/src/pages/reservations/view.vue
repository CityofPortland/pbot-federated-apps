<script setup lang="ts">
import { Field, FieldList } from '@pbotapps/components';
import { onMounted, ref } from 'vue';
import { Reservation, useStore } from '../../store';
import { useRouter } from 'vue-router';

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
  <article
    v-if="reservation"
    class="max-w-7xl mx-auto px-4 mt-4 mb-12 space-y-4 flex flex-col md:flex-row gap-4"
  >
    <main class="md:w-3/4">
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Reservation details</h1>
      </header>
      <FieldList class="flex flex-col gap-4">
        <Field name="Hotel" display="inline">
          {{ reservation.user.label }}
        </Field>
        <Field name="Zone" display="inline">
          {{ reservation.zone.label }}
        </Field>
        <Field name="Start" display="inline">
          {{ reservation.start.toLocaleDateString() }}
        </Field>
        <Field name="End" display="inline">
          {{ reservation.end.toLocaleDateString() }}
        </Field>
      </FieldList>
    </main>
    <aside>
      <Fieldlist class="flex flex-col gap-4">
        <Field name="Creator" display="above">
          {{ reservation.creator }}
        </Field>
        <Field name="Created" display="above">
          {{ reservation.created.toLocaleString() }}
        </Field>
        <Field name="Updater" display="above">
          {{ reservation.updater }}
        </Field>
        <Field name="Updated" display="above">
          {{ reservation.updated.toLocaleString() }}
        </Field>
      </Fieldlist>
    </aside>
  </article>
</template>
