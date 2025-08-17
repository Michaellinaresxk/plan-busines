<template>
  <v-dialog v-model="dialog" max-width="800" persistent scrollable>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center ga-2 pa-6">
        <v-icon icon="mdi-plus-circle" color="primary"></v-icon>
        <span class="text-h5 font-weight-bold">Crear Nuevo Servicio</span>
        <v-spacer></v-spacer>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="closeDialog"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
          <!-- Información Básica -->
          <div class="mb-6">
            <h3 class="text-h6 mb-4 text-primary">Información Básica</h3>

            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.title"
                  label="Título del Servicio *"
                  variant="outlined"
                  :rules="titleRules"
                  placeholder="ej: ATV Polaris RZR - Aventura Estándar"
                  prepend-inner-icon="mdi-format-title"
                  required></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.category"
                  :items="categoryOptions"
                  label="Categoría *"
                  variant="outlined"
                  :rules="requiredRules"
                  prepend-inner-icon="mdi-shape"
                  @update:model-value="onCategoryChange"
                  required></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.currency"
                  :items="currencyOptions"
                  label="Moneda *"
                  variant="outlined"
                  :rules="requiredRules"
                  prepend-inner-icon="mdi-currency-usd"
                  required></v-select>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Descripción"
                  variant="outlined"
                  rows="3"
                  placeholder="Describe el servicio, duración, qué incluye, etc."
                  prepend-inner-icon="mdi-text"></v-textarea>
              </v-col>
            </v-row>
          </div>

          <!-- Precio Base -->
          <div class="mb-6">
            <h3 class="text-h6 mb-4 text-primary">Precio Base</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.basePrice"
                  label="Precio Base *"
                  variant="outlined"
                  type="number"
                  min="0"
                  step="0.01"
                  :rules="priceRules"
                  :prefix="formData.currency === 'USD' ? '$' : 'RD$'"
                  placeholder="0.00"
                  prepend-inner-icon="mdi-cash"
                  required></v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- Variantes del Servicio -->
          <div class="mb-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="text-h6 text-primary">Variantes del Servicio</h3>
              <div class="d-flex ga-2">
                <v-btn
                  v-if="availablePredefinedVariants.length > 0"
                  color="info"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-auto-fix"
                  @click="addPredefinedVariants">
                  Agregar {{ categoryDisplayName }} Estándar
                </v-btn>
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addCustomVariant">
                  Variante Personalizada
                </v-btn>
              </div>
            </div>

            <p class="text-body-2 text-medium-emphasis mb-4">
              Las variantes te permiten ofrecer diferentes opciones del mismo servicio.
              {{ selectedCategoryHelp }}
            </p>

            <div v-for="(variant, index) in formData.variants" :key="index" class="mb-4">
              <v-card variant="outlined" rounded="lg">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <h4 class="text-subtitle-1 font-weight-medium">Variante {{ index + 1 }}</h4>
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      size="small"
                      color="error"
                      @click="removeVariant(index)"></v-btn>
                  </div>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="variant.name"
                        label="Nombre de la Variante *"
                        variant="outlined"
                        density="compact"
                        :rules="requiredRules"
                        placeholder="ej: Yate Sea Ray 45ft"
                        required></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="variant.price"
                        label="Precio *"
                        variant="outlined"
                        density="compact"
                        type="number"
                        min="0"
                        step="0.01"
                        :rules="priceRules"
                        :prefix="formData.currency === 'USD' ? '$' : 'RD$'"
                        required></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="variant.maxCapacity"
                        label="Capacidad Máxima"
                        variant="outlined"
                        density="compact"
                        type="number"
                        min="1"
                        placeholder="ej: 8 personas"
                        suffix="personas"></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-switch
                        v-model="variant.isAvailable"
                        label="Disponible"
                        color="primary"
                        inset></v-switch>
                    </v-col>

                    <v-col cols="12">
                      <v-textarea
                        v-model="variant.description"
                        label="Descripción de la Variante"
                        variant="outlined"
                        density="compact"
                        rows="2"
                        placeholder="Describe las características específicas de esta variante"></v-textarea>
                    </v-col>

                    <v-col cols="12">
                      <v-combobox
                        v-model="variant.features"
                        label="Características Incluidas"
                        variant="outlined"
                        density="compact"
                        multiple
                        chips
                        clearable
                        placeholder="ej: Capitán incluido, Bar abierto, Equipo snorkel"
                        hint="Presiona Enter para agregar cada característica"></v-combobox>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>
          </div>

          <!-- Tags -->
          <div class="mb-6">
            <h3 class="text-h6 mb-4 text-primary">Etiquetas</h3>

            <v-combobox
              v-model="formData.tags"
              label="Etiquetas del Servicio"
              variant="outlined"
              multiple
              chips
              clearable
              placeholder="ej: atv, adventure, outdoor, family-friendly"
              hint="Las etiquetas ayudan a organizar y buscar servicios"
              prepend-inner-icon="mdi-tag"></v-combobox>
          </div>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="loading">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="handleSubmit"
          :loading="loading"
          :disabled="!valid">
          Crear Servicio
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { serviceServiceKey } from '@/services/ServiceService';

