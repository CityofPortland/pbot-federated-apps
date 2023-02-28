<script setup lang="ts">
import { FieldList, Field } from '@pbotapps/components';
import { Rule } from '../../models/rule';

defineProps({
  rule: {
    type: Object as () => Rule,
    required: true,
  },
});
</script>

<template>
  <FieldList class="grid grid-cols-5 gap-4">
    <Field name="Inverted" display="hidden">
      {{ rule.inverted ? 'cannot' : 'can' }}
    </Field>
    <Field name="Action" display="hidden">
      {{ rule.action }}
    </Field>
    <Field name="Subject" display="hidden">
      {{ rule.subject }}
    </Field>
    <Field name="Conditions" display="hidden">
      {{ JSON.stringify(rule.conditions) }}
    </Field>
    <Field name="Fields" display="hidden">
      {{ JSON.stringify(rule.fields) }}
    </Field>
  </FieldList>
</template>
