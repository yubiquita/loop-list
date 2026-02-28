<template>
  <div class="node-container">
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
      
      <!-- ドラッグハンドル (Phase 3 以降で使用) -->
      <div class="drag-handle">
        <span class="dots">⋮⋮</span>
      </div>
    </div>

    <!-- 子要素の再帰的な表示 -->
    <div v-if="item.subItems && item.subItems.length > 0" class="sub-items">
      <ChecklistNode
        v-for="subItem in item.subItems"
        :key="subItem.id"
        :item="subItem"
        :listId="listId"
      />
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
const SWIPE_THRESHOLD = 40

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
  
  // 水平方向のスワイプが一定量あれば、スクロールを防止
  if (Math.abs(deltaX) > 10) {
    if (e.cancelable) e.preventDefault()
  }
}

// スワイプ終了
const onTouchEnd = () => {
  const deltaX = touchCurrentX.value - touchStartX.value
  
  if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
    if (deltaX > 0) {
      // 右スワイプ: インデント
      checklistStore.toggleIndentation(props.listId, props.item.id)
    } else {
      // 左スワイプ: アウトデント
      // すでにトップレベルではない（親がいる）場合のみアウトデントを試みる
      // (store側のロジックで判定される)
      checklistStore.toggleIndentation(props.listId, props.item.id)
    }
  }
  
  touchStartX.value = 0
  touchCurrentX.value = 0
}
</script>

<style scoped>
.node-container {
  display: flex;
  flex-direction: column;
}

.check-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  background: white;
}

.sub-items {
  margin-left: 24px;
  border-left: 1px solid #e0e0e0;
  padding-left: 4px;
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
}

.check-item.checked label {
  color: #999;
  text-decoration: line-through;
}

.drag-handle {
  padding: 0 12px;
  color: #ccc;
  cursor: grab;
  user-select: none;
  font-size: 20px;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
