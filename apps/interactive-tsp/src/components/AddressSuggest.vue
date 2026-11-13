<template>
  <div class="relative">
    <AddressSuggest @search="handleSearch" />
    <CandidateList
      :open="!!portlandMaps.candidates?.length"
      class="absolute w-full mt-1 z-10 bg-white"
    >
      <Candidate
        v-for="candidate in portlandMaps.candidates"
        :key="candidate.id"
        :candidate="candidate"
        @click="selectCandidate(candidate)"
        @keyup.enter="selectCandidate(candidate)"
      />
    </CandidateList>
  </div>
</template>

<script setup lang="ts">
import { AddressSuggest, Candidate, CandidateList } from '@pbotapps/components';

import {
  usePortlandMapsStore,
  type AddressCandidate,
} from '../store/portlandMaps';

const portlandMaps = usePortlandMapsStore();

const emit = defineEmits<{
  (e: 'candidate-select', candidate: AddressCandidate): void;
}>();

// the shared component's search types are lowercase; our GraphQL schema expects `taxLot`
const searchTypes: Record<string, string> = {
  address: 'address',
  taxlot: 'taxLot',
};

function handleSearch({ query, type }: { query: string; type: string }) {
  portlandMaps.findCandidates({
    search: query,
    searchType: searchTypes[type] || type,
  });
}

function selectCandidate(candidate: AddressCandidate) {
  emit('candidate-select', candidate);
  portlandMaps.clearCandidates();
}
</script>
