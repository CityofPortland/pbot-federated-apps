<script setup lang="ts">
import { ref } from 'vue';

import {
  Anchor,
  Footer,
  Header,
  Logo,
  Nav,
  NavItem,
} from '@pbotapps/components';

const menuOpen = ref(false);
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans">
    <Header color="white" :open="menuOpen" @toggle="menuOpen = !menuOpen">
      <template #branding>
        <router-link to="/" class="w-full flex items-center">
          <Logo class="w-16 md:w-20 mr-3 flex-shrink-0" />
        </router-link>
      </template>
      <template #menu>
        <router-link to="/" class="ml-4">
          <span class="truncate text-xl">Users</span>
        </router-link>
        <router-link to="/activecomputers" class="ml-4">
          <span class="truncate text-xl">Computers</span>
        </router-link>
        <router-link to="/schedule" class="ml-4">
          <span class="truncate text-xl">Schedule</span>
        </router-link>

        <!--<Nav class="mt-3 md:mt-0 md:ml-auto">
          <SignIn v-if="!accessToken" />
          <LoggedIn v-else />
        </Nav>-->
      </template>
    </Header>
    <main class="flex-grow max-w-full mx-auto px-4 mt-4">
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
