<template>
  <router-link
    :to="{ name: 'master-street-plans', params: { id: plan.id } }"
    class="block my-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
    @mouseover="masterStreetPlans.highlightPlan({ plan, move: false })"
    @focus="masterStreetPlans.highlightPlan({ plan, move: false })"
  >
    <slot>
      <article>
        <header
          v-if="showType"
          class="px-2 py-1 mb-2 bg-fog-300 text-fog-900 text-sm rounded-md shadow inline-block"
        >
          Master street plan
        </header>
        <h3 class="text-lg">{{ plan.name }}</h3>
        <main class="text-sm text-gray-700">
          <dl>
            <div class="flex items-center my-1">
              <dt class="mr-2">
                <Icon type="solid" name="adjustment" class="w-4 h-4" />
                <span class="sr-only">Feature count</span>
              </dt>
              <dd>
                <span>{{ plan.features?.length || 0 }} features</span>
              </dd>
            </div>
          </dl>
        </main>
      </article>
    </slot>
  </router-link>
</template>

<script setup lang="ts">
import { Icon } from '@pbotapps/components';

import {
  useMasterStreetPlanStore,
  type MasterStreetPlan,
} from '../../store/masterStreetPlans';

withDefaults(defineProps<{ plan: MasterStreetPlan; showType?: boolean }>(), {
  showType: false,
});

const masterStreetPlans = useMasterStreetPlanStore();
</script>
