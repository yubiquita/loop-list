<template>
  <div class="relative mb-2 node-container" :style="{ marginLeft: (item.indent * 24) + 'px' }">
    <!-- 背景フィードバック: インデント (右スワイプ) -->
    <div 
      class="absolute inset-0 flex items-center pl-3 bg-indigo-50 text-indigo-600 rounded-lg transition-opacity duration-200 border border-indigo-100 overflow-hidden"
      :class="{ 'opacity-100': swipeOffset > 20, 'opacity-0': swipeOffset <= 20 }"
    >
      <span class="text-sm font-bold whitespace-nowrap">→ 子にする</span>
    </div>
    
    <!-- 背景フィードバック: アウトデント (左スワイプ) -->
    <div 
      class="absolute inset-0 flex items-center pr-3 bg-orange-50 text-orange-600 justify-end rounded-lg transition-opacity duration-200 border border-orange-100 overflow-hidden"
      :class="{ 'opacity-100': swipeOffset < -20, 'opacity-0': swipeOffset >= -20 }"
    >
      <span class="text-sm font-bold whitespace-nowrap">親に戻す ←</span>
    </div>

    <!-- タスク本体 -->
    <div
      class="check-item"
      :class="{ checked: item.checked, dragging: isDragging }"
      :style="{ transform: `translateX(${swipeOffset}px)` }"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchEnd"
    >
      <div class="checkbox-wrapper" @click.stop="toggleItem">
        <div class="custom-checkbox" :class="{ checked: item.checked }">
          <span v-if="item.checked">✓</span>
        </div>
      </div>
      
      <label @click.stop="toggleItem">{{ item.text }}</label>
      
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

// 状態
const isDragging = ref(false)
const swipeOffset = ref(0)
const startX = ref(0)
const startY = ref(0)
const isSwiping = ref(false)
const SWIPE_THRESHOLD = 60

// 項目のチェック状態を切り替え
const toggleItem = () => {
  checklistStore.toggleItem(props.listId, props.item.id)
}

// タッチ開始
const handleTouchStart = (e: TouchEvent) => {
  startX.value = e.touches[0].clientX
  startY.value = e.touches[0].clientY
  isSwiping.value = true
}

// タッチ移動
const handleTouchMove = (e: TouchEvent) => {
  if (!isSwiping.value) return
  
  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const diffX = currentX - startX.value
  const diffY = currentY - startY.value

  // 縦方向の動きが大きい場合はスクロールとみなす
  if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 10) {
    isSwiping.value = false
    swipeOffset.value = 0
    return
  }

  // スワイプによる横移動
  if (props.item.indent === 0) {
    // 親タスクは右スワイプ（インデント）のみ許可、左は少しだけ
    swipeOffset.value = Math.max(-20, Math.min(120, diffX))
  } else {
    // 子タスクは左スワイプ（アウトデント）のみ許可、右は少しだけ
    swipeOffset.value = Math.max(-120, Math.min(20, diffX))
  }

  // 横方向の動きが支配的な場合はスクロールを防止
  if (Math.abs(diffX) > 10 && e.cancelable) {
    e.preventDefault()
  }
}

// タッチ終了
const handleTouchEnd = () => {
  if (!isSwiping.value) return
  isSwiping.value = false
  
  if (swipeOffset.value > SWIPE_THRESHOLD && props.item.indent === 0) {
    // 右スワイプ: インデント
    checklistStore.toggleIndentation(props.listId, props.item.id)
  } else if (swipeOffset.value < -SWIPE_THRESHOLD && props.item.indent > 0) {
    // 左スワイプ: アウトデント
    checklistStore.toggleIndentation(props.listId, props.item.id)
  }
  
  swipeOffset.value = 0
}
</script>

<style scoped>
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-end {
  justify-content: flex-end;
}

.pl-3 {
  padding-left: 12px;
}

.pr-3 {
  padding-right: 12px;
}

.bg-indigo-50 {
  background-color: #eef2ff;
}

.text-indigo-600 {
  color: #4f46e5;
}

.bg-orange-50 {
  background-color: #fff7ed;
}

.text-orange-600 {
  color: #ea580c;
}

.border {
  border-width: 1px;
}

.border-indigo-100 {
  border-color: #e0e7ff;
}

.border-orange-100 {
  border-color: #ffedd5;
}

.rounded-lg {
  border-radius: 8px;
}

.transition-opacity {
  transition-property: opacity;
}

.duration-200 {
  transition-duration: 200ms;
}

.opacity-0 {
  opacity: 0;
}

.opacity-100 {
  opacity: 1;
}

.font-bold {
  font-weight: 700;
}

.text-sm {
  font-size: 0.875rem;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.overflow-hidden {
  overflow: hidden;
}

.mb-2 {
  margin-bottom: 8px;
}

.node-container {
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.check-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: transform 0.1s ease-out, border-color 0.2s;
  z-index: 1;
  touch-action: pan-y;
}

.check-item:hover {
  border-color: #e0e0e0;
}

.checkbox-wrapper {
  margin-right: 16px;
  cursor: pointer;
}

.custom-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s;
  background: white;
}

.custom-checkbox.checked {
  background: #8BC34A;
  border-color: #8BC34A;
}

.check-item label {
  flex: 1;
  font-size: 16px;
  cursor: pointer;
  line-height: 1.4;
  user-select: none;
  transition: color 0.2s;
}

.check-item.checked label {
  color: #bbb;
  text-decoration: line-through;
}

.drag-handle {
  padding: 4px 8px;
  color: #ccc;
  cursor: grab;
  user-select: none;
  font-size: 18px;
}

.drag-handle:active {
  cursor: grabbing;
}

.dots {
  letter-spacing: -2px;
}
</style>
