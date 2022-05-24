<template>
  <Message
    :color="permit.isValid ? 'green' : 'red'"
    variant="light"
    :icon="permit.isValid ? 'check-circle' : 'x-circle'"
    :summary="summary"
  >
    <Box class="flex flex-col space-y-3">
      <i18n-t
        :keypath="permit.isValid ? 'permitFoundBody' : 'permitNotFoundBody'"
        tag="p"
      >
        <template v-slot:licensePlate>{{ permit.licensePlate }}</template>
        <template v-slot:zone>Zone {{ permit.zone.id }}</template>
        <template v-slot:useMapLink>
          <Anchor
            url="//pdx.maps.arcgis.com/apps/MapSeries/index.html?appid=ad171d005d4442bba3c640735d070aa3&entry=3"
            >{{ t('useMap') }}</Anchor
          >
        </template>
      </i18n-t>

      <p>{{ t('regulationsNote') }}</p>

      <i18n-t v-if="!permit.isValid" keypath="permitNotFoundCaveat" tag="p">
        <template v-slot:callEnforcementLink>
          <Anchor url="tel:503-823-5195">503-823-5195</Anchor>
        </template>
      </i18n-t>
    </Box>
  </Message>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import Anchor from '@/elements/anchor/Anchor.vue';
import Message from '@/components/message/Message.vue';
import { AreaPermit } from '@/store/types';

export default defineComponent({
  name: 'PermitLookupResult',
  components: { Anchor, Message },
  props: {
    permit: {
      type: Object as () => AreaPermit,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();

    return {
      t,
      licensePlate: props.permit.licensePlate,
      zone: props.permit.zone,
      capitalize: (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      },
      summary: computed(() =>
        props.permit.isValid
          ? t('permitFoundHeader', { licensePlate: props.permit.licensePlate })
          : t('permitNotFoundHeader', {
              licensePlate: props.permit.licensePlate,
            })
      ),
    };
  },
});
</script>

<i18n>
{
  "en": {
    "permitFoundHeader": "Active area parking permit found for '{licensePlate}'!",
    "permitNotFoundHeader": "No active area parking permit found for '{licensePlate}'.",
    "permitFoundBody": "Vehicle with license plate '{licensePlate}' has an active area parking permit in '{zone}'.",
    "permitNotFoundBody": "Vehicle with license plate '{licensePlate}' does not have an active area parking permit in '{zone}'. Vehicles without an active area parking permit can park up to the visitor time limit. {useMapLink} to view visitor time limits and enforcement hours in your zone.",
    "useMap": "Use the zone enforcement map",
    "permitNotFoundCaveat": "Vehicles may have other permits allowing them to park in this area. Not all vehicles with a ‘no active area parking permit found’ result will be in violation. If you’d like to report this vehicle to Parking Enforcement, call {callEnforcementLink} and choose option 1 to report a vehicle.",
    "regulationsNote": "Please note that parking regulations may vary within a block. Use the posted parking sign adjacent to the vehicle to verify the applicable regulations."
  },
  "no": {
    "permitFoundHeader": "Tillatelse funnet for '{licensePlate}'!",
    "permitNotFoundHeader": "Tillatelse ikke funnet for '{licensePlate}'.",
    "permitFoundBody": "Kjøretøy med lisens '{licensePlate}' har områdeparkeringstillatelse i '{zone}'.",
    "permitNotFoundBody": "Kjøretøy med lisens  '{licensePlate}' har ikke områdeparkeringstillatelse i '{zone}'."
  }
}
</i18n>
