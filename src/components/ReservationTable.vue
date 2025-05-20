<template>
  <div class="reservation-list-container">
    <header class="reservation-header">
      <h2 class="heading">Pending Reservations</h2>

      <div class="controls">
        <div class="search-container" :class="{ 'is-focused': isSearchFocused }">
          <IconSearch class="search-icon" />
          <input
            class="search-input"
            type="text"
            placeholder="Search reservations..."
            v-model="search"
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
          />
          <button
            v-if="search"
            class="search-clear"
            @click="search = ''"
            aria-label="Clear search"
          >
            <IconClear />
          </button>
        </div>

        <div class="filter-container" ref="filterRef">
          <button
            class="filter-button"
            :class="{ 'is-active': isFilterOpen }"
            @click="toggleFilter"
            aria-label="Open filters"
          >
            <IconFilter class="filter-icon" />
            <span>Filters</span>
          </button>

          <div v-show="isFilterOpen" class="filter-dropdown">
            <h3 class="filter-heading">Filter Reservations</h3>

            <div class="filter-group">
              <label>Service Type</label>
              <select v-model="filterService" class="filter-select">
                <option v-for="option in serviceOptions" :key="option.value" :value="option.value">
                  {{ option.title }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label>Time Period</label>
              <select v-model="filterDate" class="filter-select">
                <option v-for="option in dateOptions" :key="option.value" :value="option.value">
                  {{ option.title }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label>Sort By</label>
              <select v-model="sortBy" class="filter-select">
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.title }}
                </option>
              </select>
            </div>

            <div class="filter-actions">
              <button class="filter-reset" @click="resetFilters">Reset</button>
              <button class="filter-apply" @click="applyFilters">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="reservation-table-container" :class="{ 'is-loading': loading }">
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <span>Loading reservations...</span>
      </div>

      <table class="reservation-table" v-show="!loading && filteredReservations.length > 0">
        <thead>
          <tr>
            <th v-for="header in tableHeaders" :key="header.key" :style="{ width: header.width }">
              <div class="th-content">
                <span>{{ header.title }}</span>
                <button
                  v-if="header.sortable"
                  class="sort-button"
                  :class="{ 'active': currentSort === header.key, 'desc': sortDirection === 'desc' }"
                  @click="handleSort(header.key)"
                >
                  <IconSort />
                </button>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in displayedReservations" :key="item.id" class="table-row">
            <!-- Client column -->
            <td class="client-cell">
              <div class="client-content">
                <div class="client-avatar" :style="{ backgroundColor: getServiceGradient(item.service) }">
                  {{ getInitials(item.clientName) }}
                </div>
                <div class="client-info">
                  <span class="client-name">{{ item.clientName }}</span>
                  <span class="client-email">{{ item.email }}</span>
                </div>
              </div>
            </td>

            <!-- Service column -->
            <td class="service-cell">
              <span class="service-tag" :style="{ borderColor: getServiceColor(item.service) }">
                {{ item.service }}
              </span>
            </td>

            <!-- Date and time column -->
            <td class="datetime-cell">
              <div class="datetime-content">
                <div class="date-item">
                  <IconCalendar :color="getServiceColor(item.service)" />
                  <span>{{ item.date }}</span>
                </div>
                <div class="time-item">
                  <IconClock :color="getServiceColor(item.service)" />
                  <span>{{ item.time }}</span>
                </div>
              </div>
            </td>

            <!-- Priority column -->
            <td class="priority-cell">
              <span
                class="priority-indicator"
                :class="item.isPriority ? 'is-priority' : 'is-normal'"
              >
                {{ item.isPriority ? 'Priority' : 'Normal' }}
              </span>
            </td>

            <!-- Wait time column -->
            <td class="waittime-cell">
              <div class="waittime-content" :class="getWaitTimeClass(item.timeAgo)">
                <IconHistory :color="getWaitTimeColor(item.timeAgo)" />
                <span>{{ item.timeAgo }}</span>
              </div>
            </td>

            <!-- Actions column -->
            <td class="actions-cell">
              <div class="actions-content">
                <button
                  class="action-button approve"
                  :disabled="approvingId === item.id"
                  @click="approveReservation(item)"
                  aria-label="Approve reservation"
                >
                  <IconApprove v-if="approvingId !== item.id" />
                  <IconSpinner v-else class="spinner" />
                </button>

                <button
                  class="action-button reject"
                  :disabled="rejectingId === item.id"
                  @click="rejectReservation(item)"
                  aria-label="Reject reservation"
                >
                  <IconDecline v-if="rejectingId !== item.id" />
                  <IconSpinner v-else class="spinner" />
                </button>

                <button
                  class="action-button view"
                  @click="viewDetails(item)"
                  aria-label="View details"
                >
                  <IconView />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div v-if="!loading && filteredReservations.length === 0" class="empty-state">
        <IconCalendarEmpty class="empty-icon" />
        <h3 class="empty-title">No Pending Reservations</h3>
        <p class="empty-message">There are no reservations matching your search criteria.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="filteredReservations.length > 0">
      <div class="pagination-info">
        <span>Showing {{ paginationStart }} - {{ paginationEnd }} of {{ filteredReservations.length }}</span>
      </div>

      <div class="pagination-controls">
        <button
          class="pagination-button"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          aria-label="Previous page"
        >
          <IconPrevious />
        </button>

        <div class="pagination-pages">
          <button
            v-for="pageNum in displayedPages"
            :key="pageNum"
            class="pagination-page"
            :class="{ 'active': currentPage === pageNum }"
            @click="goToPage(pageNum)"
          >
            {{ pageNum }}
          </button>
        </div>

        <button
          class="pagination-button"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
          aria-label="Next page"
        >
          <IconNext />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useClickOutside } from '@/composables/useClickOutside';

