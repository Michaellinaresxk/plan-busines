<!-- DashboardView.vue -->
<template>
  <v-layout class="dashboard-layout">
    <!-- Navigation Drawer - Modernizado -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      @mouseenter="rail = false"
      @mouseleave="rail = !mdAndUp"
      :permanent="mdAndUp"
      :temporary="!mdAndUp"
      elevation="0"
      border
      color="surface"
      class="sidebar"
    >
      <div class="pa-4 d-flex align-center">
        <v-avatar color="primary" class="mr-3">
          <v-icon icon="mdi-calendar-check" color="white"></v-icon>
        </v-avatar>
        <h2 class="text-h6 font-weight-bold primary-text">Reserva<span class="secondary-text">Manager</span></h2>
      </div>

      <v-divider class="mt-2 mb-2"></v-divider>

      <v-list nav>
        <v-list-subheader v-show="!rail" class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Principal</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Dashboard"
          value="dashboard"
          rounded="lg"
          active
          class="mb-1"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-calendar-clock"
          title="Pendientes"
          value="pending"
          :badge="pendingCount"
          badge-color="error"
          rounded="lg"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-calendar-check"
          title="Aprobadas"
          value="approved"
          rounded="lg"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-calendar-remove"
          title="Rechazadas"
          value="rejected"
          rounded="lg"
          class="mb-1"
        ></v-list-item>

        <v-divider class="my-3" v-show="!rail"></v-divider>
        <v-list-subheader v-show="!rail" class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Análisis</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-history"
          title="Historial"
          value="history"
          rounded="lg"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-chart-bar"
          title="Estadísticas"
          value="stats"
          rounded="lg"
          class="mb-1"
        ></v-list-item>

        <v-divider class="my-3" v-show="!rail"></v-divider>
        <v-list-subheader v-show="!rail" class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Sistema</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-cog-outline"
          title="Configuración"
          value="settings"
          rounded="lg"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-help-circle-outline"
          title="Ayuda"
          value="help"
          rounded="lg"
          class="mb-1"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2" v-if="!rail">
          <v-btn block color="primary" variant="tonal" prepend-icon="mdi-plus" class="mb-2">
            Nueva reserva
          </v-btn>
        </div>
        <div class="px-4 py-3 d-flex align-center justify-space-between user-section" v-if="!rail">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-2">
              <span class="text-caption">AM</span>
            </v-avatar>
            <div>
              <p class="text-body-2 mb-0 font-weight-medium">Admin Manager</p>
              <p class="text-caption text-medium-emphasis">admin@example.com</p>
            </div>
          </div>
          <v-btn icon="mdi-logout" size="small" variant="text" color="medium-emphasis"></v-btn>
        </div>
        <v-avatar color="primary" size="36" class="ma-2" v-else>
          <span class="text-caption">AM</span>
        </v-avatar>
      </template>
    </v-navigation-drawer>

    <!-- App Bar - Modernizado -->
    <v-app-bar
      elevation="0"
      border
      class="px-2"
    >
      <v-app-bar-nav-icon
        v-if="!mdAndUp"
        @click.stop="drawer = !drawer"
        color="primary"
      ></v-app-bar-nav-icon>

      <v-btn
        @click.stop="rail = !rail"
        icon="mdi-menu"
        v-else
        variant="text"
        color="primary"
      ></v-btn>

      <v-breadcrumbs :items="breadcrumbs" class="pa-0"></v-breadcrumbs>

      <v-spacer></v-spacer>

      <!-- Filtro de búsqueda - Modernizado -->
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Buscar reservas..."
        density="compact"
        hide-details
        variant="solo"
        class="search-field mx-2"
        style="max-width: 250px"
        bg-color="surface-variant"
        rounded="pill"
      ></v-text-field>

      <v-btn icon="mdi-bell" variant="text" class="ml-2">
        <v-badge color="error" :content="3" offset-x="3" offset-y="3"></v-badge>
      </v-btn>

      <!-- Botón de tema oscuro/claro -->
      <v-btn icon="mdi-theme-light-dark" variant="text" class="ml-2" @click="toggleTheme"></v-btn>

      <!-- Avatar usuario - Modernizado -->
      <v-menu anchor="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" class="ml-2">
            <v-avatar size="32" color="primary">
              <span class="text-caption">AM</span>
            </v-avatar>
            <v-icon class="ml-1" size="small">mdi-chevron-down</v-icon>
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

    <!-- Main Content - Modernizado -->
    <v-main class="bg-surface-variant">
      <v-container fluid class="py-8 px-4 md:px-6">
        <!-- Header y filtros - Modernizado -->
        <v-card elevation="0" rounded="lg" border class="mb-6 pa-4 pb-2">
          <div class="d-flex flex-wrap align-center justify-space-between mb-4">
            <div>
              <h1 class="text-h4 font-weight-bold mb-0 d-flex align-center">
                <v-avatar color="primary" size="40" class="mr-3 elevation-1">
                  <v-icon color="white">mdi-calendar-clock</v-icon>
                </v-avatar>
                Reservas Pendientes
              </h1>
              <p class="text-medium-emphasis mt-1">
                Gestiona y aprueba las solicitudes de reserva de servicios
              </p>
            </div>

            <div class="d-flex flex-wrap gap-2 mt-2 mt-sm-0">
              <v-btn
                prepend-icon="mdi-refresh"
                color="secondary"
                variant="text"
                :loading="loading"
                @click="refreshData"
              >
                Actualizar
              </v-btn>

              <v-menu location="bottom end">
                <template v-slot:activator="{ props }">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    v-bind="props"
                    class="ml-2"
                    prepend-icon="mdi-filter-variant"
                  >
                    Filtros
                    <v-chip
                      v-if="activeFilters > 0"
                      size="x-small"
                      color="primary"
                      class="ml-2"
                    >
                      {{ activeFilters }}
                    </v-chip>
                  </v-btn>
                </template>

                <v-card min-width="300" class="pa-4" elevation="4" rounded="lg">
                  <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
                    <v-icon icon="mdi-filter-variant" class="mr-2" color="primary"></v-icon>
                    Filtrar reservas
                  </h3>

                  <v-select
                    label="Tipo de servicio"
                    :items="['Todos', 'Corte de cabello', 'Manicura', 'Pedicura', 'Masaje']"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    hide-details
                    class="mb-4"
                    v-model="filters.service"
                  ></v-select>

                  <v-select
                    label="Estado"
                    :items="['Todos', 'Pendiente', 'Aprobada', 'Rechazada']"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    hide-details
                    class="mb-4"
                    v-model="filters.status"
                  ></v-select>

                  <v-select
                    label="Ordenar por"
                    :items="['Más reciente', 'Más antiguo', 'Nombre cliente', 'Próxima cita']"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    hide-details
                    class="mb-4"
                    v-model="filters.sortBy"
                  ></v-select>

                  <div class="d-flex justify-end mt-4">
                    <v-btn color="secondary" variant="text" class="mr-2" @click="resetFilters">
                      Reiniciar
                    </v-btn>
                    <v-btn color="primary" @click="applyFilters">
                      Aplicar
                    </v-btn>
                  </div>
                </v-card>
              </v-menu>

              <v-tooltip text="Aprobar todas las reservas pendientes">
                <template v-slot:activator="{ props }">
                  <v-btn
                    color="success"
                    class="ml-2"
                    variant="elevated"
                    v-bind="props"
                    prepend-icon="mdi-check-all"
                    @click="approveAllReservations"
                  >
                    Aprobar todas
                  </v-btn>
                </template>
              </v-tooltip>
            </div>
          </div>

          <!-- Tarjetas de resumen - Modernizadas -->
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" border class="rounded-lg h-100 status-card pa-2">
                <v-card-text>
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <p class="text-medium-emphasis text-caption text-uppercase font-weight-medium mb-0">Pendientes</p>
                      <p class="text-h3 font-weight-bold mt-1">{{ pendingCount }}</p>
                    </div>
                    <v-avatar color="warning" size="52" class="elevation-1 bg-opacity">
                      <v-icon icon="mdi-clock-outline" color="warning" size="large"></v-icon>
                    </v-avatar>
                  </div>
                  <div class="mt-2 text-caption d-flex align-center">
                    <v-icon icon="mdi-menu-up" size="small" class="text-success mr-1"></v-icon>
                    <span class="text-success font-weight-medium">+6%</span>
                    <span class="text-medium-emphasis ml-2">desde ayer</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" border class="rounded-lg h-100 status-card pa-2">
                <v-card-text>
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <p class="text-medium-emphasis text-caption text-uppercase font-weight-medium mb-0">Aprobadas hoy</p>
                      <p class="text-h3 font-weight-bold mt-1">8</p>
                    </div>
                    <v-avatar color="success" size="52" class="elevation-1 bg-opacity">
                      <v-icon icon="mdi-check-circle" color="success" size="large"></v-icon>
                    </v-avatar>
                  </div>
                  <div class="mt-2 text-caption d-flex align-center">
                    <v-icon icon="mdi-menu-up" size="small" class="text-success mr-1"></v-icon>
                    <span class="text-success font-weight-medium">+12%</span>
                    <span class="text-medium-emphasis ml-2">desde ayer</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" border class="rounded-lg h-100 status-card pa-2">
                <v-card-text>
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <p class="text-medium-emphasis text-caption text-uppercase font-weight-medium mb-0">Reservas totales</p>
                      <p class="text-h3 font-weight-bold mt-1">124</p>
                    </div>
                    <v-avatar color="info" size="52" class="elevation-1 bg-opacity">
                      <v-icon icon="mdi-calendar" color="info" size="large"></v-icon>
                    </v-avatar>
                  </div>
                  <div class="mt-2 text-caption d-flex align-center">
                    <v-icon icon="mdi-menu-up" size="small" class="text-success mr-1"></v-icon>
                    <span class="text-success font-weight-medium">+5%</span>
                    <span class="text-medium-emphasis ml-2">este mes</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" border class="rounded-lg h-100 status-card pa-2">
                <v-card-text>
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <p class="text-medium-emphasis text-caption text-uppercase font-weight-medium mb-0">Tiempo promedio</p>
                      <p class="text-h3 font-weight-bold mt-1">5.2h</p>
                    </div>
                    <v-avatar color="purple" size="52" class="elevation-1 bg-opacity">
                      <v-icon icon="mdi-timer-outline" color="purple" size="large"></v-icon>
                    </v-avatar>
                  </div>
                  <div class="mt-2 text-caption d-flex align-center">
                    <v-icon icon="mdi-menu-down" size="small" class="text-error mr-1"></v-icon>
                    <span class="text-error font-weight-medium">-2.3%</span>
                    <span class="text-medium-emphasis ml-2">esta semana</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card>

        <!-- Sección de reservas pendientes - Modernizada -->
        <div class="d-flex justify-space-between align-center mb-4">
          <h2 class="text-h5 font-weight-bold d-flex align-center">
            <v-icon icon="mdi-clipboard-text-clock" color="primary" class="mr-2"></v-icon>
            Solicitudes pendientes
            <v-chip color="primary" size="small" class="ml-2">{{ pendingCount }}</v-chip>
          </h2>

          <v-chip-group
            v-model="filterChips"
            column
            multiple
          >
            <v-chip
              filter
              variant="elevated"
              color="primary"
              label
              size="small"
            >
              Hoy
            </v-chip>
            <v-chip
              filter
              variant="elevated"
              color="primary"
              label
              size="small"
            >
              Prioritarios
            </v-chip>
            <v-chip
              filter
              variant="elevated"
              color="primary"
              label
              size="small"
            >
              Recientes
            </v-chip>
          </v-chip-group>
        </div>

        <!-- Estado de vacío - Cuando no hay reservas -->
        <v-card v-if="pendingReservations.length === 0" class="mb-6 pa-8 d-flex flex-column align-center justify-center" elevation="0" rounded="lg" border>
          <v-avatar color="primary" class="mb-4" size="64">
            <v-icon icon="mdi-calendar-check" size="36" color="white"></v-icon>
          </v-avatar>
          <h3 class="text-h5 mb-2 text-center">No hay reservas pendientes</h3>
          <p class="text-medium-emphasis text-body-1 text-center mb-6">
            Todas las reservas han sido procesadas. ¡Buen trabajo!
          </p>
          <v-btn color="primary" prepend-icon="mdi-refresh" @click="refreshData" :loading="loading">
            Actualizar datos
          </v-btn>
        </v-card>

        <!-- Vista de lista - Cuando hay reservas -->
        <v-row v-if="pendingReservations.length > 0">
          <!-- Card de reserva - Modernizada -->
          <v-col cols="12" sm="6" md="4" v-for="reservation in pendingReservations" :key="reservation.id">
            <v-card
              elevation="0"
              border
              :class="['rounded-lg mb-4 reservation-card', reservation.isPriority ? 'priority-card' : '']"
            >
              <v-card-item>
                <template v-slot:prepend>
                  <v-avatar :color="getAvatarColor(reservation.service)" size="48">
                    {{ getInitials(reservation.clientName) }}
                  </v-avatar>
                </template>

                <v-card-title class="pb-0 text-truncate d-flex align-center">
                  {{ reservation.clientName }}
                  <v-tooltip v-if="reservation.isPriority" text="Cliente prioritario">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        icon="mdi-star"
                        color="amber-darken-2"
                        size="small"
                        class="ml-2"
                        v-bind="props"
                      ></v-icon>
                    </template>
                  </v-tooltip>
                </v-card-title>
                <v-card-subtitle class="text-truncate">
                  <v-icon icon="mdi-email-outline" size="x-small" class="mr-1"></v-icon>
                  {{ reservation.email }}
                </v-card-subtitle>
              </v-card-item>

              <v-card-text class="pt-2">
                <div class="d-flex flex-wrap gap-1 mb-3">
                  <v-chip
                    size="small"
                    :color="getServiceColor(reservation.service)"
                    class="text-white font-weight-medium"
                  >
                    {{ reservation.service }}
                  </v-chip>
                  <v-chip
                    v-if="reservation.isPriority"
                    color="error"
                    size="small"
                    variant="outlined"
                    class="font-weight-medium"
                  >
                    Prioritario
                  </v-chip>
                </div>

                <div class="d-flex flex-column gap-2 reservation-details">
                  <div class="d-flex align-center reservation-detail-row">
                    <v-icon icon="mdi-calendar" size="small" color="primary" class="mr-2"></v-icon>
                    <span class="text-body-2">{{ reservation.date }}</span>
                  </div>

                  <div class="d-flex align-center reservation-detail-row">
                    <v-icon icon="mdi-clock-outline" size="small" color="primary" class="mr-2"></v-icon>
                    <span class="text-body-2">{{ reservation.time }}</span>
                  </div>

                  <div class="d-flex align-center reservation-detail-row">
                    <v-icon icon="mdi-phone" size="small" color="primary" class="mr-2"></v-icon>
                    <span class="text-body-2">{{ reservation.phone }}</span>
                  </div>

                  <v-expand-transition>
                    <div v-if="reservation.notes">
                      <v-divider class="my-2"></v-divider>
                      <div class="d-flex">
                        <v-icon icon="mdi-message-text-outline" size="small" color="primary" class="mr-2 mt-1"></v-icon>
                        <p class="text-body-2">{{ reservation.notes }}</p>
                      </div>
                    </div>
                  </v-expand-transition>
                </div>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions class="pa-2">
                <div class="d-flex align-center text-caption text-medium-emphasis">
                  <v-icon icon="mdi-clock-time-four-outline" size="x-small" class="mr-1"></v-icon>
                  <span>Solicitado hace {{ reservation.timeAgo }}</span>
                </div>
                <v-spacer></v-spacer>
                <v-btn
                  color="error"
                  size="small"
                  variant="text"
                  @click="openRejectDialog(reservation)"
                >
                  Rechazar
                </v-btn>
                <v-btn
                  color="success"
                  size="small"
                  @click="openApproveDialog(reservation)"
                >
                  Aprobar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Paginación - Modernizada -->
        <div class="d-flex justify-center mt-6">
          <v-pagination
            v-model="page"
            :length="3"
            rounded="circle"
            :disabled="loading"
            color="primary"
            :active-color="loading ? 'grey' : 'primary'"
          ></v-pagination>
        </div>

        <!-- Sección de estadísticas rápidas -->
        <v-card class="mt-6" elevation="0" rounded="lg" border>
          <v-card-item>
            <v-card-title class="text-h6 d-flex align-center">
              <v-icon icon="mdi-chart-timeline-variant" color="primary" class="mr-2"></v-icon>
              Actividad reciente
            </v-card-title>
            <v-card-subtitle>Resumen de las últimas 24 horas</v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="8">
                <!-- Gráfico de actividad -->
                <v-card elevation="0" border class="rounded-lg pa-2 h-100">
                  <div class="pa-2 pb-0">
                    <div class="d-flex align-center justify-space-between">
                      <h4 class="text-subtitle-1 font-weight-bold">Reservas por hora</h4>
                      <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-dots-horizontal">
                        Opciones
                      </v-btn>
                    </div>
                  </div>

                  <v-sheet height="200" class="pa-4">
                    <!-- Aquí iría un componente de gráfico real -->
                    <div class="chart-placeholder d-flex flex-column justify-center align-center h-100">
                      <v-icon icon="mdi-chart-line" size="48" color="primary" class="mb-2"></v-icon>
                      <p class="text-medium-emphasis">Gráfico de actividad horaria</p>
                    </div>
                  </v-sheet>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <!-- Actividad reciente -->
                <v-card elevation="0" border class="rounded-lg pa-2 h-100">
                  <div class="pa-2">
                    <h4 class="text-subtitle-1 font-weight-bold mb-4">Últimas actividades</h4>

                    <v-timeline density="compact" align="start">
                      <v-timeline-item
                        v-for="(activity, i) in recentActivities"
                        :key="i"
                        :dot-color="activity.color"
                        :icon="activity.icon"
                        size="small"
                      >
                        <div class="mb-2">
                          <div class="text-body-2 font-weight-medium">{{ activity.title }}</div>
                          <div class="text-caption text-medium-emphasis">{{ activity.time }}</div>
                        </div>
                      </v-timeline-item>
                    </v-timeline>

                    <div class="text-center mt-3">
                      <v-btn variant="text" color="primary" size="small">
                        Ver todo el historial
                        <v-icon icon="mdi-chevron-right" size="small" end></v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- Dialog de Aprobación - Modernizado -->
    <v-dialog v-model="showApproveDialog" max-width="500" transition="dialog-bottom-transition">
      <v-card rounded="lg">
        <v-toolbar color="success" class="text-white rounded-t-lg px-4">
          <v-icon icon="mdi-check-circle" class="mr-2"></v-icon>
          <v-toolbar-title>Aprobar Reserva</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showApproveDialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="px-4 pt-4">
          <v-alert
            variant="tonal"
            color="success"
            border="start"
            density="compact"
            class="mb-4"
          >
            <div class="d-flex">
              <div>
                <p class="text-subtitle-2 font-weight-bold mb-1">Detalles de la reserva</p>
                <p class="text-body-2 mb-0">Cliente: <strong>{{ selectedReservation?.clientName || 'Cliente' }}</strong></p>
                <p class="text-body-2 mb-0">Servicio: <strong>{{ selectedReservation?.service || 'Servicio' }}</strong></p>
                <p class="text-body-2 mb-0">Fecha: <strong>{{ selectedReservation?.date || 'Fecha' }}</strong></p>
                <p class="text-body-2 mb-0">Hora: <strong>{{ selectedReservation?.time || 'Hora' }}</strong></p>
              </div>
            </div>
          </v-alert>

          <v-textarea
            label="Mensaje para el cliente (opcional)"
            placeholder="Añade un mensaje que se enviará junto con la confirmación"
            variant="outlined"
            rows="3"
            auto-grow
            rounded="lg"
            hide-details
            bg-color="surface"
            class="mb-4"
          ></v-textarea>

          <v-checkbox
            label="Enviar email de confirmación al cliente"
            color="success"
            model-value="true"
            hide-details
          ></v-checkbox>

          <v-checkbox
            label="Enviar notificación por SMS"
            color="success"
            model-value="false"
            hide-details
          ></v-checkbox>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-btn
            color="secondary"
            variant="text"
            @click="showApproveDialog = false"
            prepend-icon="mdi-close"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            @click="approveReservation"
            prepend-icon="mdi-check"
            :loading="processingAction"
          >
            Confirmar aprobación
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Rechazo - Modernizado -->
    <v-dialog v-model="showRejectDialog" max-width="500" transition="dialog-bottom-transition">
      <v-card rounded="lg">
        <v-toolbar color="error" class="text-white rounded-t-lg px-4">
          <v-icon icon="mdi-close-circle" class="mr-2"></v-icon>
          <v-toolbar-title>Rechazar Reserva</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showRejectDialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="px-4 pt-4">
          <v-alert
            variant="tonal"
            color="error"
            border="start"
            density="compact"
            class="mb-4"
          >
            <div class="d-flex">
              <div>
                <p class="text-subtitle-2 font-weight-bold mb-1">Detalles de la reserva</p>
                <p class="text-body-2 mb-0">Cliente: <strong>{{ selectedReservation?.clientName || 'Cliente' }}</strong></p>
                <p class="text-body-2 mb-0">Servicio: <strong>{{ selectedReservation?.service || 'Servicio' }}</strong></p>
                <p class="text-body-2 mb-0">Fecha: <strong>{{ selectedReservation?.date || 'Fecha' }}</strong></p>
                <p class="text-body-2 mb-0">Hora: <strong>{{ selectedReservation?.time || 'Hora' }}</strong></p>
              </div>
            </div>
          </v-alert>

          <v-select
            label="Motivo del rechazo"
            :items="[
              'Horario no disponible',
              'Servicio no disponible en la fecha solicitada',
              'Personal no disponible',
              'Solicitud duplicada',
              'Otro motivo'
            ]"
            variant="outlined"
            rounded="lg"
            class="mb-4"
            hide-details
            bg-color="surface"
          ></v-select>

          <v-textarea
            label="Mensaje para el cliente"
            placeholder="Explica al cliente el motivo del rechazo"
            variant="outlined"
            rounded="lg"
            rows="3"
            auto-grow
            required
            hide-details
            bg-color="surface"
            class="mb-4"
          ></v-textarea>

          <v-checkbox
            label="Enviar email de notificación al cliente"
            color="error"
            model-value="true"
            hide-details
          ></v-checkbox>

          <v-checkbox
            label="Ofrecer fecha alternativa"
            color="error"
            model-value="false"
            hide-details
          ></v-checkbox>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-btn
            color="secondary"
            variant="text"
            @click="showRejectDialog = false"
            prepend-icon="mdi-close"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            @click="rejectReservation"
            prepend-icon="mdi-close-circle"
            :loading="processingAction"
          >
            Confirmar rechazo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de nuevo recordatorio -->
    <v-dialog v-model="showReminderDialog" max-width="500" transition="dialog-bottom-transition">
      <v-card rounded="lg">
        <v-toolbar color="primary" class="text-white rounded-t-lg px-4">
          <v-icon icon="mdi-bell-ring" class="mr-2"></v-icon>
          <v-toolbar-title>Programar recordatorio</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showReminderDialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="px-4 pt-4">
          <p class="text-body-1 mb-4">Configura un recordatorio para seguimiento de las reservas pendientes.</p>

          <v-select
            label="Tipo de recordatorio"
            :items="[
              'Recordatorio general',
              'Seguimiento de reserva',
              'Revisión pendiente',
              'Verificación de datos'
            ]"
            variant="outlined"
            rounded="lg"
            class="mb-4"
            hide-details
          ></v-select>

          <v-row class="mb-4">
            <v-col cols="12" sm="6">
              <v-text-field
                label="Fecha"
                type="date"
                variant="outlined"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                label="Hora"
                type="time"
                variant="outlined"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <v-textarea
            label="Nota del recordatorio"
            placeholder="Escribe una nota para este recordatorio"
            variant="outlined"
            rounded="lg"
            rows="3"
            auto-grow
            hide-details
            class="mb-4"
          ></v-textarea>

          <v-checkbox
            label="Notificarme por email"
            color="primary"
            model-value="true"
            hide-details
          ></v-checkbox>

          <v-checkbox
            label="Notificarme en la aplicación"
            color="primary"
            model-value="true"
            hide-details
          ></v-checkbox>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-btn
            color="secondary"
            variant="text"
            @click="showReminderDialog = false"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="createReminder"
            prepend-icon="mdi-bell-plus"
          >
            Crear recordatorio
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para notificaciones - Modernizado -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      location="bottom end"
      rounded="pill"
      elevation="4"
      timeout="3000"
    >
      <div class="d-flex align-center">
        <v-icon :icon="snackbarIcon" class="mr-2" size="small"></v-icon>
        {{ snackbarText }}
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar = false"></v-btn>
      </template>
    </v-snackbar>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDisplay } from 'vuetify';

