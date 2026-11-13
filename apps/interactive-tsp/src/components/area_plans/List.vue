<template>
  <router-link
    :to="{ name: 'area-plans', params: { id: plan.id } }"
    class="block my-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
    @mouseover="areaPlans.highlightPlan({ plan, move: false })"
    @focus="areaPlans.highlightPlan({ plan, move: false })"
  >
    <slot>
      <span
        class="px-2 py-1 mb-2 bg-fog-300 text-fog-900 text-sm rounded-md shadow inline-block"
        >Area plan</span
      >
      <h3 class="text-lg">{{ plan.name }}</h3>
    </slot>
  </router-link>
</template>

<script setup lang="ts">
import { useAreaPlanStore, type AreaPlan } from '../../store/areaPlans';

defineProps<{ plan: AreaPlan }>();

const areaPlans = useAreaPlanStore();
</script>
