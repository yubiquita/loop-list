<template>
  <div class="modal-overlay" @click="$emit('cancel')">
    <div class="modal-content" @click.stop>
      <p class="confirm-message">{{ message }}</p>
      <div class="modal-actions">
        <button class="confirm-yes" @click="$emit('confirm')">はい</button>
        <button class="confirm-no" @click="$emit('cancel')">いいえ</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string
}

defineProps<Props>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 320px;
  width: 90%;
  text-align: center;
}

.confirm-message {
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-yes,
.confirm-no {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 80px;
}

.confirm-yes {
  background: #f44336;
  color: white;
}

.confirm-yes:hover {
  background: #d32f2f;
}

.confirm-no {
  background: #e0e0e0;
  color: #333;
}

.confirm-no:hover {
  background: #d5d5d5;
}
</style>