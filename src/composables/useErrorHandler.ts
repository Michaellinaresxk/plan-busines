export function useErrorHandler() {
  const errors = ref<Array<{ id: string; message: string; timestamp: Date }>>([]);

  const addError = (message: string, context?: string) => {
    const error = {
      id: `error_${Date.now()}`,
      message: context ? `[${context}] ${message}` : message,
      timestamp: new Date()
    };

    errors.value.push(error);
    console.error('🚨 Error captured:', error);
  };

  const removeError = (id: string) => {
    const index = errors.value.findIndex(e => e.id === id);
    if (index > -1) {
      errors.value.splice(index, 1);
    }
  };

  const clearAllErrors = () => {
    errors.value = [];
  };

  // Auto-remove errors after 10 seconds
  watchEffect(() => {
    if (errors.value.length > 0) {
      const timeout = setTimeout(() => {
        errors.value = errors.value.filter(error => Date.now() - error.timestamp.getTime() < 10000);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  });

  return {
    errors: readonly(errors),
    addError,
    removeError,
    clearAllErrors
  };
}
