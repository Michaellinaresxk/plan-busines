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
          <button v-if="search" class="search-clear" @click="search = ''" aria-label="Clear search">
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
                  :class="{ active: currentSort === header.key, desc: sortDirection === 'desc' }"
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
                <div
                  class="client-avatar"
                  :style="{ backgroundColor: getServiceGradient(item.service) }"
                >
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
        <span
          >Showing {{ paginationStart }} - {{ paginationEnd }} of
          {{ filteredReservations.length }}</span
        >
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
            :class="{ active: currentPage === pageNum }"
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
  import {
    getInitials,
    getServiceColor,
    getServiceGradient,
    getWaitTimeClass,
    getWaitTimeColor
  } from '@/utils/reservationUtils';
  import {
    SERVICE_FILTER_OPTIONS,
    DATE_FILTER_OPTIONS,
    SORT_FILTER_OPTIONS,
    RESERVATION_TABLE_HEADERS
  } from '@/constants/reservation';
  import type { Reservation } from '@/types/reservation';
  import { useReservationStore } from '@/stores/reservationStore';

  // Props and Emits
  const emit = defineEmits<{
    (e: 'view-details', reservation: Reservation): void;
    (e: 'approve', id: number): void;
    (e: 'reject', id: number): void;
  }>();

  // Store
  const reservationStore = useReservationStore();

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

  // Table configuration
  const tableHeaders = RESERVATION_TABLE_HEADERS;

  // Filter options
  const serviceOptions = SERVICE_FILTER_OPTIONS;
  const dateOptions = DATE_FILTER_OPTIONS;
  const sortOptions = SORT_FILTER_OPTIONS;

  // Computed properties
  const filteredReservations = computed(() => {
    // In a real app, we would use reservationStore.filteredReservations
    // For now, we'll do the filtering here for demonstration purposes
    let result = [...reservationStore.pendingReservations];

    // Apply search filter
    if (search.value) {
      const searchLower = search.value.toLowerCase();
      result = result.filter(
        item =>
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

    return result;
  });

  // Pagination computed properties
  const totalItems = computed(() => filteredReservations.value.length);
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
      await reservationStore.approveReservation(item.id);
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
      await reservationStore.rejectReservation(item.id);
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
      await reservationStore.fetchReservations();
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
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
      'Helvetica Neue', sans-serif;
  }

  /* Header styles */
  .reservation-header {
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f3f4f6;
    background: #ffffff;
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
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background-color: #ffffff;
  }

  .search-container.is-focused {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    transform: translateY(-1px);
  }

  .search-icon {
    color: #9ca3af;
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
    color: #9ca3af;
  }

  .search-clear {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    padding: 0;
    margin: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-clear:hover {
    color: #6b7280;
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
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-button:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }

  .filter-button.is-active {
    background-color: #f3f4f6;
    border-color: #6366f1;
    color: #4f46e5;
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
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    padding: 1.25rem;
    z-index: 100;
    border: 1px solid #f3f4f6;
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
    color: #6b7280;
    margin-bottom: 0.375rem;
  }

  .filter-select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    font-size: 0.875rem;
    color: #111827;
    background-color: #ffffff;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }

  .filter-select:focus {
    border-color: #6366f1;
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
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-reset:hover {
    background-color: #f3f4f6;
    border-color: #d1d5db;
  }

  .filter-apply {
    padding: 0.5rem 0.75rem;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
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
    background: linear-gradient(135deg, #4f46e5, #4338ca);
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
    border: 3px solid #f3f4f6;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-overlay span {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .reservation-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  .reservation-table thead {
    background-color: #f9fafb;
  }

  .reservation-table th {
    padding: 0.75rem 1.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: left;
    border-bottom: 1px solid #f3f4f6;
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
    color: #d1d5db;
  }

  .sort-button:hover {
    color: #9ca3af;
  }

  .sort-button.active {
    color: #6366f1;
  }

  .table-row {
    transition: background-color 0.2s ease;
  }

  .table-row:hover {
    background-color: #f9fafb;
  }

  .reservation-table td {
    padding: 1rem 1.25rem;
    font-size: 0.875rem;
    color: #4b5563;
    border-bottom: 1px solid #f3f4f6;
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
    color: #6b7280;
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
    color: #4f46e5;
    border: 1px solid;
  }

  /* Date/time cell styles */
  .datetime-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .date-item,
  .time-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .date-item svg,
  .time-item svg {
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
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .priority-indicator.is-normal {
    background-color: rgba(156, 163, 175, 0.1);
    color: #6b7280;
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
    color: #10b981;
  }

  .wait-medium {
    color: #f59e0b;
  }

  .wait-long {
    color: #ef4444;
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
    color: #10b981;
  }

  .action-button.approve:hover {
    background-color: rgba(16, 185, 129, 0.2);
    transform: translateY(-1px);
  }

  .action-button.reject {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .action-button.reject:hover {
    background-color: rgba(239, 68, 68, 0.2);
    transform: translateY(-1px);
  }

  .action-button.view {
    background-color: rgba(99, 102, 241, 0.1);
    color: #6366f1;
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
    color: #d1d5db;
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
    color: #6b7280;
    max-width: 20rem;
    margin: 0;
  }

  /* Pagination styles */
  .pagination-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-top: 1px solid #f3f4f6;
    background-color: #ffffff;
  }

  .pagination-info {
    font-size: 0.875rem;
    color: #6b7280;
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
    border: 1px solid #e5e7eb;
    background-color: #ffffff;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pagination-button:hover:not(:disabled) {
    background-color: #f3f4f6;
    border-color: #d1d5db;
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
    border: 1px solid #e5e7eb;
    background-color: #ffffff;
    color: #6b7280;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pagination-page:hover:not(.active) {
    background-color: #f3f4f6;
    border-color: #d1d5db;
  }

  .pagination-page.active {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
    border-color: #4f46e5;
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
</style>
