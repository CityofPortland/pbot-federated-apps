<template>
  <article class="grid grid-cols-1 gap-8">
    <header class="grid grid-cols-1 gap-8">
      <h1 class="text-2xl font-bold">
        {{ t('appHeader') }}
      </h1>
      <img
        class="max-h-24 px-4"
        src="../assets/pbot_appp_logo.png"
        alt="PBOT Area Parking Permit Program logo"
      />
    </header>
    <main class="max-w-xl flex flex-col space-y-4">
      <i18n-t keypath="help" tag="p">
        <template v-slot:licenseFAQLink>
          <Anchor
            url="https://www.portland.gov/transportation/parking/pay-plate-faqs#toc-how-do-i-enter-my-license-plate-"
            >{{ t('licenseFAQLink') }}
          </Anchor>
        </template>
        <template v-slot:generalHelp>
          <Anchor
            url="https://www.portland.gov/transportation/parking/appp-info"
            >{{ t('generalHelp') }}</Anchor
          >
        </template>
      </i18n-t>
      <form
        class="flex flex-col md:flex-row md:space-x-4 md:space-y-0 space-y-4"
        @submit.prevent="handleSubmit"
      >
        <Input
          id="licensePlateInput"
          name="licensePlate"
          aria-label="License plate"
          type="text"
          :placeholder="t('enterPlatePlaceholder')"
          required
          :disabled="error"
          :class="{
            'cursor-not-allowed': error,
          }"
          pattern="[A-Za-z0-9]+"
          :patternModifiers="{ input: true }"
          :size="10"
          v-model.uppercase="licensePlate"
        />

        <Select
          id="zoneInput"
          name="zone"
          aria-label="Area parking permit zone"
          v-model="zone"
          required
          :placeholder="t('selectZone')"
          :disabled="error"
          :class="{
            'cursor-not-allowed': error,
          }"
        >
          <option
            v-for="zone in zones.sort((a, b) => {
              if (a.id < b.id) return -1;
              if (a.id > b.id) return 1;
              return 0;
            })"
            :key="zone.id"
            :value="zone.id"
          >
            {{ zone.displayName }}
          </option>
        </Select>

        <Button
          :label="t('search')"
          color="blue"
          :class="{
            'opacity-50 cursor-not-allowed': isLoading || error,
          }"
          :disabled="isLoading || error"
        >
          <div v-if="isLoading" class="flex items-center justify-center px-3">
            <svg
              class="animate-spin h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <span v-else>{{ t('search') }}</span>
        </Button>
      </form>

      <Result v-if="permit" :permit="permit" />

      <Message
        v-if="error"
        color="tangerine"
        variant="light"
        icon="exclamation"
        :summary="t('errorSummary')"
      >
        <p>{{ t('errorMessageFirst') }}</p>
        <i18n-t keypath="errorMessageSecond" tag="p">
          <template v-slot:errorEmail>
            <Anchor :url="emailLink">{{ emailAddress }}</Anchor>
          </template>
          <template v-slot:errorTelephone>
            <Anchor url="tel:503-823-2777">503-823-2777</Anchor>
          </template>
        </i18n-t>
      </Message>
    </main>
  </article>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { AreaPermitZone } from '@/store/types';

import Anchor from '@/elements/anchor/Anchor.vue';
import Button from '@/elements/button/Button.vue';
import Input from '@/elements/inputs/Input.vue';
import Message from '@/components/message/Message.vue';
import Result from '@/components/permit/PermitLookupResult.vue';
import Select from '@/elements/inputs/Select.vue';

export default defineComponent({
  name: 'PermitLookup',
  components: {
    Anchor,
    Button,
    Input,
    Result,
    Select,
    Message,
  },
  setup() {
    const { t, locale } = useI18n();
    const licensePlate = ref('');
    const zone = ref('');

    const store = useStore();

    store.dispatch('retrieveZones');

    function handleSubmit() {
      if (licensePlate.value && zone.value) {
        store.dispatch('searchLicense', {
          licensePlate: licensePlate.value,
          zone: zone.value,
        });
      }
    }

    const emailAddress = 'pbotparkingpermits@portlandoregon.gov';
    const emailSubject = 'Unable to use Area Parking Permit Lookup';

    const emailLink = `mailto:${emailAddress}?subject=${emailSubject}`;

    return {
      t,
      locale,
      licensePlate,
      zone,
      handleSubmit,
      emailAddress,
      emailLink,
      isLoading: computed(() => store.state.loading),
      permit: computed(() => store.state.permit),
      zones: computed(() =>
        Array.from(
          store.state.zones
            .reduce(
              (acc: Map<string, AreaPermitZone>, curr: AreaPermitZone) => {
                if (!acc.has(curr.id) && !curr.subSection) {
                  acc.set(curr.id, curr);
                }
                return acc;
              },
              new Map<string, AreaPermitZone>()
            )
            .values()
        )
      ),
      error: computed(() => store.state.error),
    };
  },
});
</script>

<i18n>
{
  "en": {
    "search" : "Search",
    "enterPlatePlaceholder" : "Enter License Plate",
    "selectZone" : "Select Zone",
    "appHeader" : "Area Parking Permit Lookup",
    "help": "Use the form below to search for a vehicle's active parking permit in a selected zone. For help entering license plates, {licenseFAQLink}, and for information on the area parking permit program, {generalHelp}.",
    "licenseFAQLink":"view our license plate entry FAQ",
    "generalHelp": "view our area parking permit guide",
    "errorSummary": "Unable to process lookups.",
    "errorMessageFirst": "An error occured while querying area parking permit information. Please try again later by refreshing or re-opening this application. We apologize for this inconvenience.",
    "errorMessageSecond": "If you continue to receive this error message, please contact PBOT Parking Permits at {errorEmail} or {errorTelephone}."
  },
  "no": {
    "search" : "Søk",
    "enterPlatePlaceholder": "Skriv inn lisensplaten",
    "selectZone" : "Velg sone",
    "appHeader" : "Område parkering tillatelse oppslag",
    "help" : "Bruk skjemaet nedenfor for å skrive inn bilens lisensnummer, og velg en parkeringsstillatelsone, og spør deretter om kjøretøyet har en aktiv parkeringstillatelse for den valgte sonen. For mer informasjon {generalHelp}.",
    "generalHelp" : "se her"
  }
}
</i18n>
