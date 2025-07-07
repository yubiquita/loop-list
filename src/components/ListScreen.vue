<template>
  <div class="screen">
    <div class="list-container">
      <!-- 空の状態 -->
      <div v-if="checklistStore.totalLists === 0" class="empty-state">
        <p>まだリストがありません</p>
        <p>上の + ボタンでリストを作成してください</p>
      </div>

      <!-- リスト一覧 -->
      <div v-else>
        <div
          v-for="list in checklistStore.lists"
          :key="list.id"
          class="list-item"
          @click="$emit('view-list', list.id)"
        >
          <div class="list-info">
            <h3>{{ list.name }}</h3>
            <p>{{ getProgressText(list) }}</p>
          </div>
          <div class="list-actions" @click.stop>
            <button class="edit-btn" @click="$emit('edit-list', list.id)">編集</button>
            <button class="delete-btn" @click="deleteList(list.id)">削除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChecklistStore, useUIStore } from '../stores'
import { calculateProgress } from '../utils'
import { CONSTANTS } from '../constants'
import type { ChecklistList } from '../types'

defineEmits<{
  'edit-list': [listId: string]
  'view-list': [listId: string]
}>()

const checklistStore = useChecklistStore()
const uiStore = useUIStore()

// プログレステキストを取得
const getProgressText = (list: ChecklistList): string => {
  const progress = calculateProgress(list.items)
  if (progress.total === 0) {
    return '項目なし'
  }
  return `${progress.completed}/${progress.total} (${progress.percentage}%)`
}

// リスト削除
const deleteList = (listId: string) => {
  const list = checklistStore.lists.find(l => l.id === listId)
  if (!list) return

  uiStore.showConfirm(
    CONSTANTS.MESSAGES.CONFIRM_DELETE_LIST,
    () => {
      checklistStore.deleteList(listId)
      uiStore.showSuccess('リストを削除しました')
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

.list-container {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state p:first-child {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-state p:last-child {
  font-size: 14px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.list-item:hover {
  background: #f8f9fa;
  border-color: #689F38;
}

.list-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.list-info p {
  font-size: 14px;
  color: #666;
}

.list-actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: #2196F3;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.edit-btn:hover {
  background: #1976D2;
}

.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: #f44336;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #d32f2f;
}

@media (max-width: 480px) {
  .list-container {
    padding: 16px;
  }
}
</style>