// Import icons
import IconSearch from './icons/IconSearch.vue';
import IconClear from './icons/IconClear.vue';
import IconFilter from './icons/IconFilter.vue';
import IconSort from './icons/IconSort.vue';
import IconCalendar from './icons/IconCalendar.vue';
import IconClock from './icons/IconClock.vue';
import IconHistory from './icons/IconHistory.vue';
import IconApprove from './icons/IconApprove.vue';
import IconDecline from './icons/IconDecline.vue';
import IconView from './icons/IconView.vue';
import IconSpinner from './icons/IconSpinner.vue';
import IconCalendarEmpty from './icons/IconCalendarEmpty.vue';
import IconPrevious from './icons/IconPrevious.vue';
import IconNext from './icons/IconNext.vue';

interface Reservation {
  id: number;
  clientName: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  timeAgo: string;
  isPriority: boolean;
}

// Props and Emits
const emit = defineEmits<{
  (e: 'view-details', reservation: Reservation): void;
  (e: 'approve', id: number): void;
  (e: 'reject', id: number): void;
}>();

// State
const search = ref('');
const isSearchFocused = ref(false);
const loading = ref(false);
const approvingId = ref<number | null>(null);
const rejectingId = ref<number | null>(null);
const isFilterOpen = ref(false);
const filterRef = ref<HTMLElement | null>(null);

// Filter state
const filterService = ref('');
const filterDate = ref('');
const sortBy = ref('dateNewest');
const currentSort = ref('dateTime');
const sortDirection = ref<'asc' | 'desc'>('asc');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(6);
const totalItems = ref(0);

// Service color palette - more sophisticated, luxurious colors
const serviceColorMap = {
  'Corte de cabello': '#6366F1', // Indigo
  'Manicura': '#EC4899',         // Pink
  'Pedicura': '#8B5CF6',         // Purple
  'Masaje': '#10B981',           // Emerald
  'Tratamiento facial': '#F59E0B' // Amber
};

const serviceGradientMap = {
  'Corte de cabello': 'linear-gradient(135deg, #6366F1, #4F46E5)',
  'Manicura': 'linear-gradient(135deg, #EC4899, #DB2777)',
  'Pedicura': 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'Masaje': 'linear-gradient(135deg, #10B981, #059669)',
  'Tratamiento facial': 'linear-gradient(135deg, #F59E0B, #D97706)'
};

// Filter options
const serviceOptions = [
  { title: 'All Services', value: '' },
  { title: 'Haircut', value: 'Corte de cabello' },
  { title: 'Manicure', value: 'Manicura' },
  { title: 'Pedicure', value: 'Pedicura' },
  { title: 'Massage', value: 'Masaje' },
  { title: 'Facial Treatment', value: 'Tratamiento facial' }
];

const dateOptions = [
  { title: 'All Periods', value: '' },
  { title: 'Today', value: 'today' },
  { title: 'Tomorrow', value: 'tomorrow' },
  { title: 'This Week', value: 'thisWeek' },
  { title: 'Next Week', value: 'nextWeek' },
  { title: 'This Month', value: 'thisMonth' }
];

