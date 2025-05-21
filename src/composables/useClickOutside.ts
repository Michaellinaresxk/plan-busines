import { ref, onMounted, onUnmounted, Ref } from 'vue';

/**
 * Composable to detect clicks outside of a referenced element
 * @param elementRef - Reference to the DOM element to monitor
 * @param callback - Function to call when click outside is detected
 * @returns Object containing the event handler function
 */
export function useClickOutside(elementRef: Ref<HTMLElement | null>, callback: () => void) {
  const clickOutside = (event: MouseEvent) => {
    if (elementRef.value && !elementRef.value.contains(event.target as Node)) {
      callback();
    }
  };

  return { clickOutside };
}
