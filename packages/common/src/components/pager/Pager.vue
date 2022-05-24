<template>
  <Box
    as="nav"
    color="gray"
    variant="light"
    class="p-1 border border-gray-500 rounded-lg flex items-center justify-between text-sm"
  >
    <Button
      label="Go to previous item"
      rel="prev"
      size="small"
      color="gray"
      variant="light"
      :class="{
        invisible: value == 0,
      }"
      :disabled="value == 0"
      @click="handlePrev()"
    >
      <span class="sr-only">Previous item</span>
      <span class="flex items-center">
        <Icon type="solid" name="chevron-left" class="w-5 h-5" />
      </span>
    </Button>
    <div class="mx-2 inline-flex items-center">
      <Select
        id="pager-select"
        name="pager-select"
        class="mr-1 px-2 py-1 pr-6 text-sm"
        style="background-position: right 0.125rem center"
        :modelValue="value.toString()"
        @update:modelValue="handleSelect"
      >
        <option
          v-for="(item, index) in list"
          :key="index"
          :value="index"
          :selected="index == value"
        >
          {{ index + 1 }}
        </option>
      </Select>
      of {{ list.length }}
    </div>
    <Button
      label="Go to next item"
      rel="prev"
      size="small"
      color="gray"
      variant="light"
      :class="{
        invisible: list.length == value + 1,
      }"
      :disabled="list.length == value + 1"
      @click="handleNext()"
    >
      <span class="sr-only">Next item</span>
      <span class="flex items-center">
        <Icon type="solid" name="chevron-right" class="w-5 h-5" />
      </span>
    </Button>
  </Box>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Box from '@/elements/box/Box';
import Button from '@/elements/button/Button.vue';
import Icon from '@/elements/icon/Icon.vue';
import Select from '@/elements/inputs/Select.vue';

export default defineComponent({
  name: 'Pager',
  components: { Box, Button, Icon, Select },
  props: {
    value: {
      type: Number,
      default: 0,
    },
    list: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    return {
      handleNext() {
        emit('select', {
          index: props.value + 1,
          item: props.list[props.value + 1],
        });
      },
      handlePrev() {
        emit('select', {
          index: props.value - 1,
          item: props.list[props.value - 1],
        });
      },
      handleSelect(value: string) {
        const index = Number.parseInt(value);
        emit('select', { index, item: props.list[index] });
      },
    };
  },
});
</script>
