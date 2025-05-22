<template>
  <div class="login-page">
    <v-container fluid class="fill-height pa-0 ma-0">
      <!-- Animated Background -->
      <div class="animated-bg"></div>
      <div class="animated-bg bg2"></div>
      <div class="animated-bg bg3"></div>

      <!-- Main Content -->
      <v-row class="fill-height align-center justify-center" no-gutters>
        <v-col cols="12" sm="8" md="6" lg="5" xl="4" class="login-col">
          <v-slide-y-transition>
            <v-card class="login-card mx-auto" elevation="24" rounded="xl" theme="dark"
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
                    Sign in to your account
                  </p>
                </div>

                <!-- Form Container -->
                <v-card-text class="px-8 pt-2 pb-6">
                  <v-slide-y-transition>
                    <div v-show="formLoaded">
                      <LoginForm :loading="isLoading" @submit="loginUser" @forgot-password="handleForgotPassword"
                        @go-to-signup="handleGoToSignup" />
                    </div>
                  </v-slide-y-transition>
                </v-card-text>
              </div>
            </v-card>
          </v-slide-y-transition>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { userServiceKey } from '@/services/userService';
import LoginForm from '@/UI/components/auth/LoginForm.vue';

// Types
interface LoginPayload {
  email: string;
  password: string;
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

// Event handlers
const loginUser = async (payload: LoginPayload): Promise<void> => {
  try {
    isLoading.value = true;
    const user = await userService.loginUser(payload.email, payload.password);
    console.log('User signed in:', user);
    router.push({ path: '/dashboard' });
  } catch (error) {
    console.log('Login error:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = (): void => {
  router.push({ name: 'ForgotPassword' });
};

const handleGoToSignup = (): void => {
  router.push({ name: 'Register' });
};

// Lifecycle
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

/* Responsive improvements */
@media (max-width: 600px) {
  .login-card {
    max-width: 90vw;
    margin: 0 5vw;
  }

  .brand-section {
    padding-top: 2rem !important;
  }

  .welcome-text {
    font-size: 1.5rem !important;
  }

  .login-col {
    padding: 16px;
  }
}
</style>
