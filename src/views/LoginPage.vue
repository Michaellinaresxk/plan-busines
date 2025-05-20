<template>
  <div class="login-page">
    <v-container fluid class="fill-height pa-0 ma-0">
      <div class="animated-bg"></div>
      <div class="animated-bg bg2"></div>
      <div class="animated-bg bg3"></div>

      <v-row class="fill-height align-center justify-center" no-gutters>
        <v-col cols="12" sm="8" md="6" lg="5" xl="4" class="login-col">

          <v-slide-y-transition>
            <v-card
              class="login-card mx-auto"
              elevation="24"
              rounded="xl"
              theme="dark"
              :class="{'form-loaded': formLoaded}"
            >
              <div class="card-content-wrapper pa-0">
                <div class="brand-section text-center pt-10 pb-6">
                  <div class="logo-wrapper mb-2">
                    <v-icon
                      icon="mdi-layers-triple"
                      size="52"
                      color="primary"
                      class="logo-icon"
                    ></v-icon>
                  </div>
                  <h1 class="text-h4 font-weight-bold mb-1 welcome-text">Welcome Back</h1>
                  <p class="text-body-2 text-medium-emphasis">Sign in to your account</p>
                </div>

                <v-card-text class="px-8 pt-2 pb-6">
                  <v-slide-y-transition>
                    <v-form
                      ref="loginForm"
                      v-model="isFormValid"
                      @submit.prevent="handleLogin"
                      class="login-form"
                      v-show="formLoaded"
                    >
                      <v-text-field
                        v-model="email"
                        :rules="emailRules"
                        label="Email"
                        prepend-inner-icon="mdi-email-outline"
                        type="email"
                        variant="outlined"
                        class="mb-2 input-field"
                        :error-messages="errors.email"
                        @focus="clearError('email')"
                        density="comfortable"
                        bg-color="rgba(255, 255, 255, 0.05)"
                        color="primary"
                        required
                        hide-details="auto"
                      ></v-text-field>

                      <v-text-field
                        v-model="password"
                        :rules="passwordRules"
                        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append-inner="showPassword = !showPassword"
                        :type="showPassword ? 'text' : 'password'"
                        label="Password"
                        prepend-inner-icon="mdi-lock-outline"
                        variant="outlined"
                        class="mb-2 mt-6 input-field"
                        :error-messages="errors.password"
                        @focus="clearError('password')"
                        density="comfortable"
                        bg-color="rgba(255, 255, 255, 0.05)"
                        color="primary"
                        required
                        hide-details="auto"
                      ></v-text-field>

                      <div class="d-flex justify-space-between align-center my-5">
                        <v-checkbox
                          v-model="rememberMe"
                          color="primary"
                          hide-details
                          label="Remember me"
                          class="mt-0 text-caption"
                          density="compact"
                        ></v-checkbox>

                        <v-btn
                          variant="text"
                          color="primary"
                          class="text-body-2 text-none"
                          @click="forgotPassword"
                          size="small"
                        >
                          Forgot Password?
                        </v-btn>
                      </div>

                      <v-btn
                        block
                        color="primary"
                        size="large"
                        type="submit"
                        :loading="isLoading"
                        :disabled="!isFormValid || isLoading"
                        class="login-btn mt-2 mb-8"
                        elevation="4"
                        min-height="52px"
                        rounded="lg"
                      >
                        <span class="text-button font-weight-bold">Sign In</span>
                      </v-btn>
                    </v-form>
                  </v-slide-y-transition>
                </v-card-text>

                <v-divider class="mx-8"></v-divider>

                <v-card-actions class="pa-8 pt-6 pb-8 justify-center">
                  <span class="text-body-2 text-medium-emphasis">Don't have an account?</span>
                  <v-btn
                    variant="text"
                    color="primary"
                    class="text-none font-weight-bold ms-2"
                    @click="goToSignUp"
                  >
                    Sign Up
                  </v-btn>
                </v-card-actions>
              </div>
            </v-card>
          </v-slide-y-transition>
        </v-col>
      </v-row>

      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        timeout="3000"
        location="top"
        rounded="lg"
        elevation="24"
      >
        <div class="d-flex align-center">
          <v-icon
            :icon="snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"
            start
            class="mr-2"
          ></v-icon>
          {{ snackbarText }}
        </div>
        <template v-slot:actions>
          <v-btn variant="text" icon="mdi-close" @click="showSnackbar = false"></v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Define types
