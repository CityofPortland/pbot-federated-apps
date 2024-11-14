<script setup lang="ts">
import { FieldList, Field } from '@pbotapps/components';
import { computed } from 'vue';
import { useSignStore } from '../store';

const store = useSignStore();

const props = defineProps({
  code: { type: String, required: true },
});

const sign = computed(() => store.sign(props.code));

const property = (key: string, object: Record<string, unknown>) => object[key];
</script>

<template>
  <article>
    <header class="prose prose-lg flex">
      <h1 class="flex-1">Revisions of {{ sign?.code }}</h1>
    </header>
    <main class="mt-8 flex flex-col md:flex-row prose">
      <ul>
        <li
          v-for="revision in sign?._revisions"
          :key="revision.updated?.toString()"
        >
          <article>
            <FieldList>
              <Field
                v-for="key in Object.keys(revision).filter(key =>
                  property(key, revision)
                )"
                :key="key"
                :name="key"
                display="inline"
                >{{ property(key, revision) }}</Field
              >
            </FieldList>
          </article>
        </li>
      </ul>
    </main>
  </article>
</template>
