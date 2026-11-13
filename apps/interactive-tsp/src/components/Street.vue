<template>
  <article class="my-3">
    <h1 class="mb-3 text-3xl lg:text-4xl">
      {{ street.name?.trim() || 'Unnamed segment' }}
    </h1>
    <p class="my-3 text-2xl text-gray-700" v-if="street.block">
      {{ street.block }} block
    </p>
    <section>
      <dl>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
          <dt class="text-gray-700">Transportation plan ID</dt>
          <dd>{{ street.id }}</dd>
        </div>
        <div
          v-for="(classification, index) in classificationKeys()"
          :key="index"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3"
        >
          <dt class="text-gray-700">
            {{
              classification.charAt(0).toUpperCase() + classification.slice(1)
            }}
            classification
          </dt>
          <dd>
            <router-link
              v-if="
                classification != 'greenscape' &&
                classificationLabel(
                  classification,
                  classificationValue(classification)
                ) != 'N/A'
              "
              :to="{
                name: 'text',
                hash: `#${classificationLabel(
                  classification,
                  classificationValue(classification)
                )
                  .toLowerCase()
                  .split(' ')
                  .join('-')}`,
              }"
              class="border-current border-b-2 transition ease-in-out duration-150 hover:text-blue-600 focus:text-blue-600"
              >{{
                classificationLabel(
                  classification,
                  classificationValue(classification)
                )
              }}</router-link
            >
            <span v-else>{{
              classificationLabel(
                classification,
                classificationValue(classification)
              )
            }}</span>
          </dd>
        </div>
      </dl>
    </section>
    <transition name="fade">
      <section v-if="street.projects && street.projects.length > 0">
        <h2 class="mb-3 text-2xl lg:text-3xl">Projects near this street</h2>
        <ul class>
          <li v-for="project in street.projects" :key="project.id">
            <router-link
              :to="`/projects/${project.id}`"
              class="flex flex-col my-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
            >
              <h3>{{ project.name }}</h3>
              <p class="my-2 text-sm">{{ project.description }}</p>
              <div class="flex flex-row flex-wrap -mx-2 text-sm text-gray-600">
                <span class="mx-2 flex flex-row items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-3 h-3 mr-1"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path
                      d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                    />
                  </svg>
                  <span>{{
                    project.estimatedCost?.toLocaleString() || 'N/A'
                  }}</span>
                </span>
                <span class="mx-2 flex flex-row items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-3 h-3 mr-1"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>

                  <span>{{ project.estimatedTimeframe }}</span>
                </span>
              </div>
            </router-link>
          </li>
        </ul>
      </section>
    </transition>
    <section v-if="plans && plans.length > 0">
      <h2 class="mb-3 text-2xl lg:text-3xl">Plans near this street</h2>
      <ul class>
        <li v-for="plan in plans" :key="plan.id">
          <router-link
            :to="`/${
              plan.type === 'master' ? 'master-street-plans' : 'area-plans'
            }/${plan.id}`"
            class="block my-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
          >
            <span
              class="px-2 py-1 mb-2 bg-fog-300 text-fog-900 text-sm rounded-md shadow inline-block"
              >{{
                plan.type === 'master' ? 'Master street' : 'Area'
              }}
              plan</span
            >
            <h3>{{ plan.name }}</h3>
            <p class="my-2 text-sm">{{ plan.description }}</p>
          </router-link>
        </li>
      </ul>
    </section>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import { useStreetStore, type Street } from '../store/streets';
import type { AreaPlan } from '../store/areaPlans';
import type { MasterStreetPlan } from '../store/masterStreetPlans';

const props = defineProps<{ street: Street }>();

const streets = useStreetStore();
const classificationLabel = streets.classificationLabel;

const plans = computed(() => {
  return [
    ...(props.street.masterStreetPlans || []).map((plan: MasterStreetPlan) => {
      const { name, id } = plan;
      return { id, name, type: 'master', description: plan.description };
    }),
    ...(props.street.areaPlans || []).map((plan: AreaPlan) => {
      const { name, id } = plan;
      return { id, name, type: 'area', description: plan.description };
    }),
  ].sort((a, b) => {
    const nameA = a.name?.toUpperCase();
    const nameB = b.name?.toUpperCase();

    if (!nameA || !nameB) return Number.MAX_SAFE_INTEGER;
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;

    return 0;
  });
});

function classificationKeys() {
  return props.street?.classifications
    ? Object.keys(props.street.classifications)
    : [];
}

function classificationValue(classification: string) {
  return props.street.classifications?.[classification] || '';
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
