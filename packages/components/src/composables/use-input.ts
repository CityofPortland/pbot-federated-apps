import { computed, ComputedRef, Ref } from 'vue';

export type TextInputType = 'email' | 'search' | 'text';

export interface TextInputProps {
  id: string;
  name: string;
  pattern?: string;
  patternModifiers?: Record<string, boolean>;
  size?: number;
  modelValue?: string;
  modelProperties?: Record<string, boolean>;
}

export function useInput(disabled: Ref<boolean>): {
  classes: ComputedRef<string[]>;
} {
  return {
    classes: computed(() => [
      'border',
      'invalid:border-red-500',
      'border-gray-500',
      disabled.value ? 'opacity-50' : 'opacity-100',
      'rounded-md',
      'shadow-md',
      'invalid:bg-red-100',
      'bg-gray-100',
      'text-red-500',
      'text-current',
      'invalid:placeholder-red-500',
      'placeholder-gray-500',
      'truncate',
      'focus:outline-none',
      'focus:ring-4',
      'focus:ring-blue-500',
    ]),
  };
}
