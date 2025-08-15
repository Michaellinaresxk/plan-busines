export const createDebugLogger = (context: string) => {
  const isDev = import.meta.env.DEV;

  return {
    log: (message: string, data?: any) => {
      if (isDev) {
        console.log(`🔍 [${context}] ${message}`, data || '');
      }
    },

    error: (message: string, error?: any) => {
      console.error(`❌ [${context}] ${message}`, error || '');
    },

    success: (message: string, data?: any) => {
      if (isDev) {
        console.log(`✅ [${context}] ${message}`, data || '');
      }
    },

    performance: (label: string, fn: Function) => {
      if (isDev) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`⏱️ [${context}] ${label}: ${(end - start).toFixed(2)}ms`);
        return result;
      }
      return fn();
    }
  };
};
