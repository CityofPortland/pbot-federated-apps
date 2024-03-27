<script setup lang="ts">
import {
  Button,
  Entry,
  Input,
  Select,
  Textarea,
  Toggle,
  query,
} from '@pbotapps/components';
import { computed, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';

import { useApplicationStore } from '../../store/application';
import { Application } from '../../models/application';
import { Rule } from '../../models/rule';
import { useAuthStore } from '../../store/auth';

const store = useApplicationStore();
const { getToken } = useAuthStore();
const router = useRouter();

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

const applications = computed(() => store.applications);

const handleSubmit = async () => {
  const token = await getToken();
  try {
    const res = await query<{ addRule: Rule }>({
      operation: `
          mutation addRule($applicationId: ID! $input: RuleInput!) {
            addRule(applicationId: $applicationId input:$input) {
              _id
            }
          }`,
      variables: {
        applicationId: application.value._id,
        input: {
          ...rule,
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.errors) {
      // display them somehow
    }

    const r = res.data?.addRule;

    if (r && r._id) {
      const to = {
        name: 'Application',
        params: { id: application.value._id },
      };
      // route to new application
      router.push(to);
    }
  } catch (err) {
    // display them?
    console.error(err);
  }
};
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
          :key="a._id"
          :selected="a._id == application._id"
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
