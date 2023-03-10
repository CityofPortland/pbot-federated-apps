<script setup lang="ts">
import { Button } from '@pbotapps/components';
import { PagedMaximoUsers } from '../../types/pagedMaximoUsers';
import { ref } from 'vue';

const props = defineProps({
  pagedData: {
    type: Object as () => PagedMaximoUsers,
    required: true,
  },
});

const emit = defineEmits<{
  (eventName: 'pagerChanged', pageNumber: number): void;
}>();

let pageNumber = ref(1);

function goToFirstPage() {
  //console.log('pager.goToFirstPage');
  pageNumber.value = 1;
  emit('pagerChanged', pageNumber.value);
}

function goToLastPage() {
  //console.log('pager.goToLastPage');
  pageNumber.value = props.pagedData.totalPages;
  emit('pagerChanged', pageNumber.value);
}

function goToPreviousPage() {
  //console.log('pager.goToPreviousPage pageNumber=', pageNumber.value);
  if (pageNumber.value > 1) {
    pageNumber.value--;
    emit('pagerChanged', pageNumber.value);
  }
}

function goToNextPage() {
  //console.log('pager.goToNextPage pageNumber=', pageNumber.value);
  if (pageNumber.value < props.pagedData.totalPages) {
    pageNumber.value++;
    emit('pagerChanged', pageNumber.value);
  }
}
</script>

<template>
  <div v-if="pagedData != null" class="grid grid-cols1">
    <div class="flex justify-center">
      <Button
        size="small"
        class="inline-flex mx-1 disabled:opacity-50"
        label="&lt;&lt; First"
        :disabled="pagedData.pageNumber <= 1"
        @click="goToFirstPage"
      >
      </Button>

      <Button
        size="small"
        class="inline-flex mx-1 disabled:opacity-50"
        label="&lt; Previous Page"
        :disabled="pagedData.pageNumber <= 1"
        @click="goToPreviousPage"
      >
      </Button>

      <Button
        size="small"
        class="inline-flex mx-1 disabled:opacity-50"
        label="Next Page &gt;"
        :disabled="pagedData.pageNumber >= pagedData.totalPages"
        @click="goToNextPage"
      >
      </Button>

      <Button
        size="small"
        class="inline-flex mx-1 disabled:opacity-50"
        label="Last &gt;&gt;"
        :disabled="pagedData.pageNumber >= pagedData.totalPages"
        @click="goToLastPage"
      >
      </Button>
    </div>

    <div class="flex justify-center text-sm">
      Page {{ pagedData.pageNumber }} of {{ pagedData.totalPages }}. Showing
      {{
        pagedData.pageSize < pagedData.totalRecords
          ? pagedData.pageSize
          : pagedData.totalRecords
      }}
      of {{ pagedData.totalRecords }} records.
    </div>
  </div>
</template>
