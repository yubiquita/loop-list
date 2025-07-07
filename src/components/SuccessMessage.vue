<template>
  <div class="success-message">
    <div class="success-content">
      <span class="success-text">{{ message }}</span>
      <button class="success-close" @click="$emit('close')">&times;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string
}

defineProps<Props>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.success-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  max-width: 90%;
  width: 400px;
}

.success-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #4CAF50;
  color: white;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.success-text {
  font-size: 14px;
  flex: 1;
}

.success-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-close:hover {
  opacity: 0.8;
}
</style>