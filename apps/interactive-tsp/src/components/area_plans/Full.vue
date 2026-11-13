<template>
  <article>
    <h1 class="mb-3 text-3xl">{{ plan.name }}</h1>
    <FieldList>
      <Field v-for="field in fields" :key="field.name" :name="field.name">{{
        field.value
      }}</Field>
      <Field v-if="plan.document" name="Document">
        <a :href="plan.document" class="border-b-2 border-current">{{
          plan.document
        }}</a>
      </Field>
    </FieldList>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Field, FieldList } from '@pbotapps/components';

import type { AreaPlan } from '../../store/areaPlans';

const props = defineProps<{ plan: AreaPlan }>();

const fields = computed(() =>
  (['manager', 'requirements', 'adopted'] as const).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: props.plan[key],
  }))
);
</script>
