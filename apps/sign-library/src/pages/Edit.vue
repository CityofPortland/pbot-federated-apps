<script setup lang="ts">
import {
  Anchor,
  Button,
  Entry,
  Input,
  Select,
  Textarea,
} from '@pbotapps/components';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useStore } from '../store';
import { COLORS, SHAPES, Sign, STATUSES, TYPES } from '../types';

const router = useRouter();
const store = useStore();

const props = defineProps({
  code: String,
});

const formRef = ref<HTMLFormElement>();

const sign = computed(() => {
  const d = {
    _changed: new Date(),
    _created: new Date(),
  } as Partial<Sign>;

  if (props.code) {
    const s = store.sign(props.code);

    return reactive(s ? s : d);
  }

  return reactive(d);
});

const revision = {} as Partial<Record<keyof Sign, any>>;

const change = (key: keyof Sign, value: any) => {
  revision[key] = value;
};

type T = {
  redirect(sign: Partial<Sign>): string;
};

const save = ({ redirect }: T) => {
  if (formRef.value?.reportValidity()) {
    store
      .addRevision({ ...revision, code: sign.value.code })
      .then(sign => router.push(redirect(sign)))
      .catch(err => console.error(err));
  }
};
</script>

<template>
  <form ref="formRef" class="flex flex-col gap-4">
    <Entry id="code" label="Code" required v-slot="{ id, required }">
      <Input
        :id="id"
        :name="id"
        :required="required"
        :disabled="code ? true : false"
        v-model="sign.code"
      />
    </Entry>
    <Entry id="status" label="Status" required v-slot="{ id, required }">
      <Select
        :id="id"
        :name="id"
        :required="required"
        placeholder="Select one"
        v-model="sign.status"
        @changed="change('status', $event)"
        class="px-2 py-1"
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
    <Entry id="type" label="Type" required v-slot="{ id, required }">
      <Select
        :id="id"
        :name="id"
        :required="required"
        placeholder="Select one"
        v-model="sign.type"
        @changed="change('type', $event)"
        class="px-2 py-1"
      >
        <option
          v-for="type in TYPES"
          :key="type"
          :value="type"
          :selected="type == sign.type"
        >
          {{ type }}
        </option>
      </Select>
    </Entry>
    <Entry id="mutcdCode" label="MUTCD code">
      <template v-slot:label="{ id, label }">
        <label :id="`${id}-label`" class="font-semibold">
          <Anchor url="https://mutcd.fhwa.dot.gov/">{{ label }}</Anchor>
        </label>
      </template>
      <template v-slot="{ id, required }">
        <Input
          :id="id"
          :name="id"
          :required="required"
          v-model="sign.mutcdCode"
        />
      </template>
    </Entry>
    <Entry id="shape" label="Shape" required v-slot="{ id, required }">
      <Select
        :id="id"
        :name="id"
        :required="required"
        placeholder="Select one"
        v-model="sign.shape"
        @changed="change('shape', $event)"
        class="px-2 py-1"
      >
        <option
          v-for="shape in SHAPES"
          :key="shape"
          :value="shape"
          :selected="shape == sign.shape"
        >
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
        @changed="change('color', $event)"
        class="px-2 py-1"
      >
        <option
          v-for="color in COLORS"
          :key="color"
          :value="color"
          :selected="sign.color?.some(s => s == color)"
        >
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
        :min="1"
        v-model="sign.width"
        @changed="change('width', $event)"
      />
      <span class="mx-2">inches wide and</span>
      <Input
        :id="`${id}-height`"
        :name="`${id}-height`"
        :required="required"
        type="number"
        :min="1"
        v-model="sign.height"
        @changed="change('height', $event)"
      />
      <span class="ml-2">inches high</span>
    </Entry>
    <Entry id="legend" label="Legend" required v-slot="{ id, required }">
      <Input
        :id="id"
        :name="id"
        :required="required"
        v-model="sign.legend"
        @changed="change('legend', $event)"
      />
    </Entry>
    <Entry id="description" label="Comment" v-slot="{ id }">
      <Textarea
        :id="id"
        :name="id"
        v-model="sign.description"
        @changed="change('description', $event)"
      />
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