// Responsive helpers
const { mdAndUp } = useDisplay();

// Estado del drawer y rail (sidebar)
const drawer = ref(true);
const rail = ref(false);

// Estado de la UI
const search = ref('');
const page = ref(1);
const loading = ref(false);
const processingAction = ref(false);
const darkMode = ref(false);
const filterChips = ref([]);
const breadcrumbs = ref([
  {
    title: 'Dashboard',
    disabled: false,
    href: '#',
  },
  {
    title: 'Reservas',
    disabled: false,
    href: '#',
  },
  {
    title: 'Pendientes',
    disabled: true,
  },
]);

// Diálogos
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const showReminderDialog = ref(false);
const selectedReservation = ref(null);

// Notificaciones
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

// Filtros
const filters = ref({
  service: 'Todos',
  status: 'Pendiente',
  sortBy: 'Más reciente'
});

const activeFilters = computed(() => {
  let count = 0;
  if (filters.value.service !== 'Todos') count++;
  if (filters.value.status !== 'Todos') count++;
  if (filters.value.sortBy !== 'Más reciente') count++;
  return count;
});

// Datos simulados
const pendingReservations = ref([
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
  }
]);

// Actividades recientes
const recentActivities = ref([
  {
    title: 'Reserva aprobada',
    time: 'Hace 15 minutos',
    icon: 'mdi-check-circle',
    color: 'success'
  },
  {
    title: 'Nueva reserva recibida',
    time: 'Hace 48 minutos',
    icon: 'mdi-calendar-plus',
    color: 'primary'
  },
  {
    title: 'Reserva rechazada',
    time: 'Hace 1 hora',
    icon: 'mdi-close-circle',
    color: 'error'
  },
  {
    title: 'Configuración actualizada',
    time: 'Hace 3 horas',
    icon: 'mdi-cog',
    color: 'info'
  },
  {
    title: 'Sistema iniciado',
    time: 'Hace 5 horas',
    icon: 'mdi-power',
    color: 'secondary'
  }
]);

