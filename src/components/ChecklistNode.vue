<template>
  <div class="node-container" :style="{ marginLeft: (item.indent * 24) + 'px' }">
    <div
      class="check-item"
      :class="{ checked: item.checked }"
      @touchstart="onTouchStart($event, item.id)"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <input
        type="checkbox"
        :checked="item.checked"
        @change="toggleItem(item.id)"
      />
      <label @click="toggleItem(item.id)">{{ item.text }}</label>
      
      <!-- ドラッグハンドル -->
      <div class="drag-handle">
        <span class="dots">⋮⋮</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ChecklistItem } from '../types'
import { useChecklistStore } from '../stores'

const props = defineProps<{
  item: ChecklistItem
  listId: string
}>()

const checklistStore = useChecklistStore()

// スワイプ操作用のステート
const touchStartX = ref(0)
const touchCurrentX = ref(0)
const SWIPE_THRESHOLD = 50

// 項目のチェック状態を切り替え
const toggleItem = (itemId: string) => {
  checklistStore.toggleItem(props.listId, itemId)
}

// スワイプ開始
const onTouchStart = (e: TouchEvent, _itemId: string) => {
  touchStartX.value = e.touches[0].clientX
  touchCurrentX.value = touchStartX.value
}

// スワイプ中
const onTouchMove = (e: TouchEvent) => {
  touchCurrentX.value = e.touches[0].clientX
  const deltaX = touchCurrentX.value - touchStartX.value
  
  if (Math.abs(deltaX) > 10) {
    if (e.cancelable) e.preventDefault()
    e.stopPropagation()
  }
}

// スワイプ終了
const onTouchEnd = () => {
  const deltaX = touchCurrentX.value - touchStartX.value
  
  if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
    // 右スワイプも左スワイプも、現状は toggleIndentation を呼ぶ
    // (ストア側で 0 <-> 1 の切り替えを行っているため)
    checklistStore.toggleIndentation(props.listId, props.item.id)
  }
  
  touchStartX.value = 0
  touchCurrentX.value = 0
}
</script>

<style scoped>
.node-container {
  display: flex;
  flex-direction: column;
  transition: margin-left 0.2s ease;
}

.check-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  background: white;
  touch-action: pan-y;
}

.check-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  cursor: pointer;
}

.check-item label {
  flex: 1;
  font-size: 16px;
  cursor: pointer;
  line-height: 1.4;
  user-select: none;
}

.check-item.checked label {
  color: #999;
  text-decoration: line-through;
}

.drag-handle {
  padding: 8px 12px;
  color: #ccc;
  cursor: grab;
  user-select: none;
  font-size: 20px;
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
