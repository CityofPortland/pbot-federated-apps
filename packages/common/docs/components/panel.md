<script setup>
    import { ref } from 'vue';
    import Box from '@/elements/box/Box';
    import Entry from '@/components/field/Entry.vue';
    import Input from '@/elements/input/Input.vue';
    import Panel from '@/components/panel/Panel.vue'
    import Toggle from '@/elements/input/Toggle.vue';

    const show = ref(true)
</script>

# Panels
Panels are components that provide collapsible controls or other information for users. They are fully compliant with all the color theming from [Box](../../elements/box). They also come with slots for rich customization.

<Panel
    color="gray"
    variant="light"
    :open="show"
    @toggle="show = !show"
>
<template v-slot:header>
    <div class="flex gap-1 items-center">
        <span>Inputs</span>
        <Box color="blue" class="px-1 text-xs rounded-lg">{{ 2 }}</Box>
    </div>
</template>
<section class="p-2 grid grid-cols-1 gap-2">
<Entry id="id" label="ID" inline v-slot="{ id }">
    <Input
        :id="id"
        :name="id"
        class="w-full" />
</Entry>
<Entry id="required" label="Required" inline v-slot="{ id }">
    <Toggle
        :id="id"
        :name="id" />
</Entry>
</section>
</Panel>