// Computed properties
const pendingCount = computed(() => pendingReservations.value.length);

// Métodos de utilidad
const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
};

const getServiceColor = (service) => {
  const colors = {
    'Corte de cabello': 'indigo',
    'Manicura': 'pink',
    'Pedicura': 'teal',
    'Masaje': 'purple',
    'Tinte': 'blue',
    'Tratamiento facial': 'cyan'
  };

  return colors[service] || 'primary';
};

const getAvatarColor = (service) => {
  const colors = {
    'Corte de cabello': 'indigo-lighten-1',
    'Manicura': 'pink-lighten-1',
    'Pedicura': 'teal-lighten-1',
    'Masaje': 'purple-lighten-1',
    'Tinte': 'blue-lighten-1',
    'Tratamiento facial': 'cyan-lighten-1'
  };

  return colors[service] || 'primary';
};

// Métodos para los diálogos
const openApproveDialog = (reservation) => {
  selectedReservation.value = reservation;
  showApproveDialog.value = true;
};

const openRejectDialog = (reservation) => {
  selectedReservation.value = reservation;
  showRejectDialog.value = true;
};

// Acciones para las reservas
const approveReservation = () => {
  processingAction.value = true;

  // Simulamos una llamada a API
  setTimeout(() => {
    showApproveDialog.value = false;
    processingAction.value = false;

    // Aquí iría la lógica real para aprobar la reserva
    pendingReservations.value = pendingReservations.value.filter(
      res => res.id !== selectedReservation.value.id
    );

    // Mostrar notificación
    snackbarColor.value = 'success';
    snackbarText.value = 'Reserva aprobada con éxito';
    snackbarIcon.value = 'mdi-check-circle';
    snackbar.value = true;
  }, 1000);
};

