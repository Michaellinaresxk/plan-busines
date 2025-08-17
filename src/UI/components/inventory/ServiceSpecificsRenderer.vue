<template>
  <div class="service-specifics">
    <div v-if="serviceConfig" class="specifics-chips">
      <!-- Mostrar detalles específicos del servicio -->
      <v-chip
        v-if="service.duration"
        size="x-small"
        variant="outlined"
        :color="serviceConfig.color">
        {{ service.duration }}h
      </v-chip>

      <v-chip
        v-if="service.maxCapacity"
        size="x-small"
        variant="outlined"
        color="info">
        {{ service.maxCapacity }} pax
      </v-chip>

      <v-chip
        v-if="service.location"
        size="x-small"
        variant="outlined"
        color="secondary">
        {{ service.location }}
      </v-chip>
    </div>

    <!-- Tags del servicio -->
    <div v-if="service.tags && service.tags.length > 0" class="service-tags mt-1">
      <v-chip
        v-for="tag in service.tags.slice(0, 2)"
        :key="tag"
        size="x-small"
        variant="tonal"
        color="grey"
        class="mr-1">
        {{ tag }}
      </v-chip>
      <span v-if="service.tags.length > 2" class="text-caption text-medium-emphasis">
        +{{ service.tags.length - 2 }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getServiceConfig } from '@/config/simpleServiceConfig';
import type { ServiceView } from '@/views/ServiceView';

interface Props {
  service: ServiceView;
}

const props = defineProps<Props>();

const serviceConfig = computed(() => {
  return getServiceConfig(props.service.category);
});
</script>

<style scoped>
.service-specifics {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.specifics-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.service-tags {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
</style>
