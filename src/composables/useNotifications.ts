import { ref } from 'vue';

export function useNotifications() {
  const snackbar = ref(false);
  const snackbarText = ref('');
  const snackbarColor = ref('success');
  const snackbarIcon = ref('mdi-check-circle');

  const showNotification = (
    message: string,
    color: 'success' | 'error' | 'info' | 'warning' | 'primary' = 'success',
    icon: string = 'mdi-check-circle'
  ) => {
    snackbarText.value = message;
    snackbarColor.value = color;
    snackbarIcon.value = icon;
    snackbar.value = true;
  };

  const showSuccessNotification = (message: string, icon: string = 'mdi-check-circle') => {
    showNotification(message, 'success', icon);
  };

  const showErrorNotification = (message: string, icon: string = 'mdi-close-circle') => {
    showNotification(message, 'error', icon);
  };

  const showInfoNotification = (message: string, icon: string = 'mdi-information') => {
    showNotification(message, 'info', icon);
  };

  const showWarningNotification = (message: string, icon: string = 'mdi-alert') => {
    showNotification(message, 'warning', icon);
  };

  return {
    snackbar,
    snackbarText,
    snackbarColor,
    snackbarIcon,
    showNotification,
    showSuccessNotification,
    showErrorNotification,
    showInfoNotification,
    showWarningNotification
  };
}