const rejectReservation = () => {
  processingAction.value = true;

  // Simulamos una llamada a API
  setTimeout(() => {
    showRejectDialog.value = false;
    processingAction.value = false;

    // Aquí iría la lógica real para rechazar la reserva
    pendingReservations.value = pendingReservations.value.filter(
      res => res.id !== selectedReservation.value.id
    );

    // Mostrar notificación
    snackbarColor.value = 'error';
    snackbarText.value = 'Reserva rechazada';
    snackbarIcon.value = 'mdi-close-circle';
    snackbar.value = true;
  }, 1000);
};

const approveAllReservations = () => {
  loading.value = true;

  // Simulamos una llamada a API
  setTimeout(() => {
    // Aquí iría la lógica real para aprobar todas las reservas
    pendingReservations.value = [];

    loading.value = false;

    // Mostrar notificación
    snackbarColor.value = 'success';
    snackbarText.value = 'Todas las reservas han sido aprobadas';
    snackbarIcon.value = 'mdi-check-all';
    snackbar.value = true;
  }, 1500);
};

// Método para crear recordatorio
const createReminder = () => {
  showReminderDialog.value = false;

  // Mostrar notificación
  snackbarColor.value = 'info';
  snackbarText.value = 'Recordatorio creado correctamente';
  snackbarIcon.value = 'mdi-bell';
  snackbar.value = true;
};

