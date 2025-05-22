export type ValidationRule = (value: string) => boolean | string;

// Basic validation rules
export const validationRules = {
  required:
    (fieldName: string = 'Field'): ValidationRule =>
    (v: string) =>
      !!v || `${fieldName} is required`,

  email: (): ValidationRule => (v: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(v) || 'Please enter a valid email address';
  },

  minLength:
    (min: number, fieldName: string = 'Field'): ValidationRule =>
    (v: string) =>
      v.length >= min || `${fieldName} must be at least ${min} characters long`,

  name: (): ValidationRule => (v: string) => {
    if (!v || v.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (!/^[a-zA-Z\s]+$/.test(v)) {
      return 'Name can only contain letters and spaces';
    }
    return true;
  },

  strongPassword: (): ValidationRule => (v: string) => {
    if (v.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(v)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(v)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(v)) {
      return 'Password must contain at least one number';
    }
    return true;
  },

  confirmPassword:
    (originalPassword: string): ValidationRule =>
    (v: string) =>
      v === originalPassword || 'Passwords do not match',

  acceptTerms: (): ValidationRule => (v: boolean) =>
    !!v || 'You must accept the terms and conditions'
};

// Predefined rule sets
export const getLoginRules = () => ({
  email: [validationRules.required('Email'), validationRules.email()],
  password: [validationRules.required('Password'), validationRules.minLength(6, 'Password')]
});

export const getRegisterRules = (passwordValue: string = '') => ({
  name: [validationRules.required('Full name'), validationRules.name()],
  email: [validationRules.required('Email'), validationRules.email()],
  password: [validationRules.required('Password'), validationRules.strongPassword()],
  confirmPassword: [
    validationRules.required('Confirm Password'),
    validationRules.confirmPassword(passwordValue)
  ],
  acceptTerms: [validationRules.acceptTerms()]
});
