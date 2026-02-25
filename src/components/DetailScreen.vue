<template>
  <div class="screen">
    <!-- ヘッダー -->
    <div class="detail-header">
      <button class="back-btn" @click="$emit('back')">← 戻る</button>
      <h2>{{ currentList?.name || 'リスト詳細' }}</h2>
      <button class="edit-btn" @click="$emit('edit-list')">編集</button>
    </div>

    <!-- プログレスバー -->
    <ProgressBar v-if="currentList" :progress="progress" :show-text="true" />

    <!-- 項目一覧 -->
    <div class="item-list">
      <div v-if="!currentList || currentList.items.length === 0" class="empty-message">
        <p>項目がありません</p>
        <p>編集ボタンから項目を追加してください</p>
      </div>

      <div v-else>
        <div
          v-for="item in currentList.items"
          :key="item.id"
          class="check-item"
          :class="{ checked: item.checked, indented: item.indent }"
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
        </div>
      </div>
    </div>

    <!-- アクションボタン -->
    <div v-if="currentList && currentList.items.length > 0" class="action-buttons">
      <button class="reset-btn" @click="resetCheckedItems">チェックをリセット</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChecklistStore, useUIStore } from '../stores'
import { calculateProgress } from '../utils'
import ProgressBar from './ProgressBar.vue'

defineEmits<{
  'edit-list': []
  'back': []
}>()

const checklistStore = useChecklistStore()
const uiStore = useUIStore()

// スワイプ操作用のステート
const touchStartX = ref(0)
const touchCurrentX = ref(0)
const activeItemId = ref<string | null>(null)
const SWIPE_THRESHOLD = 40

// 現在のリスト
const currentList = computed(() => checklistStore.currentList)

// プログレス情報
const progress = computed(() => {
  if (!currentList.value) {
    return { completed: 0, total: 0, percentage: 0 }
  }
  return calculateProgress(currentList.value.items)
})

// 項目のチェック状態を切り替え
const toggleItem = (itemId: string) => {
  if (!currentList.value) return
  checklistStore.toggleItem(currentList.value.id, itemId)
}

// スワイプ開始
const onTouchStart = (e: TouchEvent, itemId: string) => {
  touchStartX.value = e.touches[0].clientX
  touchCurrentX.value = touchStartX.value
  activeItemId.value = itemId
}

// スワイプ中
const onTouchMove = (e: TouchEvent) => {
  if (!activeItemId.value) return
  
  touchCurrentX.value = e.touches[0].clientX
  const deltaX = touchCurrentX.value - touchStartX.value
  
  // 水平方向のスワイプが一定量あれば、スクロールを防止
  if (Math.abs(deltaX) > 10) {
    if (e.cancelable) e.preventDefault()
  }
}

// スワイプ終了
const onTouchEnd = () => {
  if (!activeItemId.value) return

  const deltaX = touchCurrentX.value - touchStartX.value
  
  if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
    if (deltaX > 0) {
      // 右スワイプ: インデント
      setIndent(activeItemId.value, true)
    } else {
      // 左スワイプ: アウトデント
      setIndent(activeItemId.value, false)
    }
  }
  
  touchStartX.value = 0
  touchCurrentX.value = 0
  activeItemId.value = null
}

// インデント状態を設定
const setIndent = (itemId: string, shouldIndent: boolean) => {
  if (!currentList.value) return
  
  const itemIndex = currentList.value.items.findIndex(i => i.id === itemId)
  if (itemIndex === -1) return
  
  const item = currentList.value.items[itemIndex]
  
  // 最初の項目はインデント不可（親が存在しないため）
  if (shouldIndent && itemIndex === 0) {
    return
  }
  
  // 現在の状態と異なる場合のみ更新
  if (!!item.indent !== shouldIndent) {
    checklistStore.toggleIndentation(currentList.value.id, itemId)
  }
}

// チェック済み項目をリセット
const resetCheckedItems = () => {
  if (!currentList.value) return

  uiStore.showConfirm(
    'チェックをすべてリセットしますか？',
    () => {
      if (currentList.value) {
        checklistStore.uncheckAllItems(currentList.value.id)
        uiStore.showSuccess('チェックをリセットしました')
      }
    }
  )
}
</script>

<style scoped>
.screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #689F38;
  color: white;
}

.detail-header h2 {
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  text-align: center;
  margin: 0 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.back-btn, .edit-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.back-btn:hover, .edit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.item-list {
  padding: 0 20px;
  flex: 1;
  overflow-y: auto;
}

.empty-message {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-message p:first-child {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-message p:last-child {
  font-size: 14px;
}

.check-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: margin-left 0.2s, padding-left 0.2s;
}

.check-item.indented {
  margin-left: 16px;
  padding-left: 12px;
  border-left: 2px solid #e0e0e0;
}

.check-item:last-child {
  border-bottom: none;
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

.action-buttons {
  padding: 20px;
  text-align: center;
}

.reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background: #FF9800;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: #F57C00;
}

@media (max-width: 480px) {
  .item-list {
    padding: 0 16px;
  }
  
  .action-buttons {
    padding: 16px;
  }
}
</style>