// Dependencies
const serviceService = inject(serviceServiceKey);

if (!serviceService) {
  throw new Error('ServiceService not provided');
}

// Props & Emits
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'service-created': [];
}>();

// Form state
const form = ref();
const valid = ref(false);
const loading = ref(false);

// Form data
const formData = ref({
  title: '',
  category: '',
  basePrice: 0,
  currency: 'USD',
  description: '',
  variants: [] as any[],
  tags: []
});

// Predefined variants based on category
const predefinedVariants = {
  'atv': [
    { name: 'ATV', price: 180, maxCapacity: 1, description: 'ATV Polaris RZR para 1 persona', features: ['Casco incluido', 'Guía bilingüe', 'Seguro básico'] },
    { name: 'Polaris', price: 280, maxCapacity: 2, description: 'ATV Polaris RZR para 2 personas', features: ['Cascos incluidos', 'Guía bilingüe', 'Seguro básico', 'Agua embotellada'] },
    { name: 'Buggies', price: 160, maxCapacity: 1, description: 'Buggy deportivo individual', features: ['Casco incluido', 'Guía', 'Seguro'] },
    { name: 'ATV Buggies Doble', price: 250, maxCapacity: 2, description: 'Buggy deportivo para 2 personas', features: ['Cascos incluidos', 'Guía', 'Seguro', 'Refrigerios'] }
  ],
  'yachts': [
    { name: 'Fairline 43', price: 800, maxCapacity: 8, description: 'Yate Sea Ray de 45 pies', features: ['Capitán incluido', 'Bar abierto', 'Equipo pesca', 'Snorkel', 'Música'] },
    { name: 'Aicon Fly 60', price: 1200, maxCapacity: 12, description: 'Yate Azimut de 55 pies - Premium', features: ['Capitán y marinero', 'Chef privado', 'Bar premium', 'Jacuzzi', 'Jet ski', 'Fotógrafo'] },
  ],
  'catamaran': [
    { name: 'Catamarán Standard', price: 600, maxCapacity: 12, description: 'Catamarán Lagoon para hasta 12 personas', features: ['Capitán incluido', 'Almuerzo', 'Bar abierto', 'Equipo snorkel', 'Música'] },
    { name: 'Catamarán Con Slide', price: 900, maxCapacity: 16, description: 'Catamarán de lujo para hasta 16 personas', features: ['Capitán y marinero', 'Almuerzo gourmet', 'Bar premium', 'Jacuzzi', 'Paddle boards', 'Photographer'] }
  ],
  'transportation': [
    { name: 'SUV', price: 80, maxCapacity: 6, description: 'SUV para hasta 6 pasajeros', features: ['Aire acondicionado', 'WiFi', 'Agua embotellada'] },
    { name: 'Van', price: 90, maxCapacity: 8, description: 'Van para hasta 8 pasajeros', features: ['A/C', 'WiFi', 'Agua', 'Asientos cómodos'] },
  ]
};

// Computed properties for dynamic content
const availablePredefinedVariants = computed(() => {
  return predefinedVariants[formData.value.category as keyof typeof predefinedVariants] || [];
});

const categoryDisplayName = computed(() => {
  const nameMap: Record<string, string> = {
    'atv': 'ATVs',
    'buggies': 'Buggies',
    'polaris': 'Polaris',
    'yachts': 'Yates',
    'catamaran': 'Catamaranes',
    'transportation': 'Transporte'
  };
  return nameMap[formData.value.category] || 'Opciones';
});

