<script setup lang="ts">
import { Button, Checkbox, Entry, Input, Textarea } from '@pbotapps/components';
import { ref } from 'vue';
import { Rule } from '../../store/rules';

const props = defineProps({
  rule: {
    type: Object as () => Rule,
    default: () => ({
      inverted: false,
      action: '',
      subject: '',
      conditions: {},
      users: [],
    }),
  },
});

const rule = ref(props.rule);
</script>
<template>
  <form @submit.prevent class="grid grid-cols-4 gap-2">
    <Entry id="inverted" label="Inverted" v-slot="{ id, required }">
      <Checkbox
        :id="id"
        :required="required"
        :checked="rule.inverted"
        @changed="rule.inverted = !rule.inverted"
      >
        {{ rule.inverted ? 'cannot' : 'can' }}
      </Checkbox>
    </Entry>
    <Entry id="action" label="Action" v-slot="{ id, required }">
      <Input
        :id="id"
        :required="required"
        v-model="rule.action"
        class="w-full"
      />
    </Entry>
    <Entry id="subject" label="Subject" v-slot="{ id, required }">
      <Input
        :id="id"
        :required="required"
        v-model="rule.subject"
        class="w-full"
      />
    </Entry>
    <Entry id="conditions" label="Conditions" v-slot="{ id, required }">
      <Textarea
        :id="id"
        :required="required"
        :modelValue="JSON.stringify(rule.conditions, null, 2)"
        @changed="rule.conditions = JSON.parse($event)"
        class="w-full whitespace-pre-wrap"
        rows="4"
      />
    </Entry>
    <Entry
      id="users"
      label="Users"
      v-slot="{ id, required }"
      class="col-span-5"
    >
      <p>
        Enter one user email per line. E-mails must be exactly as they appear
        from Active Directory or Office.
      </p>
      <Textarea
        :id="id"
        :required="required"
        :modelValue="rule.users.join('\n')"
        @changed="rule.users = $event.split('\n').map((x: string) => x.trim())"
        class="w-full whitespace-pre-line"
        rows="4"
      />
    </Entry>
    <section class="col-span-4 justify-self-end flex gap-2">
      <Button
        label="Save"
        color="green"
        size="small"
        @click="$emit('changed', rule)"
      />
      <Button
        label="Cancel"
        color="gray"
        variant="light"
        size="small"
        @click="$emit('cancel')"
      />
    </section>
  </form>
</template>