// Métodos para filtros
const refreshData = () => {
  loading.value = true;

  // Simulamos una actualización de datos
  setTimeout(() => {
    // Si no hay reservas, las recreamos al refrescar (solo para demo)
    if (pendingReservations.value.length === 0) {
      pendingReservations.value = [
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
        }
      ];
    }

    loading.value = false;

    // Mostrar notificación
    snackbarColor.value = 'info';
    snackbarText.value = 'Datos actualizados correctamente';
    snackbarIcon.value = 'mdi-refresh';
    snackbar.value = true;
  }, 1000);
};

const resetFilters = () => {
  filters.value = {
    service: 'Todos',
    status: 'Pendiente',
    sortBy: 'Más reciente'
  };
};

const applyFilters = () => {
  // Aquí iría la lógica para aplicar filtros
  // ...

  // Mostrar notificación
  snackbarColor.value = 'primary';
  snackbarText.value = 'Filtros aplicados';
  snackbarIcon.value = 'mdi-filter-variant';
  snackbar.value = true;
};

// Cambiar tema oscuro/claro
const toggleTheme = () => {
  darkMode.value = !darkMode.value;
  // Aquí irían las acciones para cambiar el tema global
};

// Lifecycle hooks
onMounted(() => {
  // Ajustamos el rail basado en el tamaño de pantalla
  rail.value = !mdAndUp.value;

  // Simulamos una carga inicial
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 800);
});

