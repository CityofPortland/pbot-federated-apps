<template>
  <div class="min-h-screen flex flex-col">
    <Header color="white" :open="menuOpen" @toggle="menuOpen = !menuOpen">
      <template v-slot:branding>
        <router-link to="/" class="w-full flex items-center">
          <Logo class="w-16 md:w-20 mr-3 flex-shrink-0" />
          <span class="truncate text-xl">Parking Services</span>
        </router-link>
      </template>
    </Header>
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 mt-4">
      <router-view />
    </main>
    <Footer color="gray" variant="light">
      <template v-slot:middle>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Nav title="Application information">
            <nav-item
              url="https://pdx.maps.arcgis.com/apps/MapSeries/index.html?appid=ad171d005d4442bba3c640735d070aa3&entry=3"
              text="Area parking permit zones map"
            />
          </Nav>
          <Nav title="General information">
            <nav-item>
              <Anchor url="//portland.gov">City of Portland</Anchor>
            </nav-item>
            <nav-item>
              <Anchor url="//portland.gov/transportation"
                >Portland Bureau of Transportation</Anchor
              >
            </nav-item>
            <nav-item>
              <Anchor url="//portland.gov/transportation/parking"
                >PBOT Parking Enforcement and Operations</Anchor
              >
            </nav-item>
          </Nav>
          <Nav title="Legal notices">
            <nav-item>
              <router-link
                to="/disclaimer"
                class="border-b-2 border-current font-medium"
                >Disclaimer</router-link
              >
            </nav-item>
          </Nav>
        </div>
      </template>
    </Footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { Anchor } from '@pbotapps/common';
import Footer from '@/components/footer/Footer.vue';
import Header from '@/components/header/Header.vue';
import Logo from '@/assets/Logo.vue';
import Nav from '@/components/nav/Nav.vue';
import NavItem from '@/components/nav/NavItem.vue';

export default defineComponent({
  setup() {
    const menuOpen = ref(false);

    return { menuOpen };
  },
  components: {
    Anchor,
    Footer,
    Header,
    Logo,
    Nav,
    NavItem,
  },
});
</script>

<style>
.prose {
  max-width: 72ex;
}
</style>
