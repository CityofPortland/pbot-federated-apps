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
import { computed, ref, toRef } from 'vue';
import { useRouter } from 'vue-router';

import { useStore } from '../store';
import { COLORS, SHAPES, Sign, SignInput, STATUSES, TYPES } from '../types';

const router = useRouter();
const store = useStore();

const props = defineProps({
  code: String,
});

const formRef = ref<HTMLFormElement>();

const code = toRef(props.code);

const sign = computed(() => {
  let s = {
    _changed: new Date(),
    _created: new Date(),
  } as Partial<Sign>;

  if (code.value) {
    s = store.sign(code.value) || s;
  }

  return s;
});

type Option = {
  id: string;
  label: string;
  value: string;
  checked: boolean;
};

const colors = computed(() => {
  let result: Array<Option> = COLORS.map(c => ({
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
      }, new Array<Option>())
    );
  }

  return result;
});

const types = computed(() => {
  let result: Array<Option> = TYPES.map(c => ({
    id: c,
    label: c,
    value: c,
    checked: sign.value.type?.some(s => s == c) ? true : false,
  }));

  if (sign.value.type) {
    result.push(
      ...sign.value.type.reduce((a, c) => {
        if (!result.find(x => x.id == c))
          a.push({ id: c, label: c, value: c, checked: true });
        return a;
      }, new Array<Option>())
    );
  }

  return result;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const payload = ref({} as Record<keyof SignInput, any>);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const change = (key: keyof SignInput, value: any) => {
  payload.value[key] = value;
};

type T = {
  redirect(sign: Partial<Sign>): string;
};

const save = ({ redirect }: T) => {
  if (formRef.value?.reportValidity()) {
    store
      .addRevision({ ...payload.value, code: code.value })
      .then(sign => (sign ? router.push(redirect(sign)) : undefined))
      .catch(err => console.error(err));
  }
};
</script>

<template>
  <form
    ref="formRef"
    class="flex flex-col gap-4 max-w-prose"
    @submit.prevent="save({ redirect: () => `/${code}` })"
  >
    <Entry id="code" label="Code" required v-slot="{ id, required }">
      <Input
        :id="id"
        :name="id"
        :required="required"
        :disabled="props.code ? true : false"
        v-model.uppercase="code"
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
        >
          {{ status.replace('_', ' ') }}
        </option>
      </Select>
    </Entry>
    <Entry
      v-if="payload.status == 'obsolete'"
      id="obsoletePolicy"
      label="Obsoletion Policy"
      required
      v-slot="{ id, required }"
    >
      <Select
        :id="id"
        :name="id"
        :required="required"
        placeholder="Select one"
        v-model="sign.obsoletePolicy"
        @changed="change('obsoletePolicy', $event)"
        class="px-2 py-1"
      >
        <option value="remove" :selected="sign.obsoletePolicy == 'remove'">
          Remove Do Not Replace
        </option>
        <option
          value="replace_maintenance"
          :selected="sign.obsoletePolicy == 'replace_maintenance'"
        >
          Replace Upon Maintenance
        </option>
        <option
          value="replace_now"
          :selected="sign.obsoletePolicy == 'replace_now'"
        >
          Replace Now
        </option>
        <option
          value="code_only"
          :selected="sign.obsoletePolicy == 'code_only'"
        >
          Sign Code Only is Obsolete
        </option>
        <option
          value="replace_workorder"
          :selected="sign.obsoletePolicy == 'replace_workorder'"
        >
          Replace by Work Order
        </option>
      </Select>
    </Entry>
    <Entry
      v-if="
        payload.status == 'obsolete' &&
        ['replace_maintenance', 'replace_now', 'replace_workorder'].includes(
          payload.obsoletePolicy
        )
      "
      id="replacedBy"
      label="Replaced by"
      required
      v-slot="{ id, required }"
    >
      <Select
        :id="id"
        :name="id"
        :required="required"
        placeholder="Select one"
        v-model="sign.replacedBy"
        @changed="change('replacedBy', $event)"
        class="px-2 py-1"
      >
        <option
          v-for="replacement in store.data.signs.filter(s => s.code != code)"
          :key="replacement._id"
          :value="replacement._id"
          :selected="sign.replacedBy == replacement.code"
        >
          {{ replacement.code }}
        </option>
      </Select>
    </Entry>
    <Checkboxes
      :options="types"
      id="types"
      label="Types"
      v-model="sign.type"
      @changed="change('type', $event)"
    />
    <Entry id="mutcdCode" label="MUTCD code">
      <template v-slot:label="{ id, label }">
        <label :id="`${id}-label`" :for="id" class="font-semibold">
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
    <Entry id="odotCode" label="ODOT code">
      <template v-slot:label="{ id, label }">
        <label :id="`${id}-label`" :for="id" class="font-semibold">
          <Anchor
            url="https://www.oregon.gov/odot/Engineering/Documents_TrafficStandards/Sign-Policy-2022.pdf"
            >{{ label }}</Anchor
          >
        </label>
      </template>
      <template v-slot="{ id, required }">
        <Input
          :id="id"
          :name="id"
          :required="required"
          v-model="sign.odotCode"
          @changed="change('odotCode', $event)"
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
        aria-label="Width"
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
        aria-label="Height"
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
    <Entry id="source" label="Source" v-slot="{ id, required }">
      <Input :id="id" :name="id" :required="required" v-model="sign.source" />
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