const selectedCategoryHelp = computed(() => {
  const helpMap: Record<string, string> = {
    'atv': 'Para ATVs puedes ofrecer Polaris RZR individual/doble, Buggies deportivos, etc.',
    'buggies': 'Para Buggies puedes ofrecer diferentes capacidades (2, 4 plazas) y niveles de servicio.',
    'polaris': 'Para Polaris puedes ofrecer RZR estándar, Premium, o Slingshot de 3 ruedas.',
    'yachts': 'Para Yates puedes ofrecer diferentes tamaños (45ft, 55ft, 60ft) con distintos niveles de lujo.',
    'catamaran': 'Para Catamaranes puedes ofrecer diferentes tamaños y niveles de servicio.',
    'transportation': 'Para Transporte puedes ofrecer SUV, Vans de diferentes capacidades.'
  };
  return helpMap[formData.value.category] || 'Personaliza las opciones según tu servicio.';
});

// Dialog computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Options
const categoryOptions = [
  { title: 'ATV Adventures', value: 'atv' },
  { title: 'Buggy Tours', value: 'buggies' },
  { title: 'Polaris Premium', value: 'polaris' },
  { title: 'Yates de Lujo', value: 'yachts' },
  { title: 'Catamarán Tours', value: 'catamaran' },
  { title: 'Transporte', value: 'transportation' },
  { title: 'Tours & Excursiones', value: 'tours' },
  { title: 'Comida & Bebidas', value: 'food-drinks' },
  { title: 'Bienestar', value: 'wellness' },
  { title: 'Entretenimiento', value: 'leisure' },
  { title: 'Actividades Acuáticas', value: 'water-activities' }
];

const currencyOptions = [
  { title: 'USD - Dólar Americano', value: 'USD' },
  { title: 'DOP - Peso Dominicano', value: 'DOP' }
];

// Validation rules
const titleRules = [
  (v: string) => !!v || 'El título es requerido',
  (v: string) => v.length >= 3 || 'El título debe tener al menos 3 caracteres',
  (v: string) => v.length <= 100 || 'El título no puede exceder 100 caracteres'
];

const requiredRules = [
  (v: any) => !!v || 'Este campo es requerido'
];

const priceRules = [
  (v: number) => v >= 0 || 'El precio debe ser positivo',
  (v: number) => v <= 1000000 || 'El precio no puede exceder $1,000,000'
];

// Methods
function onCategoryChange() {
  console.log('📂 Category changed to:', formData.value.category);
  // Clear existing variants when category changes
  formData.value.variants = [];
}

function addPredefinedVariants() {
  const predefined = availablePredefinedVariants.value;
  if (predefined.length > 0) {
    // Add all predefined variants for this category
    formData.value.variants = predefined.map(variant => ({
      ...variant,
      isAvailable: true
    }));
    console.log('✅ Added predefined variants for', formData.value.category, ':', predefined.length);
  }
}

function addCustomVariant() {
  formData.value.variants.push({
    name: '',
    price: formData.value.basePrice,
    description: '',
    isAvailable: true,
    maxCapacity: 1,
    features: []
  });
}

function addVariant() {
  // Legacy method - redirect to custom variant
  addCustomVariant();
}

function removeVariant(index: number) {
  formData.value.variants.splice(index, 1);
}

async function handleSubmit() {
  if (!valid.value) return;

  try {
    loading.value = true;
    console.log('🚀 Creating service:', formData.value);

    await serviceService.createService(
      formData.value.title,
      formData.value.category,
      formData.value.basePrice,
      formData.value.currency,
      formData.value.description,
      formData.value.variants,
      formData.value.tags
    );

    console.log('✅ Service created successfully');
    emit('service-created');
    resetForm();

  } catch (error) {
    console.error('❌ Error creating service:', error);
    // TODO: Show error notification
  } finally {
    loading.value = false;
  }
}

function closeDialog() {
  if (!loading.value) {
    dialog.value = false;
    resetForm();
  }
}

function resetForm() {
  formData.value = {
    title: '',
    category: '',
    basePrice: 0,
    currency: 'USD',
    description: '',
    variants: [],
    tags: []
  };

  if (form.value) {
    form.value.reset();
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm();
  }
});
</script>

<style scoped>
.v-card {
  max-height: 90vh;
}

.v-card-text {
  overflow-y: auto;
}
</style>
