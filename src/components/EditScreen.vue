<template>
  <div class="screen">
    <!-- ヘッダー -->
    <div class="edit-header">
      <button class="cancel-btn" @click="$emit('cancel')">キャンセル</button>
      <h2>リスト編集</h2>
      <button class="save-btn" @click="$emit('save')">保存</button>
    </div>

    <!-- 編集フォーム -->
    <div class="edit-form">
      <!-- リスト名入力 -->
      <input
        v-model="listName"
        type="text"
        class="list-name-input"
        placeholder="リスト名を入力"
        @keydown="handleListNameKeydown"
        ref="listNameInput"
      />

      <!-- 項目編集 -->
      <div class="edit-items">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="edit-item"
        >
          <input
            v-model="item.text"
            type="text"
            class="item-input"
            placeholder="項目を入力"
            @keydown="(e) => handleItemKeydown(e, index)"
          />
          <button @click="removeItem(item.id)">削除</button>
        </div>
      </div>

      <!-- 新項目追加ボタン -->
      <button class="add-item-btn" @click="addNewItem">
        + 新しい項目を追加
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useChecklistStore, useUIStore } from '../stores'
import { generateId, focusLastAddedItem } from '../utils'
import { useDebounce } from '../composables/useDebounce'
import type { ChecklistItem } from '../types'

defineEmits<{
  'save': []
  'cancel': []
}>()

const checklistStore = useChecklistStore()
const uiStore = useUIStore()

// テンプレート参照
const listNameInput = ref<HTMLInputElement>()

// ローカル状態
const listName = ref('')
const items = ref<ChecklistItem[]>([])

// 現在のリスト
const currentList = computed(() => checklistStore.currentList)

// データの初期化
const initializeData = () => {
  if (currentList.value) {
    listName.value = currentList.value.name
    items.value = [...currentList.value.items]
  } else {
    listName.value = ''
    items.value = []
  }
}

// デバウンス付き同期
const { debouncedFn: debouncedSync } = useDebounce(() => {
  syncDataWithStore()
}, 300)

// ストアとの同期
const syncDataWithStore = () => {
  if (!currentList.value) return

  // リスト名の更新
  if (listName.value.trim() !== currentList.value.name) {
    checklistStore.updateList(currentList.value.id, {
      name: listName.value.trim()
    })
  }

  // 項目の更新（空の項目も保持、入力中の項目を削除しないように）
  checklistStore.updateList(currentList.value.id, {
    items: [...items.value]
  })
}

// 新しい項目を追加
const addNewItem = () => {
  const newItem: ChecklistItem = {
    id: generateId(),
    text: '',
    checked: false
  }
  
  items.value.push(newItem)
  
  nextTick(() => {
    focusLastAddedItem()
  })
}

// 項目を削除
const removeItem = (itemId: string) => {
  const index = items.value.findIndex(item => item.id === itemId)
  if (index !== -1) {
    items.value.splice(index, 1)
    debouncedSync()
  }
}


// リスト名のキーボードイベント
const handleListNameKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    uiStore.handleEnterKey(event, 'list-name')
  }
}

// 項目のキーボードイベント
const handleItemKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Enter' && !event.isComposing) {
    const item = items.value[index]
    if (item && item.text.trim()) {
      event.preventDefault()
      addNewItem()
    }
  }
}

// データ変更の監視
watch(listName, () => {
  debouncedSync()
})

watch(items, () => {
  debouncedSync()
}, { deep: true })

// マウント時の処理
onMounted(() => {
  initializeData()
  
  nextTick(() => {
    // リスト名入力にフォーカス
    if (listNameInput.value) {
      listNameInput.value.focus()
    }
  })
})

// アンマウント時の処理
onUnmounted(() => {
  syncDataWithStore()
})

// currentListの変更を監視
watch(currentList, () => {
  initializeData()
})
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

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #689F38;
  color: white;
}

.edit-header h2 {
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  text-align: center;
  margin: 0 16px;
}

.cancel-btn, .save-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.cancel-btn:hover, .save-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.edit-form {
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 68px);
  height: calc(100svh - 68px);
}

.list-name-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.list-name-input:focus {
  outline: none;
  border-color: #689F38;
  box-shadow: 0 0 0 2px rgba(104, 159, 56, 0.2);
}

.edit-items {
  margin-bottom: 20px;
}

.edit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.2s;
}

.edit-item:hover {
  background-color: #f0f0f0;
  border-color: #ccc;
}

.item-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.item-input:focus {
  outline: none;
  border-color: #689F38;
  box-shadow: 0 0 0 2px rgba(104, 159, 56, 0.2);
}

.edit-item button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.edit-item button:hover {
  background: #c82333;
}

.add-item-btn {
  width: 100%;
  padding: 12px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  background: transparent;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-item-btn:hover {
  background: #f8f9fa;
  border-color: #689F38;
  color: #689F38;
}


@media (max-width: 480px) {
  .edit-form {
    padding: 16px;
  }
  
  .edit-item {
    padding: 16px 12px;
  }
}
</style>