// Observamos cambios en el tamaño de pantalla
watch(mdAndUp, (newValue) => {
  if (!newValue) {
    rail.value = false;
    drawer.value = false;
  } else {
    drawer.value = true;
  }
});
</script>

<style scoped>
.dashboard-layout {
  background-color: rgb(var(--v-theme-background));
}

/* Tarjetas de estado */
.status-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.status-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(var(--v-theme-on-surface), 0.1) !important;
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
}

.bg-opacity {
  opacity: 0.95;
}

/* Sidebar y navegación */
.sidebar {
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.primary-text {
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 1) 0%, rgba(var(--v-theme-secondary), 1) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.secondary-text {
  opacity: 0.7;
}

.user-section {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

/* Tarjetas de reserva */
.reservation-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  position: relative;
  overflow: hidden;
}

.reservation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(var(--v-theme-on-surface), 0.08) !important;
  border-color: rgba(var(--v-theme-primary), 0.7) !important;
}

.priority-card {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.priority-card:hover {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.reservation-detail-row {
  position: relative;
  padding: 4px 0;
}

.reservation-detail-row:not(:last-child) {
  border-bottom: 1px dashed rgba(var(--v-theme-on-surface), 0.08);
}

/* Campo de búsqueda */
.search-field {
  transition: all 0.3s ease;
}

.search-field:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(var(--v-theme-on-surface), 0.05);
}

/* Placeholder del gráfico */
.chart-placeholder {
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: 12px;
}
</style>
