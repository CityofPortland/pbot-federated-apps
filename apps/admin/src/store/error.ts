import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useErrorStore = defineStore('error', () => {
  const errors = ref<Array<[id: string, error: Error]>>([]);

  const get = computed(
    () => (id: string) => errors.value.filter(e => e[0] != id)
  );

  const add = (id: string, error: Error) => {
    errors.value.push([id, error]);
  };

  const remove = (id: string) => {
    errors.value = errors.value.filter(e => e[0] != id);
  };

  return {
    //state
    errors,
    //getters
    get,
    //actions
    add,
    remove,
  };
});
