<script setup lang="ts">
import { RouterView } from 'vue-router';
import { provide } from 'vue';
import { userService, userServiceKey } from "@/services/userService";

provide(userServiceKey, userService);

</script>

<template>
  <RouterView />
</template>
