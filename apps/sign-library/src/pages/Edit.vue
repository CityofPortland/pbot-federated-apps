<script setup lang="ts">
import { Button, Entry, Input, Select, Textarea } from '@pbotapps/components';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useStore } from '../store';
import { COLORS, SHAPES, Sign, STATUSES } from '../types';

const router = useRouter();
const store = useStore();

const props = defineProps({
  code: String,
});

const sign = computed(() =>
  props.code
    ? store.sign(props.code)
    : ({
        _changed: new Date(),
        _created: new Date(),
        status: 'in use',
      } as Partial<Sign>)
);

type T = {
  redirect(sign: Sign): string;
};

const save = ({ redirect }: T) => {
  store
    .indexSign(sign.value, props.code ? true : false)
    .then(sign => router.push(redirect(sign)))
    .catch(err => console.error(err));
};
</script>

<template>
  <form class="flex flex-col gap-4">
    <Entry id="code" label="Code" required v-slot="{ id, required }">
      <Input :id="id" :name="id" :required="required" v-model="sign.code" />
    </Entry>
    <Entry id="status" label="Status" required v-slot="{ id, required }">
      <Select
        :id="id"
        :name="id"
        :required="required"
        v-model="sign.status"
        class="px-3 py-2"
      >
        <option
          v-for="status in STATUSES"
          :key="status"
          :value="status"
          :selected="status == sign.status"
        >
          {{ status }}
        </option>
      </Select>
    </Entry>
    <Entry id="shape" label="Shape" required v-slot="{ id, required }">
      <Select
        :id="id"
        :name="id"
        :required="required"
        v-model="sign.shape"
        class="px-3 py-2"
      >
        <option v-for="shape in SHAPES" :key="shape" :value="shape">
          {{ shape }}
        </option>
      </Select>
    </Entry>
    <Entry id="color" label="Color" required v-slot="{ id, required }">
      <Select
        :id="id"
        :name="id"
        :required="required"
        multiple
        v-model="sign.color"
        class="px-3 py-2"
      >
        <option v-for="color in COLORS" :key="color" :value="color">
          {{ color }}
        </option>
      </Select>
    </Entry>
    <Entry id="size" label="Size" required v-slot="{ id, required }">
      <Input
        :id="`${id}-width`"
        :name="`${id}-width`"
        :required="required"
        type="number"
        v-model="sign.width"
      />
      <span class="mx-1">inches by</span>
      <Input
        :id="`${id}-height`"
        :name="`${id}-height`"
        :required="required"
        type="number"
        v-model="sign.height"
      />
      <span class="ml-1">inches</span>
    </Entry>
    <Entry id="legend" label="Legend" required v-slot="{ id, required }">
      <Input :id="id" :name="id" :required="required" v-model="sign.legend" />
    </Entry>
    <Entry id="description" label="Comment" v-slot="{ id }">
      <Textarea :id="id" :name="id" v-model="sign.description" />
    </Entry>
    <section class="flex gap-4">
      <Button
        type="button"
        label="Save"
        @click="save({ redirect: (sign: Sign) => `/${sign.code}` })"
      />
      <Button
        type="button"
        label="Save and add another"
        @click="save({ redirect: () => '/add' })"
      />
    </section>
  </form>
</template>
