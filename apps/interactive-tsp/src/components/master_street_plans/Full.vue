<template>
  <article>
    <h1 class="mb-3 text-3xl">{{ plan.name }}</h1>
    <p class="text-xl text-gray-800">{{ plan.description }}</p>
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
    <h2 class="mb-3 text-2xl">Features of the plan</h2>
    <ul v-if="plan.features && plan.features.length > 0" class="list-none">
      <li
        v-for="feature in plan.features"
        :key="feature.id"
        class="my-2 flex items-center justify-between"
      >
        <Toggle
          :id="feature.id"
          label="Enabled"
          class="mr-2"
          :model-value="feature.enabled"
          @update:model-value="handleToggle(feature, $event)"
        />
        <label :id="`${feature.id}-label`" class="flex-1 pr-2"
          >{{ feature.type }} {{ feature.alignment }}</label
        >
        <span class="px-2 py-1 bg-blue-500 text-white text-sm rounded-md">{{
          feature.count
        }}</span>
      </li>
    </ul>
    <span v-else class="italic">No features in this plan</span>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Field, FieldList, Toggle } from '@pbotapps/components';

import {
  useMasterStreetPlanStore,
  type MasterStreetPlan,
  type MasterStreetPlanFeature,
} from '../../store/masterStreetPlans';

const props = defineProps<{ plan: MasterStreetPlan }>();

const masterStreetPlans = useMasterStreetPlanStore();

const fields = computed(() =>
  (['adopted', 'manager'] as const).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: props.plan[key],
  }))
);

function handleToggle(feature: MasterStreetPlanFeature, enabled: boolean) {
  masterStreetPlans.toggleFeature({ feature, value: enabled });
}
</script>