interface ErrorMessages {
  email: string;
  password: string;
}

// Router and store
const router = useRouter();
const authStore = useAuthStore();

// Form refs
const loginForm = ref<any>(null);

// Animation state
const formLoaded = ref(false);

// Form state
const isFormValid = ref(false);
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);

// Error handling
const errors = reactive<ErrorMessages>({
  email: '',
  password: ''
});

// Snackbar
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('error');

// Validation rules
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
];

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
];

// Methods
const clearError = (field: keyof ErrorMessages) => {
  errors[field] = '';
};

const handleLogin = async () => {
  // Reset errors
  errors.email = '';
  errors.password = '';

  // Form validation
  const isValid = await loginForm.value?.validate();

  if (!isValid.valid) {
    return;
  }

  try {
    isLoading.value = true;

    // Call login from auth store
    await authStore.login({
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value
    });

    // Success notification
    snackbarColor.value = 'success';
    snackbarText.value = 'Login successful!';
    showSnackbar.value = true;

    // Redirect to dashboard after short delay
    setTimeout(() => {
      router.push({ name: 'Dashboard' });
    }, 1000);

  } catch (error: any) {
    // Handle errors
    if (error.response?.data?.errors) {
      // Map backend validation errors to form fields
      const backendErrors = error.response.data.errors;

      if (backendErrors.email) {
        errors.email = backendErrors.email[0];
      }

      if (backendErrors.password) {
        errors.password = backendErrors.password[0];
      }
    } else {
      // General error
      snackbarColor.value = 'error';
      snackbarText.value = error.message || 'Login failed. Please try again.';
      showSnackbar.value = true;
    }
  } finally {
    isLoading.value = false;
  }
};

const forgotPassword = () => {
  router.push({ name: 'ForgotPassword' });
};

const goToSignUp = () => {
  router.push({ name: 'Register' });
};

// Animate form on load
onMounted(() => {
  setTimeout(() => {
    formLoaded.value = true;
  }, 300);
});
</script>

<style scoped>
.login-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  background-color: #0c0c16;
}

.login-col {
  z-index: 10;
  padding: 20px;
}

.login-card {
  max-width: 460px;
  width: 100%;
  overflow: hidden;
  backdrop-filter: blur(20px);
  background: rgba(30, 30, 46, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
}

.form-loaded {
  transform: translateY(0);
  opacity: 1;
}

.login-form {
  width: 100%;
  transition: all 0.4s ease;
}

.welcome-text {
  background: linear-gradient(90deg, #64B5F6, #42A5F5, #2196F3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.input-field {
  transition: all 0.3s ease;
}

.input-field:hover {
  transform: translateY(-2px);
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
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.7s;
}

.login-btn:hover::before {
  left: 100%;
}

.logo-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Animated background */
.animated-bg {
  position: absolute;
  width: 70vmax;
  height: 70vmax;
  border-radius: 50%;
  background: rgba(33, 150, 243, 0.1);
  right: -30vmax;
  top: -10vmax;
  z-index: 0;
  animation: move 10s linear alternate infinite;
}

.bg2 {
  background: rgba(33, 150, 243, 0.05);
  left: -20vmax;
  top: -50vmax;
  transform: scale(0.8);
  animation: move 15s linear alternate-reverse infinite;
}

.bg3 {
  background: rgba(33, 150, 243, 0.07);
  right: 30vmax;
  bottom: -50vmax;
  transform: scale(1.2);
  animation: move 20s linear infinite;
}

@keyframes move {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  25% {
    transform: translate(10%, 10%) rotate(3deg) scale(1.05);
  }
  50% {
    transform: translate(5%, 15%) rotate(-3deg) scale(1.1);
  }
  75% {
    transform: translate(15%, 5%) rotate(5deg) scale(1.05);
  }
  100% {
    transform: translate(0%, 0%) rotate(0deg) scale(1);
  }
}
</style>
