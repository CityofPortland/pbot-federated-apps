<script setup lang="ts">
import {
  Anchor,
  Button,
  Checkboxes,
  Entry,
  File,
  Input,
  Select,
  Textarea,
} from '@pbotapps/components';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useStore } from '../store';
import { COLORS, SHAPES, Sign, SignInput, STATUSES, TYPES } from '../types';

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

    return s ? s : d;
  }

  return d;
});

const colors = computed(() => {
  type T = {
    id: string;
    label: string;
    value: string;
    checked: boolean;
  };

  let result: Array<T> = COLORS.map(c => ({
    id: c,
    label: c,
    value: c,
    checked: sign.value.color?.some(s => s == c) ? true : false,
  }));

  if (sign.value.color) {
    result.push(
      ...sign.value.color.reduce((a, c) => {
        if (!result.find(x => x.id == c))
          a.push({ id: c, label: c, value: c, checked: true });
        return a;
      }, new Array<T>())
    );
  }

  return result;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const payload = {} as Record<keyof SignInput, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const change = (key: keyof SignInput, value: any) => {
  payload[key] = value;
};

type T = {
  redirect(sign: Partial<Sign>): string;
};

const save = ({ redirect }: T) => {
  if (formRef.value?.reportValidity()) {
    store
      .addRevision({ ...payload, code: sign.value.code })
      .then(sign => (sign ? router.push(redirect(sign)) : undefined))
      .catch(err => console.error(err));
  }
};
</script>

<template>
  <form
    ref="formRef"
    class="flex flex-col gap-4 max-w-prose"
    @submit.prevent="save({ redirect: (sign: Sign) => `/${sign.code}` })"
  >
    <Entry id="code" label="Code" required v-slot="{ id, required }">
      <Input
        :id="id"
        :name="id"
        :required="required"
        :disabled="code ? true : false"
        v-model="sign.code"
      />
    </Entry>
    <Entry id="image" label="Image" v-slot="{ id, required }">
      <dl v-if="sign.image" class="mb-4">
        <div v-if="sign.image?.full" class="flex gap-1">
          <dt>Full image:</dt>
          <dd>
            <Anchor :url="sign.image?.full" />
          </dd>
        </div>
        <div v-if="sign.image?.thumbnail" class="flex gap-1">
          <dt>Thumbnail image:</dt>
          <dd>
            <Anchor :url="sign.image?.thumbnail" />
          </dd>
        </div>
      </dl>
      <File
        :id="id"
        :name="id"
        :required="required"
        accept="image/*"
        @changed="change('image', $event)"
      />
    </Entry>
    <Entry id="design" label="Design file" v-slot="{ id, required }">
      <dl v-if="sign.image?.design" class="mb-4">
        <div v-if="sign.image?.design" class="flex gap-1">
          <dt>Design file:</dt>
          <dd>
            <Anchor :url="sign.image?.design" />
          </dd>
        </div>
      </dl>
      <File
        :id="id"
        :name="id"
        :required="required"
        accept=".eps"
        @changed="change('design', $event)"
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
          class="capitalize"
        >
          {{ status.replace('_', ' ') }}
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
          class="capitalize"
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
          @changed="change('mutcdCode', $event)"
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
          class="capitalize"
        >
          {{ shape }}
        </option>
      </Select>
    </Entry>
    <Checkboxes
      :options="colors"
      id="colors"
      label="Colors"
      v-model="sign.color"
      @changed="change('color', $event)"
    />
    <div>
      <Input
        id="otherColor"
        type="text"
        placeholder="Other"
        @changed="
          change('color', sign.color ? [...sign.color, $event] : [$event])
        "
      />
    </div>
    <Entry id="size" label="Size" required v-slot="{ required }">
      <Input
        id="width"
        name="width"
        :required="required"
        type="number"
        :min="1"
        v-model="sign.width"
        @changed="change('width', Number.parseInt($event))"
      />
      <span class="mx-2">inches wide and</span>
      <Input
        id="height"
        name="height"
        :required="required"
        type="number"
        :min="1"
        v-model="sign.height"
        @changed="change('height', Number.parseInt($event))"
      />
      <span class="ml-2">inches high</span>
    </Entry>
    <Entry id="legend" label="Legend" required v-slot="{ id, required }">
      <Textarea
        :id="id"
        :name="id"
        :required="required"
        rows="3"
        class="break-all whitespace-pre-wrap w-full"
        v-model="sign.legend"
        @changed="change('legend', $event)"
      />
    </Entry>
    <Entry id="comment" label="Comment" v-slot="{ id }">
      <Textarea
        :id="id"
        :name="id"
        rows="3"
        class="break-all whitespace-pre-wrap w-full"
        v-model="sign.comment"
        @changed="change('comment', $event)"
      />
    </Entry>
    <section class="flex gap-4">
      <Button label="Save" />
      <Button
        type="button"
        label="Save and add another"
        @click="save({ redirect: () => '/add' })"
      />
    </section>
  </form>
</template>
