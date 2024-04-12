<script setup lang="ts">
import {
  Anchor,
  Breadcrumbs,
  Footer,
  Header,
  LoggedIn,
  Logo,
  Nav,
  SignIn,
} from '@pbotapps/components';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from './store';

const { getToken } = useAuthStore();
const { currentRoute } = useRouter();

const accessToken = ref<string>();
const menuOpen = ref(false);

const path = computed(() => currentRoute.value.path);

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
          <span class="truncate text-xl">Bus Reservations</span>
        </router-link>
      </template>
      <template #menu>
        <div class="flex gap-2">
          <RouterLink to="/reservations" custom v-slot="{ href, navigate }">
            <Anchor :url="href" @click="navigate">Reservations</Anchor>
          </RouterLink>
          <RouterLink
            v-if="accessToken"
            to="/hotels"
            custom
            v-slot="{ href, navigate }"
          >
            <Anchor :url="href" @click="navigate">Hotels</Anchor>
          </RouterLink>
        </div>
        <Nav class="mt-3 md:mt-0 md:ml-auto">
          <SignIn v-if="!accessToken" />
          <LoggedIn v-else />
        </Nav>
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
