<template>
  <Box
    as="form"
    color="gray"
    variant="light"
    title="Search"
    class="flex flex-col border border-current shadow-md rounded-md"
    @submit.prevent="handleSubmit"
  >
    <section
      class="inline-flex flex-wrap items-center border-current"
      :class="{ 'border-b': open }"
    >
      <Button
        type="button"
        color="transparent"
        label="Search settings"
        id="menu-button"
        tabindex="0"
        class="flex rounded-l-md focus:ring-2 focus:ring-blue-500"
        :class="{ 'rounded-bl-none': open }"
        @click="open = !open"
      >
        <Icon type="solid" name="adjustment" class="w-6 h-6" />
      </Button>
      <label for="query" class="sr-only">Address</label>
      <input
        id="query"
        name="query"
        type="text"
        role="searchbox"
        :placeholder="placeholder"
        tabindex="0"
        required="required"
        v-model="query"
        class="flex-1 min-w-0 appearance-none bg-transparent border-transparent placeholder-gray-600"
      />
      <Button
        type="submit"
        color="transparent"
        label="Search"
        tabindex="0"
        class="flex rounded-r-md focus:ring-2 focus:ring-blue-500"
        :class="{ 'rounded-br-none': open }"
      >
        <Icon type="solid" name="search" class="w-6 h-6" />
      </Button>
    </section>
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <section v-show="open" class="p-2" @keydown.tab="handleTab">
        <div class="w-full px-2 py-1 inline-flex items-center space-x-3">
          <input
            type="radio"
            id="address"
            name="searchType"
            tabindex="0"
            value="address"
            v-model="type"
          />
          <label for="address">Address or intersection</label>
        </div>
        <div class="w-full px-2 py-1 inline-flex items-center space-x-3">
          <input
            type="radio"
            id="taxlot"
            name="searchType"
            tabindex="0"
            value="taxlot"
            v-model="type"
          />
          <label for="taxlot">Tax lot number</label>
        </div>
      </section>
    </transition>
  </Box>
</template>
<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';

import Box from '@/elements/box/Box';
import Button from '@/elements/button/Button.vue';
import Icon from '@/elements/icon/Icon.vue';

export default defineComponent({
  name: 'AddressSuggest',
  components: {
    Box,
    Button,
    Icon,
  },
  props: {
    candidates: Array,
  },
  setup(_, { emit }) {
    const query = ref('');
    const type = ref('address');
    const open = ref(false);
    const settingsRef: Ref<HTMLElement | null> = ref(null);

    return {
      query,
      type,
      open,
      settingsRef,
      placeholder: computed(() => {
        switch (type.value) {
          case 'address':
            return 'Search addresses...';
          case 'taxlot':
            return 'Search tax lots...';
          default:
            throw new Error(`Unrecognized search type: ${type.value}`);
        }
      }),
      handleSubmit() {
        open.value = false;
        emit('search', { query: query.value, type: type.value });
      },
    };
  },
});
</script>
