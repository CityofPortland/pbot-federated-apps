<template>
  <Dropdown
    size="small"
    label="User information"
    id="menu-button"
    class="w-full md:w-auto justify-between"
  >
    <template v-slot:label="{ open }">
      <article class="inline-flex items-center space-x-2">
        <header>
          <img
            class="w-6 h-6 rounded-full"
            :src="photo"
            :alt="`Avatar image for logged in user`"
          />
        </header>
        <main class="inline-flex items-center space-x-2">
          <span>{{ user.givenName }}</span>
          <Icon
            type="solid"
            name="chevron-down"
            class="w-5 h-5 transition ease-in-out duration-100"
            :class="{ transform: open, 'rotate-180': open }"
          />
        </main>
      </article>
    </template>
    <template v-slot="{ open }">
      <DropdownList
        id="user-account"
        :open="open"
        color="white"
        class="md:origin-top-right md:absolute md:right-0 md:w-80 mt-1 rounded border border-current focus:outline-none grid grid-cols-1 gap-2"
      >
        <DropdownItem>
          <FieldList class="gap-1 text-sm">
            <Field display="above" name="E-Mail Address">{{ user.mail }}</Field>
          </FieldList>
        </DropdownItem>
        <DropdownItem>
          <RouterLink to="/logout">
            <Button label="Log out" size="small" color="gray" variant="light" />
          </RouterLink>
        </DropdownItem>
      </DropdownList>
    </template>
  </Dropdown>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import Button from '@/elements/button/Button.vue';
import Dropdown from '@/components/dropdown/Dropdown.vue';
import DropdownItem from '@/components/dropdown/DropdownItem.vue';
import DropdownList from '@/components/dropdown/DropdownList.vue';
import Field from '@/components/field/Field.vue';
import FieldList from '@/components/field/FieldList.vue';
import Icon from '@/elements/icon/Icon.vue';
import { useAuthStore } from '@/store/auth';

export default defineComponent({
  components: {
    Button,
    Dropdown,
    DropdownItem,
    DropdownList,
    Field,
    FieldList,
    Icon,
  },
  setup() {
    const store = useAuthStore();

    return {
      user: computed(() => store.user),
      photo: computed(() =>
        store.user && store.user.photo
          ? URL.createObjectURL(store.user.photo)
          : undefined
      ),
    };
  },
});
</script>
