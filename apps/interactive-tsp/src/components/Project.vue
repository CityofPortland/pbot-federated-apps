<template>
  <article>
    <h1 class="mb-3 text-3xl lg:text-4xl">{{ project.name }}</h1>
    <p class="my-3 text-xl text-gray-700">{{ project.description }}</p>
    <dl>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
        <dt class="text-gray-700">Project number</dt>
        <dd>{{ project.number }}</dd>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
        <dt class="text-gray-700">Transportation plan ID</dt>
        <dd>{{ project.id }}</dd>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
        <dt class="text-gray-700">Location</dt>
        <dd>{{ project.location }}</dd>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
        <dt class="text-gray-700">Lead agency</dt>
        <dd>{{ project.agency }}</dd>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
        <dt class="text-gray-700">Estimated cost</dt>
        <dd>
          {{
            project.estimatedCost
              ? project.estimatedCost.toLocaleString()
              : 'N/A'
          }}
        </dd>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
        <dt class="text-gray-700">Estimated time frame</dt>
        <dd>{{ project.estimatedTimeframe }}</dd>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
        <dt class="text-gray-700">Project district</dt>
        <dd>{{ project.district }}</dd>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
        <dt class="text-gray-700">Facility owner</dt>
        <dd>{{ project.facilityOwner }}</dd>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
        <dt class="text-gray-700">Pattern area</dt>
        <dd>{{ project.patternArea }}</dd>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
        <dt class="text-gray-700">Funding category</dt>
        <dd>{{ project.fundingCategory }}</dd>
      </div>
    </dl>
  </article>
</template>

<script setup lang="ts">
import type { Project } from '../store/projects';

defineProps<{ project: Project }>();
</script>
