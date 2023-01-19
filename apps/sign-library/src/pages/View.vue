<script setup lang="ts">
import { Box, Button, FieldList, Field } from '@pbotapps/components';
import { computed } from 'vue';
import { useStore } from '../store';
import { Sign } from '../types';

const store = useStore();

const props = defineProps({
  code: String,
});

const sign = computed(() =>
  props.code ? store.sign(props.code) : ({} as Sign)
);
</script>

<template>
  <article class="">
    <header class="prose prose-lg flex">
      <h1 class="flex-1">{{ sign.code }}</h1>
      <router-link :to="`/${sign.code}/edit`">
        <Button label="Edit" size="small" />
      </router-link>
    </header>
    <main class="mt-8 flex flex-col md:flex-row">
      <section class="prose w-full md:w-2/3">
        <figure>
          <Box
            color="gray"
            variant="light"
            class="flex items-center justify-center w-64 h-64"
          >
            Sign image here
          </Box>
        </figure>
        <section>
          <FieldList>
            <Field name="Status" display="above">
              {{ sign.status }}
            </Field>
            <Field name="Shape" display="above">
              {{ sign.shape }}
            </Field>
            <Field name="Color" display="above">
              {{ sign.color }}
            </Field>
            <Field name="Legend" display="above">
              {{ sign.legend }}
            </Field>
            <Field v-if="sign.description" name="Comments" display="above">
              {{ sign.description }}
            </Field>
          </FieldList>
        </section>
      </section>
      <aside class="w-full md:w-1/3 prose prose-sm">
        <FieldList>
          <Field name="Created" display="above">
            {{ sign._created.toLocaleString() }}
          </Field>
          <Field name="Changed" display="above">
            {{ sign._changed.toLocaleString() }}
          </Field>
        </FieldList>
      </aside>
    </main>
  </article>
</template>