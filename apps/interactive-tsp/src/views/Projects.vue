<template>
  <main class="flex flex-col-reverse sm:flex-row lg:flex-row">
    <h1 class="sr-only">Project listings</h1>
    <section
      class="w-full lg:w-1/3 xl:w-1/4 h-full overflow-y-auto border-black lg:border-r"
    >
      <section class="m-2">
        <div v-if="!route.params.id">
          <label for="searchInput" class="sr-only">Search projects</label>
          <div class="relative mt-1">
            <Icon
              type="solid"
              name="search"
              class="absolute left-2 top-2 w-5 h-5"
            />
            <input
              id="searchInput"
              type="search"
              placeholder="Search projects..."
              class="appearance-none placeholder-gray-600 w-full px-3 pl-8 py-2 bg-gray-100 border border-gray-500 rounded shadow"
              :value="searchText"
              @input="searchText = ($event.target as HTMLInputElement).value"
            />
          </div>
          <section
            class="my-2 border border-gray-500 rounded shadow bg-gray-100 text-gray-900"
          >
            <button
              class="p-2 w-full flex items-center justify-between"
              @click="showFilters = !showFilters"
            >
              <span class="flex items-center"
                ><Icon type="solid" name="cog" class="w-5 h-5" /><span
                  class="px-2"
                  >Settings</span
                ></span
              >
              <Icon
                type="solid"
                :name="showFilters ? 'chevron-up' : 'chevron-down'"
                class="w-5 h-5"
              />
            </button>
            <div v-show="showFilters" class="p-2">
              <h2 class="my-2 text-lg">Project settings</h2>
              <label
                v-for="model in projectStore.models"
                :key="model.key"
                class="flex items-center my-1"
              >
                <input
                  type="checkbox"
                  :checked="model.enabled"
                  @change="
                    toggleTimeFrameFilter(
                      model,
                      ($event.target as HTMLInputElement).checked
                    )
                  "
                />
                <span
                  class="h-4 w-4 mx-2 border border-gray-900"
                  :style="{ backgroundColor: model.color.formatRgb() }"
                ></span>
                <span>{{ model.label }}</span>
              </label>
              <label class="flex items-center my-2">
                <input type="checkbox" v-model="filterExtent" />
                <span class="px-2">Filter projects by map extent</span>
              </label>
              <button
                class="px-2 py-1 border border-blue-900 rounded bg-blue-500 text-blue-100"
                @click="map.resetExtent"
              >
                <Icon
                  type="solid"
                  name="external-link"
                  class="w-5 h-5 inline"
                />
                Reset map extent
              </button>
            </div>
          </section>
          <ul class="list-none">
            <li
              v-for="project in filteredProjects"
              :key="project.id"
              class="my-2"
            >
              <router-link
                :to="{ name: 'projects', params: { id: project.id } }"
                class="flex flex-col px-2 py-3 shadow border rounded bg-white hover:bg-blue-100"
                @mouseover="
                  projectStore.highlightProject({
                    project: project as Project,
                    move: false,
                  })
                "
                @focus="
                  projectStore.highlightProject({
                    project: project as Project,
                    move: false,
                  })
                "
              >
                <h3>{{ project.name }}</h3>
                <p class="my-2 text-sm">{{ project.description }}</p>
                <span class="text-xs text-gray-600">{{
                  project.estimatedTimeframe
                }}</span>
              </router-link>
            </li>
          </ul>
        </div>
        <div v-else>
          <router-link to="/projects" class="border-current border-b-2"
            >Back to results</router-link
          >
          <Pager
            v-if="selectedProjects.length > 1"
            class="my-3"
            :value="selectionIndex"
            :list="selectedProjects"
            @select="selectionIndex = $event.index"
          />
          <ProjectComponent
            v-if="selectedProjects[selectionIndex]"
            class="my-3"
            :project="selectedProjects[selectionIndex]"
          />
        </div>
      </section>
    </section>
    <section class="w-full lg:w-2/3 xl:w-3/4 h-screen overflow-y-auto">
      <AppMap :layers="projectStore.mapLayers" @click="handleClick" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@pbotapps/components';

import AppMap from '../components/Map.vue';
import Pager from '../components/Pager.vue';
import ProjectComponent from '../components/Project.vue';
import { useMapStore } from '../store/map';
import {
  useProjectStore,
  type Project,
  type ProjectViewModel,
} from '../store/projects';

const route = useRoute();
const router = useRouter();
const map = useMapStore();
const projectStore = useProjectStore();
const searchText = ref('');
const showFilters = ref(true);
const filterExtent = ref(false);
const selectionIndex = ref(0);

const selectedProjects = computed(() =>
  projectStore.list.filter(project => project.id == route.params.id)
);
const filteredProjects = computed(() => {
  let projects = searchText.value
    ? projectStore.filteredProjects(searchText.value)
    : projectStore.list;
  const enabled = new Set(
    projectStore.models.filter(model => model.enabled).map(model => model.value)
  );
  projects = projects.filter(
    project =>
      project.estimatedTimeframe && enabled.has(project.estimatedTimeframe)
  );
  return projects;
});

function toggleTimeFrameFilter(model: any, enabled: boolean) {
  model.enabled = enabled;
  map.setLayerVisibility({ layerId: model.key, visible: enabled });
}

function handleClick(event: __esri.ViewClickEvent) {
  map.view?.hitTest(event).then(response => {
    const id = response.results
      .map(
        result => (result as __esri.GraphicHit).graphic?.attributes?.TranPlanID
      )
      .find(value => value);
    if (id) router.push({ name: 'projects', params: { id } });
  });
}

watch(
  () => route.params.id,
  async id => {
    await projectStore.loadModels();
    if (projectStore.list.length === 0) await projectStore.findProjects();
    if (id)
      await projectStore.highlightProject({
        project: { id } as Project,
        move: true,
      });
    projectStore.models.forEach(model =>
      map.setLayerVisibility({ layerId: model.key, visible: model.enabled })
    );
  },
  { immediate: true }
);
</script>
