<template>
  <v-card class="rounded-lg shadow-sm">
    <v-card-title class="d-flex align-center py-4 px-6">
      <h2 class="text-h6 font-weight-bold">Calendario de Reservas</h2>
      <v-spacer></v-spacer>

      <div class="d-flex align-center">
        <v-btn icon="mdi-chevron-left" variant="text" density="comfortable" @click="prevMonth" class="mr-2"></v-btn>

        <h3 class="text-subtitle-1 font-weight-medium mr-2">
          {{ currentMonthName }} {{ currentYear }}
        </h3>

        <v-btn icon="mdi-chevron-right" variant="text" density="comfortable" @click="nextMonth"></v-btn>

        <v-btn variant="text" color="primary" class="ml-4" @click="setCurrentMonth"> Hoy </v-btn>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <!-- Días de la semana -->
      <div class="d-flex">
        <div v-for="day in weekDays" :key="day" class="calendar-header">
          {{ day }}
        </div>
      </div>

      <!-- Días del mes -->
      <div class="calendar-container">
        <div v-for="(day, index) in calendarDays" :key="index" :class="[
          'calendar-day',
          {
            'current-month': day.currentMonth,
            today: day.isToday,
            'has-events': day.events && day.events.length > 0,
            weekend: day.isWeekend
          }
        ]" @click="day.currentMonth && selectDay(day)">
          <div class="day-number">{{ day.day }}</div>

          <!-- Indicadores de eventos del día -->
          <div class="events-container" v-if="day.currentMonth && day.events && day.events.length > 0">
            <div v-for="(event, i) in day.events.slice(0, 3)" :key="i" class="event-indicator"
              :style="{ backgroundColor: statusColors[event.status] }"
              :title="event.clientName + ' - ' + event.service">
              <span class="event-time">{{ formatTime(event.time) }}</span>
              <span class="event-title text-truncate">{{ event.clientName }}</span>
            </div>

            <!-- Indicador de más eventos -->
            <div v-if="day.events.length > 3" class="more-events">
              +{{ day.events.length - 3 }} más
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>

  <!-- Dialog de detalle del día seleccionado -->
  <v-dialog v-model="showDayDetail" max-width="600px">
    <v-card class="rounded-lg">
      <v-toolbar color="primary" class="rounded-t-lg">
        <v-toolbar-title class="text-white">
          {{ selectedDay && selectedDay.fullDate }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" color="white" @click="showDayDetail = false"></v-btn>
      </v-toolbar>

      <v-card-text class="pt-6 pb-2">
        <h3 class="text-h6 mb-4">Reservas del día</h3>

        <v-list v-if="selectedDay && selectedDay.events && selectedDay.events.length > 0">
          <template v-for="(event, index) in selectedDay.events" :key="index">
            <v-list-item link>
              <template v-slot:prepend>
                <v-avatar :color="statusColors[event.status]" size="36">
                  <span class="text-white text-body-2">{{ getInitials(event.clientName) }}</span>
                </v-avatar>
              </template>

              <v-list-item-title>{{ event.clientName }}</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip size="x-small" :color="statusColors[event.status]" class="mr-2" variant="outlined">
                  {{ getStatusText(event.status) }}
                </v-chip>
                {{ event.service }} - {{ event.time }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn icon="mdi-eye" variant="text" color="primary" size="small"></v-btn>
              </template>
            </v-list-item>

            <v-divider v-if="index < selectedDay.events.length - 1"></v-divider>
          </template>
        </v-list>

        <v-alert v-else type="info" variant="tonal" class="mt-2">
          No hay reservas programadas para este día.
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-6 pt-2">
        <v-btn variant="text" color="primary" prepend-icon="mdi-email">
          Enviar recordatorios
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="outlined" color="primary" @click="showDayDetail = false"> Cerrar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  WEEK_DAYS,
  MONTHS,
  STATUS_COLORS,
  STATUS_TEXT,
  MOCK_CALENDAR_EVENTS
} from '@/constants/reservation';
import { getInitials, formatTime } from '@/utils/reservationUtils';


// Estado del calendario
const currentDate = ref(new Date());
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const selectedDay = ref(null);
const showDayDetail = ref(false);

// Pasar constantes a variables reactivas para el template
const weekDays = WEEK_DAYS;
const statusColors = STATUS_COLORS;

// Nombre del mes actual
const currentMonthName = computed(() => {
  return MONTHS[currentMonth.value];
});

// Datos de eventos (usamos los mock data por ahora)
const eventData = ref(MOCK_CALENDAR_EVENTS);

// Generar los días del calendario
const calendarDays = computed(() => {
  const days = [];
  const today = new Date();

  // Obtener el primer día del mes
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
  let dayOfWeek = firstDay.getDay();
  dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Obtener el número de días en el mes actual
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();

  // Obtener el número de días en el mes anterior
  const daysInPrevMonth = new Date(currentYear.value, currentMonth.value, 0).getDate();

  // Añadir días del mes anterior
  for (let i = dayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const month = currentMonth.value === 0 ? 11 : currentMonth.value - 1;
    const year = currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value;

    const date = new Date(year, month, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    days.push({
      day,
      month,
      year,
      currentMonth: false,
      isToday: false,
      isWeekend,
      fullDate: formatDate(date),
      events: []
    });
  }

  // Añadir días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear.value, currentMonth.value, day);
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const fullDate = formatDate(date);

    // Asignar eventos al día (simulado)
    // En una aplicación real, estos eventos vendrían de la API
    const dayEvents = getEventsForDay(day);

    days.push({
      day,
      month: currentMonth.value,
      year: currentYear.value,
      currentMonth: true,
      isToday,
      isWeekend,
      fullDate,
      events: dayEvents
    });
  }

  // Calcular cuántos días del siguiente mes necesitamos para completar la cuadrícula
  const remainingDays = 42 - days.length; // 6 filas de 7 días

  // Añadir días del siguiente mes
  for (let day = 1; day <= remainingDays; day++) {
    const month = currentMonth.value === 11 ? 0 : currentMonth.value + 1;
    const year = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value;

    const date = new Date(year, month, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    days.push({
      day,
      month,
      year,
      currentMonth: false,
      isToday: false,
      isWeekend,
      fullDate: formatDate(date),
      events: []
    });
  }

  return days;
});

// Funciones para el calendario
const setCurrentMonth = () => {
  const now = new Date();
  currentMonth.value = now.getMonth();
  currentYear.value = now.getFullYear();
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const selectDay = (day) => {
  selectedDay.value = day;
  showDayDetail.value = true;
};

// Funciones de utilidad
const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('es-ES', options);
};

const getStatusText = (status: string) => {
  return STATUS_TEXT[status as keyof typeof STATUS_TEXT] || status;
};

// Distribuir eventos en el calendario (simulado)
const getEventsForDay = (day: number) => {
  // Para simular eventos en diferentes días del mes actual
  // En una aplicación real, estos datos vendrían de la API
  if (day % 5 === 0) {
    // Días múltiplos de 5 tienen más eventos
    return [eventData.value[0], eventData.value[1], eventData.value[2], eventData.value[3]];
  } else if (day % 3 === 0) {
    // Días múltiplos de 3 tienen algunos eventos
    return [eventData.value[4], eventData.value[5]];
  } else if (day % 2 === 0) {
    // Días pares tienen un evento
    return [eventData.value[6]];
  }

  // Otros días no tienen eventos
  return [];
};

onMounted(() => {
  setCurrentMonth();
});
</script>

<style scoped>
.calendar-header {
  flex: 1;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.8);
  padding: 10px 0;
}

.calendar-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: 4px;
  margin-top: 4px;
}

.calendar-day {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 8px;
  padding: 8px;
  min-height: 100px;
  position: relative;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  transition: all 0.2s ease;
}

.calendar-day:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  cursor: pointer;
}

.current-month {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.today {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
}

.has-events {
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
}

.weekend:not(.today) {
  background-color: rgba(var(--v-theme-surface-variant), 0.15);
}

.day-number {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-weight: 500;
  border-radius: 50%;
  margin-bottom: 4px;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.today .day-number {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

.events-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.event-indicator {
  display: flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: white;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.event-time {
  font-weight: 600;
  margin-right: 4px;
  font-size: 0.7rem;
}

.event-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-events {
  font-size: 0.7rem;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-top: 2px;
}
</style>
