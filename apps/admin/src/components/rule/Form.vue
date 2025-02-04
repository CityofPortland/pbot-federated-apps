<script setup lang="ts">
import {
  Button,
  Entry,
  Input,
  Select,
  Textarea,
  Toggle,
} from '@pbotapps/components';
import { computed, onMounted, reactive, toRefs } from 'vue';

import { useApplicationStore } from '../../store/application';
import { Application } from '../../models/application';
import { Rule } from '../../models/rule';
import { useRuleStore } from '../../store/rule';

const appStore = useApplicationStore();
const ruleStore = useRuleStore();

const props = defineProps({
  application: {
    type: Object as () => Application,
    default: () => ({}),
  },
  rule: {
    type: Object as () => Rule,
    default: () => ({
      inverted: false,
    }),
  },
});

const { application } = toRefs(props);
const rule = reactive(props.rule);

const applications = computed(() => appStore.applications);

const handleSubmit = async () => {
  await ruleStore.add(rule, application.value);
};

onMounted(() => {
  appStore.getApplications();
});
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <Entry
      id="application"
      label="Application"
      required
      v-slot="{ id, required }"
    >
      <Select :id="id" :name="id" :required="required">
        <option
          v-for="a in applications"
          :key="a.id"
          :selected="a.id == application.id"
        >
          {{ a.name }}
        </option>
      </Select>
    </Entry>
    <Toggle
      id="inverted"
      label="Inverted"
      v-model="rule.inverted"
      true-value="cannot"
      false-value="can"
    />
    <Entry id="action" label="Action" required v-slot="{ id, required }">
      <Input :id="id" :required="required" v-model="rule.action" />
    </Entry>
    <Entry id="subject" label="Subject" required v-slot="{ id, required }">
      <Input :id="id" :required="required" v-model="rule.subject" />
    </Entry>
    <Entry id="conditions" label="Conditions" v-slot="{ id, required }">
      <Textarea
        :id="id"
        :required="required"
        :modelValue="rule.conditions"
        @changed="rule.conditions = JSON.parse($event)"
      />
    </Entry>
    <Entry id="fields" label="Fields" v-slot="{ id, required }">
      <Textarea :id="id" :required="required" v-model="rule.fields" />
    </Entry>
    <section class="flex gap-2">
      <Button label="Save" size="small" />
      <Button
        type="button"
        label="Cancel"
        size="small"
        @click="$emit('cancel')"
      />
    </section>
  </form>
</template>
