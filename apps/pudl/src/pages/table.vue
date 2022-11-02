<script setup lang="ts">
defineProps({ table: { type: Object, required: true } });
</script>

<template>
  <article>
    <div class="flex flex-col space-y-4">
      <div>
        <h1 class="text-3xl capitalize">{{ table.name }}</h1>
      </div>
      <div>
        <ul>
          <li v-for="(column, index) in table.columns" :key="index">
            <div>
              <h2>{{ column.name }} of type {{ column.type }}</h2>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>
