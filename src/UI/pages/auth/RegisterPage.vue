<template>
  <div class="register-page">
    <v-container fluid class="fill-height pa-0 ma-0">
      <!-- Animated Background -->
      <div class="animated-bg"></div>
      <div class="animated-bg bg2"></div>
      <div class="animated-bg bg3"></div>

      <!-- Main Content -->
      <v-row class="fill-height align-center justify-center" no-gutters>
        <v-col cols="12" sm="8" md="6" lg="5" xl="4" class="register-col">
          <v-slide-y-transition>
            <v-card class="register-card mx-auto" elevation="24" rounded="xl" theme="dark"
              :class="{ 'form-loaded': formLoaded }">
              <div class="card-content-wrapper pa-0">
                <!-- Brand Section -->
                <div class="brand-section text-center pt-10 pb-6">
                  <div class="logo-wrapper mb-2">
                    <v-icon icon="mdi-layers-triple" size="52" color="primary" class="logo-icon" />
                  </div>
                  <h1 class="text-h4 font-weight-bold mb-1 welcome-text">
                    Plan Business
                  </h1>
                  <p class="text-body-2 text-medium-emphasis">
                    Create your account
                  </p>
                </div>

                <!-- Form Container -->
                <v-card-text class="px-8 pt-2 pb-6">
                  <v-slide-y-transition>
                    <div v-show="formLoaded">
                      <RegisterForm :loading="isLoading" @submit="registerUser" @show-terms="handleShowTerms"
                        @go-to-login="handleGoToLogin" />
                    </div>
                  </v-slide-y-transition>
                </v-card-text>
              </div>
            </v-card>
          </v-slide-y-transition>
        </v-col>
      </v-row>
    </v-container>

    <!-- Terms and Conditions Dialog -->
    <v-dialog v-model="showTermsDialog" max-width="600px" scrollable>
      <v-card>
        <v-card-title class="text-h5 pa-6">
          Terms and Conditions
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-6" style="height: 400px;">
          <div class="terms-content">
            <h3 class="mb-3">1. Acceptance of Terms</h3>
            <p class="mb-4 text-black">
              By creating an account with Plan Business, you agree to be bound by these Terms and Conditions.
            </p>

            <h3 class="mb-3">2. Account Registration</h3>
            <p class="mb-4 text-black">
              You must provide accurate and complete information when creating your account. You are responsible for
              maintaining the confidentiality of your account credentials.
            </p>

            <h3 class="mb-3">3. Privacy Policy</h3>
            <p class="mb-4 text-black">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and
              protect your information.
            </p>

            <h3 class="mb-3">4. Service Usage</h3>
            <p class="mb-4 text-black">
              You agree to use our services in accordance with all applicable laws and regulations. Prohibited
              activities include but are not limited to fraud, spam, and unauthorized access.
            </p>

            <h3 class="mb-3">5. Limitation of Liability</h3>
            <p class="mb-4 text-black">
              Plan Business shall not be liable for any indirect, incidental, special, or consequential damages arising
              from your use of our services.
            </p>

            <h3 class="mb-3">6. Changes to Terms</h3>
            <p class="mb-4 text-black">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon
              posting.
            </p>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showTermsDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { userServiceKey } from '@/services/userService';
import RegisterForm from '@/UI/components/auth/RegisterForm.vue';

// Types
interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Dependencies
const router = useRouter();
const userService = inject(userServiceKey);

if (!userService) {
  throw new Error('userService is not available');
}

// State
const formLoaded = ref(false);
const isLoading = ref(false);
const showTermsDialog = ref(false);

// Event handlers
const registerUser = async (payload: RegisterPayload): Promise<void> => {
  try {
    isLoading.value = true;
    const { name, email, password } = payload;
    const user = await userService.registerUser(email, password, name);
    console.log('User registered:', user);
    router.push({ path: '/home' });
  } catch (error) {
    console.log('Registration error:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleShowTerms = (): void => {
  showTermsDialog.value = true;
};

const handleGoToLogin = (): void => {
  router.push({ name: 'Login' });
};

// Lifecycle
onMounted(() => {
  setTimeout(() => {
    formLoaded.value = true;
  }, 300);
});
</script>

<style scoped>
.register-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  background-color: #0c0c16;
}

.register-col {
  z-index: 10;
  padding: 20px;
}

.register-card {
  max-width: 480px;
  /* Slightly wider for more fields */
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

.brand-section {
  user-select: none;
}

.welcome-text {
  background: linear-gradient(90deg, #64b5f6, #42a5f5, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.logo-icon {
  animation: pulse 2s infinite;
  cursor: default;
}

.text-color {
  color: #000000;
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

/* Terms content styling */
.terms-content {
  line-height: 1.6;
}

.terms-content h3 {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.terms-content p {
  color: rgba(255, 255, 255, 0.87);
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

/* Responsive improvements */
@media (max-width: 600px) {
  .register-card {
    max-width: 90vw;
    margin: 0 5vw;
  }

  .brand-section {
    padding-top: 2rem !important;
  }

  .welcome-text {
    font-size: 1.5rem !important;
  }

  .register-col {
    padding: 16px;
  }
}
</style>
