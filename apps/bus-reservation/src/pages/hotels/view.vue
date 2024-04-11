<script setup lang="ts">
import { Field, FieldList } from '@pbotapps/components';
import { ref } from 'vue';
import { User, useStore } from '../../store';

const props = defineProps({ id: { type: String, required: true } });

const store = useStore();

const hotel = ref<User | undefined>(store.user(props.id));
</script>

<template>
  <article v-if="hotel" class="max-w-7xl mx-auto px-4 my-8">
    <header class="mb-8">
      <h1 class="text-4xl font-bold">{{ hotel.label }}</h1>
    </header>
    <main class="flex flex-col md:flex-row gap-4">
      <section class="md:w-3/4">
        <FieldList class="flex flex-col gap-4">
          <Field name="Email" display="inline">
            {{ hotel.email }}
          </Field>
          <Field name="Enabled" display="inline">
            {{ hotel.enabled }}
          </Field>
        </FieldList>
      </section>
      <aside class="text-sm">
        <Fieldlist class="flex flex-col gap-2">
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
    </main>
  </article>
</template>
