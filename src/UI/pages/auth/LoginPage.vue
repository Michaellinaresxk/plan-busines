<template>
  <div class="login-page">
    <!-- Decorative blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <v-container fluid class="fill-height pa-0 ma-0">
      <v-row class="fill-height align-center justify-center" no-gutters>
        <v-col cols="12" sm="8" md="5" lg="4" xl="3" class="login-col">
          <div class="login-card" :class="{ 'login-card--visible': formLoaded }">

            <!-- Brand -->
            <div class="login-brand">
              <div class="login-logo">
                <v-icon icon="mdi-calendar-check" size="24" color="white" />
              </div>
              <h1 class="login-title">Plan<span class="login-title-accent">Business</span></h1>
              <p class="login-subtitle">Accede a tu panel de control</p>
            </div>

            <!-- Form -->
            <div class="login-form-wrapper" v-show="formLoaded">
              <LoginForm
                :loading="isLoading"
                @submit="loginUser"
                @forgot-password="handleForgotPassword"
                @go-to-signup="handleGoToSignup"
              />
            </div>

          </div>
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

interface LoginPayload {
  email: string;
  password: string;
}

const router = useRouter();
const userService = inject(userServiceKey);

if (!userService) throw new Error('userService is not available');

const formLoaded = ref(false);
const isLoading = ref(false);

const loginUser = async (payload: LoginPayload) => {
  try {
    isLoading.value = true;
    await userService!.loginUser(payload.email, payload.password);
    router.push({ path: '/dashboard' });
  } catch (error) {
    console.error('Login error:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = () => router.push({ name: 'ForgotPassword' });
const handleGoToSignup = () => router.push({ name: 'Register' });

onMounted(() => setTimeout(() => { formLoaded.value = true; }, 200));
</script>

<style scoped>
/* ─── Page ─── */
.login-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  background: #0A0A14;
}

.login-col {
  z-index: 10;
  padding: 20px;
}

/* ─── Decorative Blobs ─── */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
  pointer-events: none;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #6366F1, transparent 70%);
  top: -120px;
  right: -80px;
  animation: blobFloat 14s ease-in-out alternate infinite;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #8B5CF6, transparent 70%);
  bottom: -100px;
  left: -60px;
  animation: blobFloat 18s ease-in-out alternate-reverse infinite;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #3B82F6, transparent 70%);
  top: 40%;
  left: 30%;
  opacity: 0.2;
  animation: blobFloat 22s ease-in-out infinite;
}

@keyframes blobFloat {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(30px, -20px) scale(1.05); }
  66%  { transform: translate(-20px, 15px) scale(0.97); }
  100% { transform: translate(10px, -10px) scale(1.02); }
}

/* ─── Card ─── */
.login-card {
  background: rgba(15, 15, 30, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 40px 36px 36px;
  max-width: 440px;
  margin: 0 auto;
  transform: translateY(24px);
  opacity: 0;
  transition: transform 0.65s cubic-bezier(0.19, 1, 0.22, 1),
              opacity 0.65s cubic-bezier(0.19, 1, 0.22, 1);
}

.login-card--visible {
  transform: translateY(0);
  opacity: 1;
}

/* ─── Brand section ─── */
.login-brand {
  text-align: center;
  margin-bottom: 36px;
}

.login-logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  animation: logoPulse 3s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% { box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4); }
  50%       { box-shadow: 0 8px 32px rgba(99, 102, 241, 0.65); }
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.login-title-accent {
  color: #818CF8;
}

.login-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

/* ─── Form wrapper ─── */
.login-form-wrapper {
  /* LoginForm handles its own styles */
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .login-card {
    padding: 32px 24px 28px;
    border-radius: 20px;
  }

  .login-logo {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }

  .login-title {
    font-size: 1.5rem;
  }
}
</style>