const sortOptions = [
  { title: 'Most Recent', value: 'dateNewest' },
  { title: 'Oldest First', value: 'dateOldest' },
  { title: 'Next Appointment', value: 'nextAppointment' },
  { title: 'Client Name (A-Z)', value: 'nameAsc' },
  { title: 'Client Name (Z-A)', value: 'nameDesc' },
  { title: 'Priority First', value: 'priority' }
];

// Table configuration
const tableHeaders = [
  {
    title: 'Client',
    key: 'clientName',
    sortable: true,
    width: '25%'
  },
  {
    title: 'Service',
    key: 'service',
    sortable: true,
    width: '15%'
  },
  {
    title: 'Date & Time',
    key: 'dateTime',
    sortable: true,
    width: '20%'
  },
  {
    title: 'Priority',
    key: 'isPriority',
    sortable: true,
    width: '10%'
  },
  {
    title: 'Wait Time',
    key: 'timeAgo',
    sortable: true,
    width: '15%'
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    width: '15%'
  }
];

// Mock reservation data
const reservations = ref<Reservation[]>([
  {
    id: 1,
    clientName: 'Juan Pérez',
    email: 'juan.perez@gmail.com',
    phone: '+34 612 345 678',
    service: 'Corte de cabello',
    date: '24/05/2025',
    time: '10:30 AM',
    notes: 'Preferiblemente con Carlos, el estilista de siempre.',
    timeAgo: '2 horas',
    isPriority: true
  },
  {
    id: 2,
    clientName: 'María López',
    email: 'maria.lopez@hotmail.com',
    phone: '+34 623 456 789',
    service: 'Manicura',
    date: '25/05/2025',
    time: '16:00 PM',
    notes: '',
    timeAgo: '5 horas',
    isPriority: false
  },
  {
    id: 3,
    clientName: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@outlook.com',
    phone: '+34 634 567 890',
    service: 'Masaje',
    date: '26/05/2025',
    time: '12:15 PM',
    notes: 'Masaje terapéutico para aliviar dolor de espalda.',
    timeAgo: '1 día',
    isPriority: true
  },
  {
    id: 4,
    clientName: 'Ana Martínez',
    email: 'ana.martinez@gmail.com',
    phone: '+34 645 678 901',
    service: 'Pedicura',
    date: '27/05/2025',
    time: '11:00 AM',
    notes: '',
    timeAgo: '1 día',
    isPriority: false
  },
  {
    id: 5,
    clientName: 'Roberto Sánchez',
    email: 'roberto.sanchez@yahoo.com',
    phone: '+34 656 789 012',
    service: 'Corte de cabello',
    date: '28/05/2025',
    time: '18:30 PM',
    notes: 'Primera vez. Corte moderno.',
    timeAgo: '2 días',
    isPriority: false
  },
  {
    id: 6,
    clientName: 'Elena Gómez',
    email: 'elena.gomez@gmail.com',
    phone: '+34 667 890 123',
    service: 'Tratamiento facial',
    date: '29/05/2025',
    time: '15:45 PM',
    notes: 'Alergia a productos con fragancia.',
    timeAgo: '3 días',
    isPriority: false
  },
  {
    id: 7,
    clientName: 'Javier Ortiz',
    email: 'javier.ortiz@outlook.com',
    phone: '+34 678 901 234',
    service: 'Masaje',
    date: '30/05/2025',
    time: '13:00 PM',
    notes: '',
    timeAgo: '4 días',
    isPriority: false
  },
  {
    id: 8,
    clientName: 'Sofía Torres',
    email: 'sofia.torres@hotmail.com',
    phone: '+34 689 012 345',
    service: 'Manicura',
    date: '31/05/2025',
    time: '17:30 PM',
    notes: 'Diseño de flores en las uñas.',
    timeAgo: '4 días',
    isPriority: true
  }
]);

