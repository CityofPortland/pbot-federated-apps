<script setup lang="ts">
import { ref, onMounted } from 'vue';

import {
  Anchor,
  Footer,
  Header,
  LoggedIn,
  Logo,
  Nav,
  SignIn,
} from '@pbotapps/components';
import { useAuthStore } from './store/auth';

const menuOpen = ref(false);
const accessToken = ref<string>();

const { getToken } = useAuthStore();

onMounted(async () => {
  accessToken.value = await getToken();
});
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans">
    <Header color="white" :open="menuOpen" @toggle="menuOpen = !menuOpen">
      <template #branding>
        <router-link to="/" class="w-full flex items-center">
          <Logo class="w-16 md:w-20 mr-3 flex-shrink-0" />
          <span class="truncate text-xl">App Management</span>
        </router-link>
      </template>
      <template #menu>
        <router-link to="/application" custom v-slot="{ href, navigate }">
          <Anchor :url="href" @click="navigate">Applications</Anchor>
        </router-link>
        <Nav class="mt-3 md:mt-0 md:ml-auto">
          <SignIn v-if="!accessToken" />
          <LoggedIn v-else />
        </Nav>
      </template>
    </Header>
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 mt-4">
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
