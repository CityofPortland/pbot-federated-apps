import { defineStore } from 'pinia';
import { reactive } from 'vue';

type MessageType = 'error' | 'info' | 'warning';

export const useMessageStore = defineStore('messages', () => {
  const messages = reactive(new Map<string, [MessageType, Error]>());

  const add = (key: string, type: MessageType, err: Error) => {
    messages.set(key, [type, err]);
  };

  const clear = () => {
    messages.clear();
  };

  const remove = (key: string) => {
    messages.delete(key);
  };

  return {
    //state
    messages,
    //actions
    add,
    clear,
    remove,
  };
});
