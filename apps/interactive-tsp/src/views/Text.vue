<template>
  <main class="container mx-auto flex flex-col md:flex-row justify-between">
    <aside class="md:w-1/3 px-2">
      <nav class="md:sticky top-16 md:overflow-y-auto text-sm md:text-base">
        <ol class="p-2 list-none">
          <TextListing
            v-for="section in textStore.sectionTree || []"
            :key="section.id"
            :id="section.id"
            :name="section.name"
            :depth="section.depth"
            :max-depth="1"
            :sections="section.sections"
          />
        </ol>
      </nav>
    </aside>
    <section class="my-4 flex flex-col md:w-2/3 px-2">
      <header>
        <form
          title="Search"
          role="search"
          class="flex flex-col"
          @submit.prevent
        >
          <label for="searchInput" class="sr-only">Search the plan</label>
          <input
            id="searchInput"
            type="search"
            placeholder="Search the plan..."
            class="appearance-none placeholder-gray-600 w-full px-3 py-2 bg-gray-100 border border-gray-500 rounded shadow"
            v-model="searchQuery"
            @input="handleSearchChange"
          />
        </form>
        <div v-if="searchQuery" class="bg-white border rounded shadow-lg">
          <router-link
            v-for="candidate in textStore.candidates || []"
            :key="candidate.id"
            :to="{ hash: `#${candidate.id}` }"
            class="flex flex-col p-2 hover:bg-blue-100"
            @click="searchQuery = ''"
          >
            <div class="font-semibold">{{ candidate.name }}</div>
            <div v-html="candidate.content"></div>
          </router-link>
        </div>
      </header>
      <article id="tsp-text">
        <TextSection
          v-for="section in textStore.sectionTree || []"
          :key="section.id"
          :id="section.id"
          :content="section.content"
          :sections="section.sections"
        />
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import debounce from 'lodash-es/debounce';
import { useRoute } from 'vue-router';

import TextSection from '../components/text/Section.vue';
import TextListing from '../components/text/Listing.vue';
import { useTextStore } from '../store/text';

const route = useRoute();
const textStore = useTextStore();
const searchQuery = ref('');
const handleSearchChange = debounce(() => {
  if (searchQuery.value) textStore.searchIndex(searchQuery.value);
}, 500);

function scrollToHash() {
  if (!route.hash) return;
  const element = document.querySelector(route.hash);
  element?.scrollIntoView();
  if (window.scrollY) window.scroll(0, window.scrollY - 64);
}

watch(
  () => route.hash,
  () => setTimeout(scrollToHash, 500),
  { immediate: true }
);
textStore.findText();
</script>

<style>
#tsp-text h1 {
  @apply text-3xl my-6;
}
#tsp-text h2 {
  @apply text-2xl my-5;
}
#tsp-text h3 {
  @apply text-xl my-4;
}
#tsp-text h4 {
  @apply text-lg my-3;
}
#tsp-text h5 {
  @apply text-base my-2;
}
#tsp-text h6 {
  @apply text-sm my-1;
}
#tsp-text section {
  @apply my-4;
}
#tsp-text p {
  @apply my-2;
}
</style>