// Computed properties
const filteredReservations = computed(() => {
  // In a real app, filtration would happen on the server
  // This is just for demonstration
  let result = [...reservations.value];

  // Apply search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(item =>
      item.clientName.toLowerCase().includes(searchLower) ||
      item.email.toLowerCase().includes(searchLower) ||
      item.service.toLowerCase().includes(searchLower)
    );
  }

  // Apply service filter
  if (filterService.value) {
    result = result.filter(item => item.service === filterService.value);
  }

  // Apply date filter (simplified for demo)
  if (filterDate.value === 'today') {
    result = result.filter(item => item.date === '24/05/2025');
  } else if (filterDate.value === 'tomorrow') {
    result = result.filter(item => item.date === '25/05/2025');
  } else if (filterDate.value === 'thisWeek') {
    result = result.filter(item =>
      ['24/05/2025', '25/05/2025', '26/05/2025', '27/05/2025'].includes(item.date)
    );
  }

  // Apply sorting
  if (sortBy.value === 'dateNewest') {
    result.sort((a, b) => a.id - b.id);
  } else if (sortBy.value === 'dateOldest') {
    result.sort((a, b) => b.id - a.id);
  } else if (sortBy.value === 'nameAsc') {
    result.sort((a, b) => a.clientName.localeCompare(b.clientName));
  } else if (sortBy.value === 'nameDesc') {
    result.sort((a, b) => b.clientName.localeCompare(a.clientName));
  } else if (sortBy.value === 'priority') {
    result.sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0));
  }

  totalItems.value = result.length;
  return result;
});

// Pagination computed properties
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const displayedReservations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReservations.value.slice(start, end);
});

const paginationStart = computed(() => {
  return Math.min((currentPage.value - 1) * itemsPerPage.value + 1, totalItems.value);
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, totalItems.value);
});

const displayedPages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Complex pagination logic for many pages
    let start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages.value, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});

// Methods
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

function getServiceColor(service: string): string {
  return serviceColorMap[service as keyof typeof serviceColorMap] || '#6366F1';
}

function getServiceGradient(service: string): string {
  return serviceGradientMap[service as keyof typeof serviceGradientMap] || 'linear-gradient(135deg, #6366F1, #4F46E5)';
}

function getWaitTimeColor(timeAgo: string): string {
  if (timeAgo.includes('minuto')) {
    return '#10B981'; // Green
  } else if (timeAgo.includes('hora')) {
    return '#F59E0B'; // Amber
  } else {
    return '#EF4444'; // Red
  }
}

function getWaitTimeClass(timeAgo: string): string {
  if (timeAgo.includes('minuto')) {
    return 'wait-recent';
  } else if (timeAgo.includes('hora')) {
    return 'wait-medium';
  } else {
    return 'wait-long';
  }
}

function toggleFilter(): void {
  isFilterOpen.value = !isFilterOpen.value;
}

function resetFilters(): void {
  filterService.value = '';
  filterDate.value = '';
  sortBy.value = 'dateNewest';
}

function applyFilters(): void {
  isFilterOpen.value = false;
  // Reset to first page when filters change
  currentPage.value = 1;
}

async function approveReservation(item: Reservation): Promise<void> {
  if (approvingId.value) return;

  approvingId.value = item.id;

  try {
    // Here would be the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    emit('approve', item.id);
  } catch (error) {
    console.error('Error approving reservation:', error);
  } finally {
    approvingId.value = null;
  }
}

async function rejectReservation(item: Reservation): Promise<void> {
  if (rejectingId.value) return;

  rejectingId.value = item.id;

  try {
    // Here would be the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    emit('reject', item.id);
  } catch (error) {
    console.error('Error rejecting reservation:', error);
  } finally {
    rejectingId.value = null;
  }
}

function viewDetails(item: Reservation): void {
  emit('view-details', item);
}

function goToPage(page: number): void {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

function handleSort(key: string): void {
  if (currentSort.value === key) {
    // Toggle sort direction
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.value = key;
    sortDirection.value = 'asc';
  }
}

// Click outside to close filter dropdown
const { clickOutside } = useClickOutside(filterRef, () => {
  isFilterOpen.value = false;
});

// Watch for filter changes
watch([search, filterService, filterDate, sortBy], () => {
  currentPage.value = 1; // Reset to first page when filters change
});

// Reset page when total items changes
watch(totalItems, () => {
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = totalPages.value;
  }
});

// Lifecycle hooks
onMounted(async () => {
  loading.value = true;

  try {
    // Here would be the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error loading reservations:', error);
  } finally {
    loading.value = false;
  }

  document.addEventListener('click', clickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', clickOutside);
});
</script>

<style scoped>
.reservation-list-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Header styles */
.reservation-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F3F4F6;
  background: #FFFFFF;
}

