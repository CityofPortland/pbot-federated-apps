import { computed, ComputedRef } from 'vue';

export function useAnchor(border: boolean): {
  borderClasses: ComputedRef;
} {
  return {
    borderClasses: computed(() => {
      return {
        'border-b-2': border,
        'border-current': border,
      };
    }),
  };
}
