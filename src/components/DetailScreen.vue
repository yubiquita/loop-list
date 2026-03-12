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

    <!-- 項目一覧 (ネストされたコンポーネント構造) -->
    <div class="item-list">
      <div v-if="!currentList || items.length === 0" class="empty-message">
        <p>項目がありません</p>
        <p>編集ボタンから項目を追加してください</p>
      </div>

      <div v-else>
        <!-- トップレベル項目のドラッグ＆ドロップ対応 -->
        <draggable
          v-model="items"
          handle=".drag-handle"
          item-key="id"
          group="tasks"
          :animation="200"
          tag="div"
        >
          <template #item="{ element }">
            <ChecklistNode
              :item="element"
              :listId="currentList!.id"
            />
          </template>
        </draggable>
      </div>
    </div>

    <!-- アクションボタン -->
    <div v-if="currentList && items.length > 0" class="action-buttons">
      <button class="reset-btn" @click="resetCheckedItems">チェックをリセット</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { useChecklistStore, useUIStore } from '../stores'
import { calculateProgress } from '../utils'
import ProgressBar from './ProgressBar.vue'
import ChecklistNode from './ChecklistNode.vue'

defineEmits<{
  'edit-list': []
  'back': []
}>()

const checklistStore = useChecklistStore()
const uiStore = useUIStore()

// 現在のリスト
const currentList = computed(() => checklistStore.currentList)

// 書き込み可能な算出プロパティを使用して vuedraggable とストアを同期
const items = computed({
  get: () => currentList.value?.items || [],
  set: (newItems) => {
    if (currentList.value) {
      checklistStore.updateList(currentList.value.id, { items: newItems })
    }
  }
})

// プログレス情報
const progress = computed(() => {
  if (!currentList.value) {
    return { completed: 0, total: 0, percentage: 0 }
  }
  return calculateProgress(currentList.value.items)
})

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
  display: flex;
  flex-direction: column;
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

.action-buttons {
  padding: 20px;
  text-align: center;
  background: white;
  border-top: 1px solid #f0f0f0;
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
