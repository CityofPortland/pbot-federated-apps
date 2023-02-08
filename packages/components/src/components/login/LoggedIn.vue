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
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useLogin } from '../../composables/use-login';
import Box from '../../elements/box/Box';
import Button from '../../elements/button/Button.vue';
import Dropdown from '../dropdown/Dropdown.vue';
import DropdownItem from '../dropdown/DropdownItem.vue';
import DropdownList from '../dropdown/DropdownList.vue';
import Spinner from '../../elements/icon/Spinner.vue';
import axios from 'axios';

export default defineComponent({
  components: {
    Box,
    Button,
    Dropdown,
    DropdownItem,
    DropdownList,
    Spinner,
  },
  setup() {
    const user = ref(undefined);
    const { getToken } = useLogin();
    const { resolve } = useRouter();

    onMounted(async () => {
      const token = await getToken(
        ['User.Read'],
        resolve({ name: 'OAuthCallback' }).href
      );

      const res = await axios.get('https://graph.microsoft.com/v1.0/me/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        firstName: res.data.givenName,
        lastName: res.data.surname,
        email: res.data.mail,
        photo: URL.createObjectURL(photoRes.data),
      };
    });

    return {
      user,
      photo: computed(() =>
        user.value && user.value.photo
          ? URL.createObjectURL(user.value.photo)
          : undefined
      ),
      initials: computed(
        () =>
          (user.value?.firstName?.slice(0, 1) || '') +
          (user.value?.lastName?.slice(0, 1) || '')
      ),
    };
  },
});
</script>
