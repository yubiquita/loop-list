<template>
  <div id="app" class="app">
    <!-- ヘッダー -->
    <header class="header">
      <h1>{{ CONFIG.APP_NAME }}</h1>
      <button 
        v-if="uiStore.isListScreen" 
        class="add-list-btn" 
        @click="createNewList"
        :disabled="uiStore.isLoading"
      >
        +
      </button>
    </header>

    <!-- メインコンテンツ -->
    <main class="main">
      <!-- リスト一覧画面 -->
      <ListScreen
        v-show="uiStore.isListScreen"
        @edit-list="editList"
        @view-list="viewList"
      />

      <!-- リスト詳細画面 -->
      <DetailScreen
        v-show="uiStore.isDetailScreen"
        @edit-list="editCurrentList"
        @back="backToList"
      />

      <!-- リスト編集画面 -->
      <EditScreen
        v-show="uiStore.isEditScreen"
        @save="saveList"
        @cancel="cancelEdit"
      />
    </main>

    <!-- 確認モーダル -->
    <ConfirmModal
      v-if="uiStore.showConfirmModal"
      :message="uiStore.confirmMessage"
      @confirm="uiStore.confirmYes"
      @cancel="uiStore.confirmNo"
    />

    <!-- ローディング -->
    <LoadingSpinner v-if="uiStore.isLoading" :message="uiStore.loadingMessage" />

    <!-- エラーメッセージ -->
    <ErrorMessage v-if="uiStore.error" :message="uiStore.error" @close="uiStore.clearError" />

    <!-- 成功メッセージ -->
    <SuccessMessage v-if="uiStore.successMessage" :message="uiStore.successMessage" @close="uiStore.clearSuccess" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useChecklistStore, useUIStore } from './stores'
import { CONFIG } from './constants'

// コンポーネント
import ListScreen from './components/ListScreen.vue'
import DetailScreen from './components/DetailScreen.vue'
import EditScreen from './components/EditScreen.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'
import ErrorMessage from './components/ErrorMessage.vue'
import SuccessMessage from './components/SuccessMessage.vue'

// ストア
const checklistStore = useChecklistStore()
const uiStore = useUIStore()

// 新しいリストを作成
const createNewList = () => {
  const name = prompt('リスト名を入力してください:')
  if (name && name.trim()) {
    const newList = checklistStore.createList(name.trim())
    checklistStore.setCurrentList(newList.id)
    uiStore.showEditScreen()
  }
}

// リスト編集
const editList = (listId: string) => {
  checklistStore.setCurrentList(listId)
  uiStore.showEditScreen()
}

// リスト表示
const viewList = (listId: string) => {
  checklistStore.setCurrentList(listId)
  uiStore.showDetailScreen()
}

// 現在のリストを編集
const editCurrentList = () => {
  uiStore.showEditScreen()
}

// リスト一覧に戻る
const backToList = () => {
  checklistStore.setCurrentList(null)
  uiStore.showListScreen()
}

// リスト保存
const saveList = () => {
  // 現在のリストの空項目を削除
  if (checklistStore.currentList) {
    const filteredItems = checklistStore.currentList.items.filter(item => item.text.trim() !== '')
    checklistStore.updateList(checklistStore.currentList.id, {
      items: filteredItems
    })
  }
  uiStore.showDetailScreen()
}

// 編集キャンセル
const cancelEdit = () => {
  if (checklistStore.currentList) {
    uiStore.showDetailScreen()
  } else {
    uiStore.showListScreen()
  }
}

// キーボードイベント処理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    uiStore.handleEscapeKey()
  }
}

// リサイズイベント処理
const handleResize = () => {
  uiStore.updateMobileState()
}

// 初期化
onMounted(async () => {
  await checklistStore.initializeData()
  
  // イベントリスナー追加
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
  
  // 初期画面の設定
  uiStore.showListScreen()
})

// クリーンアップ
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
/* グローバルスタイルは既存のCSSファイルから移植 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  overflow-x: hidden;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100svh;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #689F38;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 18px;
  font-weight: 600;
}

.add-list-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-list-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.add-list-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.main {
  position: relative;
  min-height: calc(100vh - 68px);
  min-height: calc(100svh - 68px);
  overflow: hidden;
}

@media (max-width: 480px) {
  .app {
    max-width: 100%;
  }
  
  .header {
    padding: 12px 16px;
  }
}
</style>
