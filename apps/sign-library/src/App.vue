<script setup lang="ts">
import { ref } from 'vue';

import {
  Anchor,
  Footer,
  Header,
  LoggedIn,
  Logo,
  Nav,
  NavItem,
  SignIn,
  useLogin,
} from '@pbotapps/components';

import { useStore } from './store';

const menuOpen = ref(false);

const { accessToken } = useLogin();
const store = useStore();

store.getSigns();
store.refreshRules();
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
        <Nav class="mt-3 md:mt-0 md:ml-auto">
          <SignIn v-if="!accessToken" />
          <LoggedIn v-else />
        </Nav>
      </template>
    </Header>
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
