<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="task-row">
      <input
        v-model="newTask"
        type="text"
        placeholder="Nova tarefa..."
        class="task-input"
      />

      <button
        type="submit"
        class="task-button"
        :disabled="uploading || loadingLocation"
      >
        {{ editingTask ? 'Alterar' : 'Adicionar' }}
      </button>

      <button
        v-if="editingTask"
        type="button"
        class="task-button-cancel"
        @click="handleCancel"
      >
        Cancelar
      </button>
    </div>

    
    <div class="location-section">
      <div class="location-controls">
        <button
          type="button"
          class="location-button"
          :disabled="loadingLocation"
          @click="handleGetLocation"
        >
          {{ loadingLocation ? 'Obtendo localização...' : '📍 Capturar Localização' }}
        </button>

        <button
          v-if="location"
          type="button"
          class="location-button-remove"
          @click="clearLocation"
        >
          Remover Localização
        </button>
      </div>

      <p v-if="locationError" class="location-error">
        {{ locationError }}
      </p>

      <div v-if="location" class="location-info">
        <p class="location-label-text">
          <strong>Endereço:</strong> {{ location.label || 'Buscando endereço...' }}
        </p>
        <p class="location-coords">
          <small>
            Lat: {{ location.latitude.toFixed(4) }}, Lon: {{ location.longitude.toFixed(4) }}
            <span v-if="location.accuracy">(±{{ Math.round(location.accuracy) }}m)</span>
          </small>
        </p>

       
        <TaskLocationMap :location="location" />
      </div>
    </div>

    <div class="image-section">
     
      <img
        v-if="previewUrl || editingTask?.img_url"
        :src="previewUrl || editingTask?.img_url"
        class="image-preview"
        alt="Imagem da tarefa"
      />

      
      <label
        class="image-label"
        :class="{ disabled: uploading }"
      >
        <span
          v-if="uploading"
          class="upload-status"
        >
          Enviando...
        </span>

        <span v-else>
          {{
            previewUrl || editingTask?.img_url
              ? 'Trocar imagem'
              : 'Adicionar imagem'
          }}
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          class="image-input"
          :disabled="uploading"
          @change="handleImageChange"
        />
      </label>

      
      <button
        type="button"
        class="task-button-camera"
        :disabled="uploading"
        @click="showCameraCapture = !showCameraCapture"
      >
        {{
          showCameraCapture
            ? 'Fechar câmera'
            : 'Abrir câmera'
        }}
      </button>

    
      <CameraCapture
        v-if="showCameraCapture"
        @captured="handleCameraCapture"
      />

      <p class="image-help">
        Em celular, você pode usar a câmera pelo botão
        "Adicionar imagem" ou pelo preview ao vivo.
      </p>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import tasksApi from '../api/tasksApi.js'
import geocodingApi from '../api/geocodingApi.js'
import { buildLocationPayload } from '../utils/location.js'
import { useGeolocation } from '../composables/useGeolocation.js'
import CameraCapture from './CameraCapture.vue'
import TaskLocationMap from './TaskLocationMap.vue'

const props = defineProps({
  editingTask: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits([
  'add',
  'update',
  'cancel',
])

const newTask = ref('')
const previewUrl = ref(null)
const imgAttachmentKey = ref(null)
const uploading = ref(false)
const showCameraCapture = ref(false)

// Composable de Geolocalização (Passo 2)
const {
  loadingLocation,
  locationError,
  location,
  setLocationFromTask,
  clearLocation,
  setLocationLabel,
  requestCurrentLocation,
} = useGeolocation()

watch(
  () => props.editingTask,
  (task) => {
    newTask.value = task ? task.title : ''

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }

    previewUrl.value = null
    imgAttachmentKey.value = null
    showCameraCapture.value = false

    // Carrega a localização da tarefa em edição
    setLocationFromTask(task)
  },
  { immediate: true }
)

// Captura localização e faz geocodificação reversa (Passo 5)
async function handleGetLocation() {
  const captured = await requestCurrentLocation()
  if (!captured) return

  try {
    const address = await geocodingApi.reverse(
      captured.latitude,
      captured.longitude,
    )
    setLocationLabel(address?.label)
  } catch {
    locationError.value =
      'Localização obtida, mas não foi possível identificar a rua.'
  }
}

async function handleImageChange(event) {
  const file = event.target.files[0]

  if (!file) return

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true

  try {
    const response = await tasksApi.uploadImage(file)

    imgAttachmentKey.value =
      response.data.attachment_key
  } catch (err) {
    console.error(
      'Erro ao fazer upload da imagem',
      err,
    )

    previewUrl.value = null
    imgAttachmentKey.value = null
  } finally {
    uploading.value = false
  }
}

async function handleCameraCapture(file) {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true

  try {
    const response = await tasksApi.uploadImage(file)

    imgAttachmentKey.value =
      response.data.attachment_key

    showCameraCapture.value = false
  } catch (err) {
    console.error(
      'Erro ao fazer upload da foto da câmera',
      err,
    )

    previewUrl.value = null
    imgAttachmentKey.value = null
  } finally {
    uploading.value = false
  }
}

function handleSubmit() {
  if (!newTask.value.trim()) return

  // Converte a localização para o formato do backend (Passo 3 & 5)
  const locationPayload = buildLocationPayload(location.value)

  const payload = {
    title: newTask.value.trim(),
    img_attachment_key: imgAttachmentKey.value,
    ...locationPayload,
  }

  if (props.editingTask) {
    emit(
      'update',
      props.editingTask.id,
      payload,
    )
  } else {
    emit('add', payload)
  }

  newTask.value = ''
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = null
  imgAttachmentKey.value = null
  showCameraCapture.value = false
  clearLocation()
}

function handleCancel() {
  newTask.value = ''

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = null
  imgAttachmentKey.value = null
  showCameraCapture.value = false
  clearLocation()

  emit('cancel')
}
</script>

<style scoped>
.task-form {
  margin-bottom: 24px;
}

.task-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.task-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.task-input:focus {
  border-color: #4a90d9;
}

.task-button {
  padding: 12px 20px;
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.task-button:hover:not(:disabled) {
  background-color: #357abd;
}

.task-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.task-button-cancel {
  padding: 12px 16px;
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.task-button-cancel:hover {
  border-color: #aaa;
}

/* Estilos da Geolocalização */
.location-section {
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

.location-controls {
  display: flex;
  gap: 8px;
}

.location-button {
  padding: 8px 14px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.location-button:hover:not(:disabled) {
  background-color: #219150;
}

.location-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.location-button-remove {
  padding: 8px 14px;
  background-color: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.location-button-remove:hover {
  
  background-color: #f71900;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}

.location-error {
  margin: 8px 0 0 0;
  color: #e74c3c;
  font-size: 0.85rem;
}

.location-info {
  margin-top: 10px;
}

.location-label-text {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
}

.location-coords {
  margin: 4px 0 0 0;
  color: #666;
}

/* Estilos de Imagem */
.image-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ccc;
  flex-wrap: wrap;
}

.image-preview {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
  flex-shrink: 0;
}

.image-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1.5px solid #4a90d9;
  color: #4a90d9;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.image-label:hover:not(.disabled) {
  background: #eaf2fb;
}

.image-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-input {
  display: none;
}

.task-button-camera {
  padding: 8px 14px;
  background-color: #357abd;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.task-button-camera:hover:not(:disabled) {
  background-color: #2868a8;
}

.task-button-camera:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-help {
  width: 100%;
  font-size: 0.75rem;
  color: #999;
  margin: 0;
}

.upload-status {
  color: #888;
}
</style>