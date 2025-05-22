<template>
  <v-snackbar :model-value="show" @update:model-value="$emit('update:show', $event)" :color="color" :timeout="timeout"
    location="top" rounded="lg" elevation="24">
    <div class="d-flex align-center">
      <v-icon :icon="iconName" start class="mr-2" />
      {{ message }}
    </div>
    <template v-slot:actions>
      <v-btn variant="text" icon="mdi-close" @click="$emit('update:show', false)" />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Props
interface Props {
  show: boolean;
  message: string;
  color?: 'success' | 'error' | 'warning' | 'info';
  timeout?: number;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'error',
  timeout: 4000
});

// Events
defineEmits<{
  'update:show': [value: boolean];
}>();

// Computed
const iconName = computed(() => {
  switch (props.color) {
    case 'success':
      return 'mdi-check-circle';
    case 'warning':
      return 'mdi-alert';
    case 'info':
      return 'mdi-information';
    default:
      return 'mdi-alert-circle';
  }
});
</script>
