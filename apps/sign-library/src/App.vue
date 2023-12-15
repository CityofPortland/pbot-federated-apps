<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import {
  Box,
  Footer,
  Header,
  LoggedIn,
  Logo,
  Nav,
  SignIn,
  useLogin,
} from '@pbotapps/components';

import { useStore } from './store';

const menuOpen = ref(false);

const { getToken } = useLogin();
const store = useStore();

const accessToken = ref<string>();

store.getSigns();
store.refreshRules();

onMounted(async () => {
  accessToken.value = await getToken();
});

watch(accessToken, () => store.refreshRules());

const dev = computed(() => import.meta.env.MODE != 'production');
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans">
    <Header color="white" :open="menuOpen" @toggle="menuOpen = !menuOpen">
      <template #branding>
        <router-link to="/" class="w-full flex items-center">
          <Logo class="w-16 md:w-20 mr-3 flex-shrink-0" />
          <span class="truncate text-xl">Sign Library</span>
        </router-link>
      </template>
      <template #menu>
        <span class="mt-3 md:mt-0 md:ml-auto">
          <SignIn v-if="!accessToken" />
          <LoggedIn v-else />
        </span>
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
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 my-4">
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
