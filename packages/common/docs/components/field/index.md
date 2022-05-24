<script setup>
    import { ref } from 'vue';

    import Entry from '@/components/field/Entry.vue';
    import Input from '@/elements/input/Input.vue';
    import Toggle from '@/elements/input/Toggle.vue';

    const fieldId = ref('field');
    const fieldRequired = ref(false);
    const fieldDisabled = ref(false);
    const value = ref('');
</script>

# Fields

Fields deal with data either during entry or display. We provide components for both modes.

    Some code

<div class="grid grid-cols-1 gap-2 mb-6">
    <Entry id="id" label="ID" inline v-slot="{ id, required }">
        <Input
            :id="id"
            :name="id"
            class="w-full"
            :modelValue="fieldId"
            @update:modelValue="fieldId = $event" />
    </Entry>
<Entry id="required" label="Required" inline v-slot="{ id, required }">
    <Toggle
        :id="id"
        :name="id"
        :modelValue="fieldRequired"
        @update:modelValue="fieldRequired = $event" />
</Entry>
<Entry id="disabled" label="Disabled" inline v-slot="{ id, required }">
    <Toggle
        :id="id"
        :name="id"
        :modelValue="fieldDisabled"
        @update:modelValue="fieldDisabled = $event" />
</Entry>
</div>

<Entry :id="fieldId" name="field" label="Demo field" :required="fieldRequired && value === ''" :disabled="fieldDisabled" v-slot="{ id, required, disabled }">
  <Input
    :id="id"
    :name="id"
    :required="required"
    :disabled="disabled"
    class="w-full"
    :modelValue="value"
    @update:modelValue="value = $event" />
</Entry>
