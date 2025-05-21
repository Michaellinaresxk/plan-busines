<template>
  <v-card class="rounded-lg shadow-sm">
    <v-tabs v-model="activeTab" bg-color="background" show-arrows>
      <v-tab value="daily" class="text-caption text-uppercase font-weight-bold">
        <v-icon icon="mdi-calendar-today" size="small" class="mr-1"></v-icon>
        Diario
      </v-tab>
      <v-tab value="weekly" class="text-caption text-uppercase font-weight-bold">
        <v-icon icon="mdi-calendar-week" size="small" class="mr-1"></v-icon>
        Semanal
      </v-tab>
      <v-tab value="monthly" class="text-caption text-uppercase font-weight-bold">
        <v-icon icon="mdi-calendar-month" size="small" class="mr-1"></v-icon>
        Mensual
      </v-tab>
    </v-tabs>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <v-row>
        <v-col cols="12" md="7">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">Reservas {{ tabTitles[activeTab] }}</h3>

          <div class="chart-container" style="height: 240px">
            <canvas ref="reservationChart"></canvas>
          </div>
        </v-col>

        <v-col cols="12" md="5">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">Distribución por servicio</h3>

          <div class="chart-container" style="height: 240px">
            <canvas ref="serviceChart"></canvas>
          </div>
        </v-col>

        <v-col cols="12" class="mt-4">
          <v-divider class="mb-4"></v-divider>

          <div class="d-flex flex-wrap justify-space-between">
            <div class="stats-card pa-3 mb-3">
              <div class="text-caption text-medium-emphasis mb-1">Tasa de aprobación</div>
              <div class="d-flex align-center">
                <div class="text-h5 font-weight-bold mr-2">92%</div>
                <v-chip size="x-small" color="success">
                  <v-icon icon="mdi-chevron-up" size="x-small" start></v-icon>
                  3%
                </v-chip>
              </div>
            </div>

            <div class="stats-card pa-3 mb-3">
              <div class="text-caption text-medium-emphasis mb-1">Tiempo respuesta</div>
              <div class="d-flex align-center">
                <div class="text-h5 font-weight-bold mr-2">4.2h</div>
                <v-chip size="x-small" color="error">
                  <v-icon icon="mdi-chevron-up" size="x-small" start></v-icon>
                  1.5h
                </v-chip>
              </div>
            </div>

            <div class="stats-card pa-3 mb-3">
              <div class="text-caption text-medium-emphasis mb-1">Servicio más solicitado</div>
              <div class="d-flex align-center">
                <div class="text-h5 font-weight-bold mr-2">Corte</div>
                <v-chip size="x-small" color="success">
                  <v-icon icon="mdi-chevron-up" size="x-small" start></v-icon>
                  12%
                </v-chip>
              </div>
            </div>

            <div class="stats-card pa-3 mb-3">
              <div class="text-caption text-medium-emphasis mb-1">Cancelaciones</div>
              <div class="d-flex align-center">
                <div class="text-h5 font-weight-bold mr-2">8%</div>
                <v-chip size="x-small" color="success">
                  <v-icon icon="mdi-chevron-down" size="x-small" start></v-icon>
                  2%
                </v-chip>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import Chart from 'chart.js/auto';

  // Estado
  const activeTab = ref('daily');
  const reservationChart = ref<HTMLCanvasElement | null>(null);
  const serviceChart = ref<HTMLCanvasElement | null>(null);
  let lineChart: Chart | null = null;
  let pieChart: Chart | null = null;

  // Tab titles from constants
  const tabTitles = {
    daily: 'Diarias',
    weekly: 'Semanales',
    monthly: 'Mensuales'
  };

  // Datos simulados para los gráficos
  const chartData = {
    daily: {
      labels: [
        '9:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00'
      ],
      datasets: [
        {
          label: 'Recibidas',
          data: [4, 7, 8, 12, 5, 3, 9, 11, 6, 4],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Aprobadas',
          data: [3, 6, 7, 10, 4, 2, 7, 9, 5, 3],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    weekly: {
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      datasets: [
        {
          label: 'Recibidas',
          data: [28, 32, 25, 37, 41, 46, 18],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Aprobadas',
          data: [25, 29, 22, 34, 38, 43, 16],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    monthly: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: 'Recibidas',
          data: [120, 135, 150, 142, 158, 165, 172, 168, 155, 140, 145, 160],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Aprobadas',
          data: [110, 125, 140, 133, 147, 153, 165, 160, 145, 130, 135, 150],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    }
  };

  const serviceData = {
    labels: ['Corte', 'Manicura', 'Pedicura', 'Masaje', 'Otros'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: ['#2196F3', '#FF9800', '#E91E63', '#4CAF50', '#9C27B0'],
        borderWidth: 0
      }
    ]
  };

  // Inicializar los gráficos
  const initCharts = () => {
    if (reservationChart.value && serviceChart.value) {
      // Destruir gráficos existentes si hay
      if (lineChart) lineChart.destroy();
      if (pieChart) pieChart.destroy();

      // Crear gráfico de línea
      lineChart = new Chart(reservationChart.value, {
        type: 'line',
        data: chartData[activeTab.value as keyof typeof chartData],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(30, 30, 46, 0.9)',
              padding: 10,
              cornerRadius: 8,
              titleFont: {
                size: 14,
                weight: 'bold'
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.1)'
              }
            }
          },
          elements: {
            point: {
              radius: 3,
              hoverRadius: 5
            },
            line: {
              borderWidth: 2
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        }
      });

      // Crear gráfico de tarta
      pieChart = new Chart(serviceChart.value, {
        type: 'doughnut',
        data: serviceData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(30, 30, 46, 0.9)',
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${percentage}% (${value})`;
                }
              }
            }
          },
          cutout: '65%',
          borderWidth: 0,
          layout: {
            padding: 10
          }
        }
      });
    }
  };

  // Observar cambios en la pestaña activa para actualizar gráficos
  watch(activeTab, () => {
    initCharts();
  });

  // Inicializar gráficos al montar el componente
  onMounted(() => {
    initCharts();
  });
</script>

<style scoped>
  .stats-card {
    background-color: rgba(var(--v-theme-surface-variant), 0.5);
    border-radius: 12px;
    min-width: 150px;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .stats-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .chart-container {
    position: relative;
    width: 100%;
  }

  @media (max-width: 600px) {
    .stats-card {
      width: 100%;
      margin-right: 0;
    }
  }
</style>
