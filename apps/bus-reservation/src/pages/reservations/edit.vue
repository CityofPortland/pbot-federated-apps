<script setup lang="ts">
import { Entry, Input, Button, Message, Select } from '@pbotapps/components';
import { onMounted, ref } from 'vue';
import { User, Zone, Reservation, useStore } from '../../store';
import { useRouter } from 'vue-router';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';


const store = useStore();
const formRef = ref<HTMLFormElement>();
const errors = ref<Error>();
const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const hotel = ref<User>();
const zone = ref<Zone>();
const start = ref<Date>();
const end = ref<Date>();

const save = async () => {
    if (formRef.value?.reportValidity()) {
        try {
            await store.editReservation({ id: props.id, zone: zone.value, user: hotel.value, start: start.value, end: end.value });
            router.push({ path: '/reservations' });
        } catch (error) {
            errors.value = error as Error;
        }
    }
};
onMounted(() => {
    if (props.id) {
        const r = store.reservation(props.id);
        if (r) {
            hotel.value = r.user;
            zone.value = r.zone;
            start.value = r.start;
            end.value = r.end;
        }
    }
});
</script>

<template>
    <form ref="formRef" class="max-w-7xl mx-auto px-4 mt-4 mb-12 space-y-4" @submit.prevent="save">
        <header>
            <h1 class="text-3xl mb-4 font-bold">Edit Reservation</h1>
        </header>
        <section v-if="errors">
            <Message color="red" variant="light" summary="Error saving reservation">
                {{ errors.message }}
            </Message>
        </section>

        <Entry id="zone" label="Zone" required :inline="false" v-slot="{ id, required }">
            <Select :id="id" :required="required" :modelValue="zone" @changed="zone = store.zone($event)">
                <option v-for="z in store.zones" :key="z.id" :value="z.id" :selected="z.id == zone?.id">
                    {{ z.label }}
                </option>
            </Select>
        </Entry>
        <Entry id="hotel" label="Hotel" required :inline="false" v-slot="{ id, required }">
            <Select :id="id" :required="required" :modelValue="hotel">
                <option v-for="h in store.users.filter(u => u.enabled)" :key="h.id" :value="h"
                    :selected="h.id == hotel?.id">
                    {{ h.label }}
                </option>
            </Select>
        </Entry>
        <Entry v-if="start" id="start" label="Start" required :inline="false" v-slot="{ id, required }">
            <Input :id="id" :required="required" type="date" :modelValue="format(start, 'yyyy-MM-dd')"
                @changed="start = toZonedTime($event, 'America/Los_Angeles')" />
        </Entry>
        <Entry v-if="end" id="end" label="End" required :inline="false" v-slot="{ id, required }">
            <Input :id="id" :required="required" type="date" :modelValue="format(end, 'yyyy-MM-dd')"
                @changed="end = toZonedTime($event, 'America/Los_Angeles')" />
        </Entry>
        <Button>Save</Button>
    </form>
</template>