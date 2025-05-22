<template>
  <v-form ref="loginForm" v-model="isFormValid" @submit.prevent="handleSubmit" class="login-form">
    <!-- Email Field -->
    <v-text-field v-model="formData.email" :rules="emailRules" label="Email" prepend-inner-icon="mdi-email-outline"
      type="email" variant="outlined" class="mb-2 input-field" density="comfortable"
      bg-color="rgba(255, 255, 255, 0.05)" color="primary" required hide-details="auto" />

    <!-- Password Field -->
    <v-text-field v-model="formData.password" :rules="passwordRules"
      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="togglePasswordVisibility"
      :type="showPassword ? 'text' : 'password'" label="Password" prepend-inner-icon="mdi-lock-outline"
      variant="outlined" class="mb-2 mt-6 input-field" density="comfortable" bg-color="rgba(255, 255, 255, 0.05)"
      color="primary" required hide-details="auto" />

    <!-- Actions Row -->
    <div class="d-flex justify-space-between align-center my-5">
      <v-btn variant="text" color="primary" class="text-body-2 text-none" @click="$emit('forgot-password')"
        size="small">
        Forgot Password?
      </v-btn>
    </div>

    <!-- Submit Button -->
    <v-btn block color="primary" size="large" type="submit" :loading="loading" :disabled="!isFormValid || loading"
      class="login-btn mt-2 mb-8" elevation="4" min-height="52px" rounded="lg">
      <span class="text-button font-weight-bold">Sign In</span>
    </v-btn>

    <!-- Divider -->
    <v-divider class="mb-6"></v-divider>

    <!-- Sign Up Link -->
    <div class="text-center">
      <span class="text-body-2 text-medium-emphasis">Don't have an account?</span>
      <v-btn variant="text" color="primary" class="text-none font-weight-bold ms-2" @click="$emit('go-to-signup')">
        Sign Up
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { getLoginRules } from '@/utils/validations';

// Types
interface FormData {
  email: string;
  password: string;
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
  'submit': [payload: FormData];
  'forgot-password': [];
  'go-to-signup': [];
}>();

// Form refs
const loginForm = ref<any>(null);

// State
const isFormValid = ref(false);
const showPassword = ref(false);

// Form data
const formData = reactive<FormData>({
  email: '',
  password: ''
});

// Validation rules
const rules = getLoginRules();
const emailRules = rules.email;
const passwordRules = rules.password;

// Methods
const togglePasswordVisibility = (): void => {
  showPassword.value = !showPassword.value;
};

const validateForm = async (): Promise<boolean> => {
  if (!loginForm.value) return false;

  const { valid } = await loginForm.value.validate();
  return valid;
};

const resetForm = (): void => {
  formData.email = '';
  formData.password = '';
  loginForm.value?.resetValidation();
};

// Main submit handler
const handleSubmit = async (): Promise<void> => {
  const isValid = await validateForm();

  if (!isValid) return;

  // Emit clean data to parent
  const payload: FormData = {
    email: formData.email.trim().toLowerCase(),
    password: formData.password
  };

  emit('submit', payload);

  // Clear form after emit
  formData.email = '';
  formData.password = '';
};
</script>

<style scoped>
.login-form {
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

.login-btn {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:focus {
  outline: 2px solid rgba(33, 150, 243, 0.5);
  outline-offset: 2px;
}

.login-btn:disabled {
  opacity: 0.7;
}
</style>
