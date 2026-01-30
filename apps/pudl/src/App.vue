<script setup lang="ts">
import {
  Anchor,
  Breadcrumbs,
  Footer,
  Header,
  Logo,
} from '@pbotapps/components';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const menuOpen = ref(false);
const { currentRoute } = useRouter();

const path = computed(() => currentRoute.value.path);
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans">
    <Header color="white" :open="menuOpen" @toggle="menuOpen = !menuOpen">
      <template #branding>
        <router-link to="/" class="w-full flex items-center">
          <Logo class="w-16 md:w-20 mr-3 flex-shrink-0" />
          <span class="truncate text-xl">pudl</span>
        </router-link>
      </template>
      <template #menu>
        <router-link to="/zones" custom v-slot="{ href, navigate }">
          <Anchor :url="href" @click="navigate">zones</Anchor>
        </router-link>
      </template>
    </Header>
    <main class="flex-grow">
      <Breadcrumbs v-if="path != '/'" :path="path" class="mb-4 px-4" />
      <router-view />
    </main>
    <Footer color="gray" variant="light" />
  </div>
</template>

<style>
.prose {
  max-width: 72ex;
}
</style>
