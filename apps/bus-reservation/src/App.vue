<script setup lang="ts">
import {
  Anchor,
  Breadcrumbs,
  Box,
  Footer,
  Header,
  LoggedIn,
  Logo,
  Nav,
  SignIn,
} from '@pbotapps/components';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore, useStore } from './store';

const { getToken } = useAuthStore();
const { currentRoute } = useRouter();
const store = useStore();

const accessToken = ref<string>();
const menuOpen = ref(false);

const path = computed(() => currentRoute.value.path);

const dev = computed(() => import.meta.env.MODE != 'production');

onMounted(async () => {
  accessToken.value = await getToken();
  store.getRules();
});
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans">
    <Header color="white" :open="menuOpen" @toggle="menuOpen = !menuOpen">
      <template #branding>
        <router-link to="/" class="w-full flex items-center">
          <Logo class="w-16 md:w-20 mr-3 flex-shrink-0" />
          <span class="truncate text-xl">Bus Reservations</span>
        </router-link>
      </template>
    </Header>
    <section role="banner">
      <Box
        v-if="dev"
        color="orange"
        class="p-4 text-center text-xl font-semibold uppercase"
        >Development version</Box
      >
    </section>
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
