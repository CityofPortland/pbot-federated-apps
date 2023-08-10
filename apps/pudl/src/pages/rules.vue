<script setup lang="ts">
import { Anchor, Button } from '@pbotapps/components';
import { v4 as uuid } from 'uuid';
import { reactive, ref, toRefs } from 'vue';

import RuleForm from '../components/rules/form.vue';
import { Rule, useRuleStore } from '../store/rules';

const props = defineProps({
  rules: {
    type: Array<Rule>,
    required: true,
  },
  defaultRule: {
    type: Object as () => Rule,
    default: () => ({
      id: uuid(),
      inverted: false,
      action: 'read',
      subject: '',
      conditions: {},
      fields: {},
      users: [],
    }),
  },
});

const { add, delete: deleteRule, edit } = useRuleStore();

const { rules } = toRefs(props);

const showForm = reactive({
  new: false,
} as Record<string, boolean>);

props.rules.forEach((_, idx) => (showForm[idx.toString()] = false));

const newRule = ref({ ...props.defaultRule });
</script>

<template>
  <header class="flex items-start justify-between mb-4">
    <h2 class="text-2xl font-semibold mb-2">rules</h2>
    <Button
      color="gray"
      variant="light"
      size="small"
      label="add rule"
      @click="showForm['new'] = true"
    />
  </header>
  <aside
    v-show="showForm['new']"
    class="p-4 mb-4 border border-current rounded rounded-md"
  >
    <RuleForm
      :rule="newRule"
      class="mb-4"
      @changed="
        add($event);
        showForm['new'] = false;
      "
      @cancel="newRule = {...defaultRule}; showForm['new'] = false;"
    />
  </aside>
  <main>
    <header class="grid grid-cols-6 gap-2 mb-2">
      <span class="font-semibold">type</span>
      <span class="font-semibold">action</span>
      <span class="font-semibold">subject</span>
      <span class="font-semibold">conditions</span>
      <span class="font-semibold">fields</span>
      <span></span>
    </header>
    <main class="flex flex-col gap-12">
      <div v-for="(rule, idx) in rules" :key="rule.id">
        <div v-if="!showForm[idx]" class="grid grid-cols-6 items-start gap-2">
          <span>
            {{ rule.inverted ? 'cannot' : 'can' }}
          </span>
          <span>
            {{ rule.action }}
          </span>
          <span>
            {{ rule.subject }}
          </span>
          <code>
            {{ rule.conditions }}
          </code>
          <code>
            {{ rule.fields }}
          </code>
          <span class="flex gap-2">
            <Button
              size="small"
              color="gray"
              variant="light"
              label="edit"
              @click="showForm[idx] = true"
            />
            <Button size="small" color="red" variant="neutral" label="delete" @click="deleteRule(rule.id)" />
          </span>
        </div>
        <div v-if="!showForm[idx]">
          <main>
            <p v-if="!rule.users.length">No users</p>
            <ul v-else class="grid grid-cols-1 gap-1">
              <li v-for="user in rule.users" :key="user">
                <Anchor :url="`mailto:${user}`">{{ user }}</Anchor>
              </li>
            </ul>
          </main>
        </div>
        <div
          v-if="showForm[idx]"
          class="p-4 border border-current rounded rounded-md"
        >
          <RuleForm
            :rule="{ ...rule }"
            @changed="
              edit(idx, $event);
              showForm[idx] = false;
            "
            @cancel="showForm[idx] = false"
          />
        </div>
      </div>
    </main>
  </main>
</template>
