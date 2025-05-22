<script setup lang="ts">
import { RouterView } from 'vue-router';
import { provide } from 'vue';
import { userService, userServiceKey } from "@/services/userService";
import { reservationService, reservationServiceKey } from "@/services/ReservationService";

provide(userServiceKey, userService);
provide(reservationServiceKey, reservationService);
</script>

<template>
  <RouterView />
</template>
