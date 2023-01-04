import { onUnmounted } from 'vue';

export function useWindowEvent<TType extends keyof WindowEventMap>(
  type: TType,
  callback: (this: Window, ev: WindowEventMap[TType]) => void,
  options?: boolean | AddEventListenerOptions
): void {
  window.addEventListener(type, callback, options);
  onUnmounted(() => window.removeEventListener(type, callback, options));
}