.heading {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Search styles */
.search-container {
  position: relative;
  width: 250px;
  transition: all 0.3s ease;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #FFFFFF;
}

.search-container.is-focused {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  transform: translateY(-1px);
}

.search-icon {
  color: #9CA3AF;
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.875rem;
  color: #111827;
  background-color: transparent;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.search-clear {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9CA3AF;
  padding: 0;
  margin: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear:hover {
  color: #6B7280;
}

/* Filter styles */
.filter-container {
  position: relative;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  background-color: #F9FAFB;
  border-color: #D1D5DB;
}

.filter-button.is-active {
  background-color: #F3F4F6;
  border-color: #6366F1;
  color: #4F46E5;
}

.filter-icon {
  width: 16px;
  height: 16px;
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 280px;
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
  z-index: 100;
  border: 1px solid #F3F4F6;
}

.filter-heading {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 0.375rem;
}

.filter-select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  font-size: 0.875rem;
  color: #111827;
  background-color: #FFFFFF;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.filter-select:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.filter-reset {
  padding: 0.5rem 0.75rem;
  background-color: transparent;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-reset:hover {
  background-color: #F3F4F6;
  border-color: #D1D5DB;
}

.filter-apply {
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #6366F1, #4F46E5);
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

.filter-apply:hover {
  background: linear-gradient(135deg, #4F46E5, #4338CA);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(79, 70, 229, 0.3);
}

/* Table styles */
.reservation-table-container {
  position: relative;
  min-height: 300px;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
  gap: 1rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #F3F4F6;
  border-top-color: #6366F1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-overlay span {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
}

.reservation-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.reservation-table thead {
  background-color: #F9FAFB;
}

.reservation-table th {
  padding: 0.75rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  border-bottom: 1px solid #F3F4F6;
}

.th-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sort-button {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D1D5DB;
}

.sort-button:hover {
  color: #9CA3AF;
}

.sort-button.active {
  color: #6366F1;
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #F9FAFB;
}

.reservation-table td {
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  color: #4B5563;
  border-bottom: 1px solid #F3F4F6;
}

/* Client cell styles */
.client-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.client-avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.client-info {
  display: flex;
  flex-direction: column;
}

.client-name {
  font-weight: 500;
  color: #111827;
}

.client-email {
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.125rem;
}

/* Service cell styles */
.service-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: rgba(99, 102, 241, 0.1);
  color: #4F46E5;
  border: 1px solid;
}

/* Date/time cell styles */
.datetime-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-item, .time-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-item svg, .time-item svg {
  width: 14px;
  height: 14px;
}

/* Priority cell styles */
.priority-indicator {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.priority-indicator.is-priority {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.priority-indicator.is-normal {
  background-color: rgba(156, 163, 175, 0.1);
  color: #6B7280;
  border: 1px solid rgba(156, 163, 175, 0.2);
}

/* Wait time cell styles */
.waittime-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.waittime-content svg {
  width: 14px;
  height: 14px;
}

.wait-recent {
  color: #10B981;
}

.wait-medium {
  color: #F59E0B;
}

.wait-long {
  color: #EF4444;
}

/* Actions cell styles */
.actions-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.action-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.action-button.approve {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.action-button.approve:hover {
  background-color: rgba(16, 185, 129, 0.2);
  transform: translateY(-1px);
}

.action-button.reject {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.action-button.reject:hover {
  background-color: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

.action-button.view {
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366F1;
}

.action-button.view:hover {
  background-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Empty state styles */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #D1D5DB;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
}

.empty-message {
  font-size: 0.875rem;
  color: #6B7280;
  max-width: 20rem;
  margin: 0;
}

/* Pagination styles */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid #F3F4F6;
  background-color: #FFFFFF;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6B7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: 1px solid #E5E7EB;
  background-color: #FFFFFF;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #F3F4F6;
  border-color: #D1D5DB;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button svg {
  width: 16px;
  height: 16px;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0 0.5rem;
}

.pagination-page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: 1px solid #E5E7EB;
  background-color: #FFFFFF;
  color: #6B7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-page:hover:not(.active) {
  background-color: #F3F4F6;
  border-color: #D1D5DB;
}

.pagination-page.active {
  background: linear-gradient(135deg, #6366F1, #4F46E5);
  color: white;
  border-color: #4F46E5;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

/* Responsive styles */
@media (max-width: 1024px) {
  .reservation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .controls {
    width: 100%;
  }

  .search-container {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .reservation-table {
    display: block;
    overflow-x: auto;
  }

  .controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-container {
    width: 100%;
  }

  .filter-button {
    width: 100%;
    justify-content: center;
  }

  .filter-dropdown {
    width: 250px;
    right: -50px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
}
