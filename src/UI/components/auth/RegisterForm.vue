<template>
  <v-form ref="registerForm" v-model="isFormValid" @submit.prevent="handleSubmit" class="register-form">
    <!-- Name Field -->
    <v-text-field v-model="formData.name" :rules="nameRules" label="Full Name" prepend-inner-icon="mdi-account-outline"
      type="text" variant="outlined" class="mb-2 input-field" density="comfortable" bg-color="rgba(255, 255, 255, 0.05)"
      color="primary" required hide-details="auto" />

    <!-- Email Field -->
    <v-text-field v-model="formData.email" :rules="emailRules" label="Email" prepend-inner-icon="mdi-email-outline"
      type="email" variant="outlined" class="mb-2 input-field" density="comfortable"
      bg-color="rgba(255, 255, 255, 0.05)" color="primary" required hide-details="auto" />

    <!-- Password Field -->
    <v-text-field v-model="formData.password" :rules="passwordRules"
      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="togglePasswordVisibility"
      :type="showPassword ? 'text' : 'password'" label="Password" prepend-inner-icon="mdi-lock-outline"
      variant="outlined" class="mb-2 input-field" density="comfortable" bg-color="rgba(255, 255, 255, 0.05)"
      color="primary" required hide-details="auto" />

    <!-- Confirm Password Field -->
    <v-text-field v-model="formData.confirmPassword" :rules="confirmPasswordRules"
      :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="toggleConfirmPasswordVisibility" :type="showConfirmPassword ? 'text' : 'password'"
      label="Confirm Password" prepend-inner-icon="mdi-lock-check-outline" variant="outlined" class="mb-4 input-field"
      density="comfortable" bg-color="rgba(255, 255, 255, 0.05)" color="primary" required hide-details="auto" />

    <!-- Terms and Conditions -->
    <v-checkbox v-model="formData.acceptTerms" :rules="termsRules" class="mt-2 mb-4" color="primary"
      hide-details="auto">
      <template v-slot:label>
        <span class="text-body-2">
          I agree to the
          <v-btn variant="text" color="primary" class="text-body-2 pa-0 text-decoration-underline"
            @click="$emit('show-terms')" style="min-width: auto; height: auto;">
            Terms and Conditions
          </v-btn>
        </span>
      </template>
    </v-checkbox>

    <!-- Submit Button -->
    <v-btn block color="primary" size="large" type="submit" :loading="loading" :disabled="!isFormValid || loading"
      class="register-btn mt-2 mb-8" elevation="4" min-height="52px" rounded="lg">
      <span class="text-button font-weight-bold">Create Account</span>
    </v-btn>

    <!-- Divider -->
    <v-divider class="mb-6"></v-divider>

    <!-- Sign In Link -->
    <div class="text-center">
      <span class="text-body-2 text-medium-emphasis">Already have an account?</span>
      <v-btn variant="text" color="primary" class="text-none font-weight-bold ms-2" @click="$emit('go-to-login')">
        Sign In
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { getRegisterRules } from '@/utils/validations';

// Types
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

// Props
interface Props {
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

// Events
const emit = defineEmits<{
  'submit': [payload: Omit<FormData, 'acceptTerms'>];
  'show-terms': [];
  'go-to-login': [];
}>();

// Form refs
const registerForm = ref<any>(null);

// State
const isFormValid = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Form data
const formData = reactive<FormData>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
});

// Validation rules (reactive to password changes)
const rules = computed(() => getRegisterRules(formData.password));
const nameRules = computed(() => rules.value.name);
const emailRules = computed(() => rules.value.email);
const passwordRules = computed(() => rules.value.password);
const confirmPasswordRules = computed(() => rules.value.confirmPassword);
const termsRules = computed(() => rules.value.acceptTerms);

// Methods
const togglePasswordVisibility = (): void => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = (): void => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const validateForm = async (): Promise<boolean> => {
  if (!registerForm.value) return false;

  const { valid } = await registerForm.value.validate();
  return valid;
};

const resetForm = (): void => {
  formData.name = '';
  formData.email = '';
  formData.password = '';
  formData.confirmPassword = '';
  formData.acceptTerms = false;
  registerForm.value?.resetValidation();
};

// Main submit handler
const handleSubmit = async (): Promise<void> => {
  const isValid = await validateForm();

  if (!isValid) return;

  // Emit clean data to parent (exclude acceptTerms)
  const payload = {
    name: formData.name.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    confirmPassword: formData.confirmPassword
  };

  emit('submit', payload);

  // Reset form after emit
  registerForm.value?.reset();
};

</script>

<style scoped>
.register-form {
  width: 100%;
  transition: all 0.4s ease;
}

.input-field {
  transition: all 0.3s ease;
}

.input-field:hover {
  transform: translateY(-2px);
}

.input-field:focus-within {
  transform: translateY(-1px);
}

.register-btn {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s;
}

.register-btn:hover::before {
  left: 100%;
}

.register-btn:focus {
  outline: 2px solid rgba(33, 150, 243, 0.5);
  outline-offset: 2px;
}

.register-btn:disabled {
  opacity: 0.7;
}

/* Checkbox custom styling */
:deep(.v-checkbox .v-selection-control__input) {
  margin-right: 8px;
}
</style>
