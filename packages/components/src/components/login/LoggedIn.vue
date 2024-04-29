<template>
  <Dropdown
    v-if="user"
    size="small"
    label="User information"
    id="menu-button"
    class="w-full md:w-auto justify-between"
  >
    <template v-slot:label>
      <article class="inline-flex items-center mr-1">
        <header>
          <img
            v-if="user.photo"
            :src="user.photo"
            alt="User avatar picture"
            class="rounded-full w-6 h-6"
          />
          <Box v-else class="px-0.5 py-1 rounded-full text-xs" color="gray">{{
            initials
          }}</Box>
        </header>
      </article>
    </template>
    <template v-slot="{ open }">
      <DropdownList
        id="user-account"
        :open="open"
        color="white"
        class="md:origin-top-right md:absolute md:right-0 md:w-80 mt-1 rounded border border-current focus:outline-none"
      >
        <slot :open="open"></slot>
        <DropdownItem>
          <RouterLink to="/logout">
            <Button label="Log out" color="gray" variant="light" size="small" />
          </RouterLink>
        </DropdownItem>
      </DropdownList>
    </template>
  </Dropdown>
  <Spinner v-else class="w-6 h-6" />
</template>

<script lang="ts">
import { useAuth } from '@pbotapps/authorization';
import axios from 'axios';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import Box from '../../elements/box/Box';
import Button from '../../elements/button/Button.vue';
import Dropdown from '../dropdown/Dropdown.vue';
import DropdownItem from '../dropdown/DropdownItem.vue';
import DropdownList from '../dropdown/DropdownList.vue';
import Spinner from '../../elements/icon/Spinner.vue';

export default defineComponent({
  components: {
    Box,
    Button,
    Dropdown,
    DropdownItem,
    DropdownList,
    Spinner,
  },
  inheritAttrs: false,
  setup() {
    const user = ref<any>(undefined);

    const { route, getToken } = useAuth({
      clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
      tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
    });
    const { currentRoute, resolve } = useRouter();

    onMounted(async () => {
      const token = await getToken([`User.Read`]);

      if (!token) {
        route.value = {
          path: currentRoute.value.path,
        };

        await getToken(
          ['User.Read'],
          'none',
          `${window.location.origin}${resolve({ name: 'OAuthCallback' }).href}`
        );
      }

      try {
        const res = await axios.get('https://graph.microsoft.com/v1.0/me/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        user.value = {
          firstName: res.data.givenName,
          lastName: res.data.surname,
          email: res.data.mail,
        };

        const photoRes = await axios.get(
          'https://graph.microsoft.com/v1.0/me/photos/48x48/$value',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
          }
        );

        user.value = {
          ...user.value,
          photo: URL.createObjectURL(photoRes.data),
        };
      } catch {
        return;
      }
    });

    return {
      user,
      initials: computed(
        () =>
          (user.value?.firstName?.slice(0, 1) || '') +
          (user.value?.lastName?.slice(0, 1) || '')
      ),
    };
  },
});
</script>
