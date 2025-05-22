<template>
  <v-app-bar elevation="0" border class="px-2" color="primary">
    <!-- Botón de menú móvil -->
    <v-app-bar-nav-icon v-if="!mdAndUp" @click.stop="toggleDrawer" color="primary"></v-app-bar-nav-icon>

    <!-- Botón de menú desktop -->
    <v-btn v-else @click.stop="toggleRail" icon="mdi-menu" variant="text" color="primary"></v-btn>

    <!-- Título -->
    <v-app-bar-title class="text-md-h6 font-weight-medium d-none d-sm-flex">
      Plan-Busines
    </v-app-bar-title>

    <v-spacer></v-spacer>



    <!-- Notificaciones -->
    <v-btn icon="mdi-bell" variant="text" class="ml-2">
      <v-badge color="error" :content="3" offset-x="3" offset-y="3"></v-badge>
    </v-btn>


    <!-- Avatar usuario -->
    <v-menu anchor="bottom end">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" variant="text" class="ml-2">
          <v-avatar size="40" color="text-white" variant="tonal">
            <span class="text-caption">RM</span>
          </v-avatar>
          <v-icon class="ml-1 d-none d-sm-flex" size="small">mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-card min-width="200" elevation="4" rounded="lg">
        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-account-outline" title="Mi perfil" rounded="lg"></v-list-item>
          <v-list-item prepend-icon="mdi-cog-outline" title="Configuración" rounded="lg"></v-list-item>
          <v-divider class="my-1"></v-divider>
          <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" rounded="lg" class="text-error"></v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Props
const props = defineProps<{
  drawer: boolean;
  rail: boolean;
  mdAndUp: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:drawer', value: boolean): void;
  (e: 'update:rail', value: boolean): void;
  (e: 'toggle-theme'): void;
}>();

// Estado
const search = ref('');

// Métodos
const toggleDrawer = () => {
  emit('update:drawer', !props.drawer);
};

const toggleRail = () => {
  emit('update:rail', !props.rail);
};
</script>

<style scoped>
.search-field {
  transition: all 0.3s ease;
}

.search-field:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(var(--v-theme-on-surface), 0.05);
}
</style>
