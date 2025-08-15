export const HostInfoValidation = {
  isValidEmail: (hostInfo: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(hostInfo);
  },

  isValidPhone: (hostInfo: string): boolean => {
    const phonePattern = /^[\+]?[\d\s\-\(\)]+$/;
    return phonePattern.test(hostInfo);
  },

  isValid: (hostInfo: string): boolean => {
    return HostInfoValidation.isValidEmail(hostInfo) || HostInfoValidation.isValidPhone(hostInfo);
  },

  getType: (hostInfo: string): 'email' | 'phone' | 'unknown' => {
    if (HostInfoValidation.isValidEmail(hostInfo)) return 'email';
    if (HostInfoValidation.isValidPhone(hostInfo)) return 'phone';
    return 'unknown';
  },

  format: (hostInfo: string): string => {
    const type = HostInfoValidation.getType(hostInfo);
    switch (type) {
      case 'email':
        return `📧 ${hostInfo}`;
      case 'phone':
        return `📞 ${hostInfo}`;
      default:
        return `📋 ${hostInfo}`;
    }
  }
};
