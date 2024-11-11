import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const useErrorStore = defineStore('errors', () => {
  const errors = reactive(new Map<string, Error>());

  const add = (key: string, err: Error) => {
    errors.set(key, err);
  };

  const clear = () => {
    errors.clear();
  };

  const remove = (key: string) => {
    errors.delete(key);
  };

  return {
    //state
    errors,
    //actions
    add,
    clear,
    remove,
  };
});
