<script setup lang="ts">
import { Button } from '@pbotapps/components';
//import { PagedMaximoUsers } from '../../types/pagedMaximoUsers';
import { LcrPaginatedData } from '../../types/lcrPaginatedData';
import { ref, toRefs } from 'vue';

const props = defineProps({
  pagedData: {
    type: Object as () => LcrPaginatedData<unknown>,
    required: true,
  },
  pageNumber: {
    type: Number,
    required: true,
  },
});

const { pagedData, pageNumber } = toRefs(props);

let pageNumberLocal = ref(pageNumber.value);

// whenever you re-search we need to let this pager know
// that the paging has been reset and we're going to the first page
defineExpose({ goToFirstPage });

const emit = defineEmits<{
  (eventName: 'pagerChanged', pageNumber: number): void;
}>();

function goToFirstPage() {
  //console.log('pager.goToFirstPage');
  pageNumberLocal.value = 1;
  emit('pagerChanged', pageNumberLocal.value);
}

function goToLastPage() {
  //console.log('pager.goToLastPage');
  pageNumberLocal.value = props.pagedData.totalPages;
  emit('pagerChanged', pageNumberLocal.value);
}

function goToPreviousPage() {
  //console.log('pager.goToPreviousPage');
  if (pageNumberLocal.value > 1) {
    pageNumberLocal.value--;
    emit('pagerChanged', pageNumberLocal.value);
  }
}

function goToNextPage() {
  //console.log('pager.goToNextPage', pageNumberLocal.value);
  if (pageNumberLocal.value < props.pagedData.totalPages) {
    pageNumberLocal.value++;
    //console.log('pager.goToNextPage after inc:', pageNumberLocal.value);
    emit('pagerChanged', pageNumberLocal.value);
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
