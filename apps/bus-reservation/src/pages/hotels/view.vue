<script setup lang="ts">
import { Field, FieldList } from '@pbotapps/components';
import { onMounted, ref } from 'vue';
import { User, useStore } from '../../store';

const hotel = ref<User>();
const props = defineProps({ id: { type: String, required: true } });
const store = useStore();

onMounted(() => {
  if (props.id) {
    hotel.value = store.user(props.id);
  }
});
</script>

<template>
  <article
    v-if="hotel"
    class="max-w-7xl mx-auto px-4 mt-4 mb-12 space-y-4 flex flex-col md:flex-row gap-4"
  >
    <main class="md:w-3/4">
      <header class="mb-8">
        <h1 class="text-3xl font-bold">{{ hotel.label }}</h1>
      </header>
      <FieldList class="flex flex-col gap-4">
        <Field name="Email" display="inline">
          {{ hotel.email }}
        </Field>
        <Field name="Enabled" display="inline">
          {{ hotel.enabled }}
        </Field>
      </FieldList>
    </main>
    <aside>
      <Fieldlist class="flex flex-col gap-4">
        <Field name="Creator" display="above">
          {{ hotel.creator }}
        </Field>
        <Field name="Created" display="above">
          {{ hotel.created.toLocaleString() }}
        </Field>
        <Field name="Updater" display="above">
          {{ hotel.updater }}
        </Field>
        <Field name="Updated" display="above">
          {{ hotel.updated.toLocaleString() }}
        </Field>
      </Fieldlist>
    </aside>
  </article>
</template>
