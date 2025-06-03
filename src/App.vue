<script setup lang="ts">
import { RouterView } from 'vue-router';
import { provide } from 'vue';
import { userService, userServiceKey } from "@/services/userService";
import { supplierService, supplierServiceKey } from "@/services/SupplierService";

provide(userServiceKey, userService);
provide(reservationServiceKey, reservationService);
provide(supplierServiceKey, supplierService);

import {
  reservationService,
  reservationServiceKey,
  whatsappService,
  whatsappServiceKey,
  reservationSupplierService,
  reservationSupplierServiceKey
} from "@/services/ReservationService";

// ✅ Provide all services
provide(userServiceKey, userService);
provide(reservationServiceKey, reservationService);
provide(supplierServiceKey, supplierService);
provide(whatsappServiceKey, whatsappService);
provide(reservationSupplierServiceKey, reservationSupplierService);
</script>

<template>
  <RouterView />
</template>
