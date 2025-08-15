import { ref, computed } from 'vue';

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  hostInfo: string; // ✅ NEW: Host contact information
}

export function useReservationForm() {
  const clientData = ref<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    hostInfo: '' // ✅ NEW: Initialize host info
  });

  const isClientDataComplete = computed(() => {
    return !!(
      clientData.value.name &&
      clientData.value.email &&
      clientData.value.phone &&
      clientData.value.hostInfo // ✅ NEW: Require host info
    );
  });

  const hostContactType = computed(() => {
    const hostInfo = clientData.value.hostInfo;
    if (!hostInfo) return 'unknown';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[\+]?[\d\s\-\(\)]+$/;

    if (emailPattern.test(hostInfo)) return 'email';
    if (phonePattern.test(hostInfo)) return 'phone';
    return 'unknown';
  });

  const formatHostInfo = computed(() => {
    const hostInfo = clientData.value.hostInfo;
    if (!hostInfo) return '';

    switch (hostContactType.value) {
      case 'email':
        return `📧 ${hostInfo}`;
      case 'phone':
        return `📞 ${hostInfo}`;
      default:
        return `📋 ${hostInfo}`;
    }
  });

  return {
    clientData,
    isClientDataComplete,
    hostContactType,
    formatHostInfo
  };
}
