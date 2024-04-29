import { computed, type ComputedRef, type Ref } from 'vue';

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
      'border-gray-500',
      disabled.value ? 'opacity-50' : 'opacity-100',
      'rounded-md',
      'shadow-md',
      'bg-gray-100',
      'text-current',
      'placeholder-gray-500',
      'truncate',
      'invalid:border-red-500',
      'invalid:bg-red-100',
      'invalid:text-red-500',
      'invalid:placeholder-red-500',
      'focus:outline-none',
      'focus:ring-4',
      'focus:ring-blue-500',
    ]),
  };
}
