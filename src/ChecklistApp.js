/**
 * メインのチェックリストアプリケーションクラス
 * 各管理クラスを統合してアプリケーション全体を制御
 */
(function() {
    'use strict';

// 依存関係の読み込み（ブラウザ環境では script タグで読み込まれる前提）
let ChecklistDataManager, ChecklistUIManager, ChecklistListManager, ChecklistItemManager;

if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境（テスト等）
    ChecklistDataManager = require('./ChecklistDataManager.js');
    ChecklistUIManager = require('./ChecklistUIManager.js');
    ChecklistListManager = require('./ChecklistListManager.js');
    ChecklistItemManager = require('./ChecklistItemManager.js');
} else {
    // ブラウザ環境では window オブジェクトから取得
    ChecklistDataManager = window.ChecklistDataManager;
    ChecklistUIManager = window.ChecklistUIManager;
    ChecklistListManager = window.ChecklistListManager;
    ChecklistItemManager = window.ChecklistItemManager;
}

class ChecklistApp {
    constructor() {
        // 各管理クラスのインスタンス作成
        this.dataManager = new ChecklistDataManager();
        this.uiManager = new ChecklistUIManager();
        this.listManager = new ChecklistListManager(this.dataManager, this.uiManager);
        this.itemManager = new ChecklistItemManager(this.dataManager, this.uiManager);
        
        // アプリケーション状態
        this.currentListId = null;
        this.isEditing = false;
        this.editingData = null;
        
        // 初期化
        this.initialize();
    }

    /**
     * アプリケーションの初期化
     */
    initialize() {
        try {
            // データの読み込み
            const lists = this.dataManager.loadData();
            this.listManager.setLists(lists);
            
            // イベントバインディング
            this.bindEvents();
            
            // 初期画面の描画
            this.listManager.renderLists();
            this.uiManager.showListScreen();
            
        } catch (error) {
            console.error('アプリケーションの初期化に失敗しました:', error);
            this.uiManager.showAlert('アプリケーションの初期化に失敗しました');
        }
    }

    /**
     * イベントリスナーをバインド
     */
    bindEvents() {
        const handlers = {
            addList: () => this.showEditScreen(),
            back: () => this.showListScreen(),
            edit: () => this.showEditScreen(this.currentListId),
            reset: () => this.resetList(),
            cancel: () => this.cancelEdit(),
            save: () => this.saveList(),
            addItem: () => this.addEditItem()
        };

        this.uiManager.bindEvents(handlers);
        
        // リスト管理クラスのコールバック設定
        this.listManager.onListClick = (listId) => this.showDetailScreen(listId);
    }

    /**
     * リスト画面を表示
     */
    showListScreen() {
        this.uiManager.showListScreen();
        this.currentListId = null;
    }

    /**
     * 詳細画面を表示
     * @param {string} listId - リストID
     */
    showDetailScreen(listId) {
        const list = this.listManager.getListById(listId);
        if (!list) {
            this.uiManager.showAlert('リストが見つかりません');
            return;
        }

        this.currentListId = listId;
        this.uiManager.showDetailScreen(list.name);
        
        // 項目描画
        this.itemManager.renderItems(list, (item) => {
            this.onItemChanged(list);
        });
        
        // プログレス更新
        this.updateProgress(list);
    }

    /**
     * 編集画面を表示
     * @param {string} listId - リストID（新規作成時はnull）
     */
    showEditScreen(listId = null) {
        this.isEditing = !!listId;
        
        if (this.isEditing) {
            // 編集モード
            const list = this.listManager.getListById(listId);
            if (!list) {
                this.uiManager.showAlert('リストが見つかりません');
                return;
            }
            
            this.editingData = JSON.parse(JSON.stringify(list)); // ディープコピー
            this.uiManager.showEditScreen(true, list.name);
        } else {
            // 新規作成モード
            this.editingData = this.dataManager.createListData('', []);
            this.uiManager.showEditScreen(false);
        }

        this.renderEditItems();
    }

    /**
     * 編集項目を描画
     */
    renderEditItems() {
        // 既存のSortableJSインスタンスを破棄
        if (this.itemManager.sortableInstance) {
            this.itemManager.destroySortable();
        }
        
        this.itemManager.renderEditItems(
            this.editingData.items,
            (item, index) => {
                // 項目テキスト変更時のコールバック
                // 項目は既に更新されている
            },
            (index) => {
                // 項目削除時のコールバック
                this.itemManager.removeItem(this.editingData.items, index);
                this.renderEditItems();
            },
            () => {
                // 新項目追加時のコールバック（Enterキー用）
                this.addEditItem();
            }
        );
        
        // SortableJSを初期化（項目が1つ以上ある場合）
        if (this.editingData.items.length > 0) {
            this.initializeSortableForEditItems();
        }
    }

    /**
     * 編集項目用のSortableJSを初期化
     */
    initializeSortableForEditItems() {
        const container = document.getElementById('editItems');
        if (!container) return;
        
        try {
            // 現在の項目配列をセット
            this.itemManager.setCurrentItems(this.editingData.items);
            
            // SortableJSを初期化
            this.itemManager.initializeSortable(container);
            
            // カスタムイベントハンドラーをオーバーライド
            if (this.itemManager.sortableInstance) {
                const originalOnUpdate = this.itemManager.sortableInstance.options.onUpdate;
                this.itemManager.sortableInstance.options.onUpdate = (evt) => {
                    // 項目配列を更新
                    this.itemManager.onSortUpdate(this.editingData.items, evt);
                    
                    // データを保存
                    this.dataManager.saveData(this.listManager.getLists());
                    
                    console.log('項目順序を更新:', evt.oldIndex, '→', evt.newIndex);
                };
            }
        } catch (error) {
            console.error('SortableJS初期化エラー:', error);
        }
    }

    /**
     * プログレスバーを更新
     * @param {Object} list - リストオブジェクト
     */
    updateProgress(list) {
        const progress = this.listManager.calculateProgress(list);
        this.uiManager.updateProgress(progress.checkedCount, progress.totalCount);
    }

    /**
     * 項目変更時の処理
     * @param {Object} list - リストオブジェクト
     */
    onItemChanged(list) {
        this.updateProgress(list);
        this.dataManager.saveData(this.listManager.getLists());
    }

    /**
     * リストをリセット
     */
    resetList() {
        if (!this.currentListId) return;
        
        const list = this.listManager.getListById(this.currentListId);
        if (!list) return;
        
        if (this.uiManager.showConfirm('このリストをリセットしますか？')) {
            this.itemManager.resetAllItems(list.items);
            
            // 再描画
            this.itemManager.renderItems(list, (item) => {
                this.onItemChanged(list);
            });
            
            this.updateProgress(list);
            this.dataManager.saveData(this.listManager.getLists());
        }
    }

    /**
     * 編集項目を追加
     */
    addEditItem() {
        this.itemManager.addEmptyItem(this.editingData.items);
        this.renderEditItems();
        
        // 新しく追加された項目の入力欄にフォーカスを設定
        this.itemManager.focusLastAddedItem(this.editingData.items);
    }

    /**
     * 編集をキャンセル
     */
    cancelEdit() {
        if (this.currentListId) {
            this.showDetailScreen(this.currentListId);
        } else {
            this.showListScreen();
        }
    }

    /**
     * リストを保存
     */
    saveList() {
        const name = this.uiManager.getListNameInput();
        
        if (!this.dataManager.validateListName(name)) {
            this.uiManager.showAlert('リスト名を入力してください');
            return;
        }
        
        try {
            // 空の項目を除外
            this.editingData.items = this.itemManager.removeEmptyItems(this.editingData.items);
            this.editingData.name = name;
            
            if (this.isEditing) {
                // 既存リストの更新
                const updatedList = this.listManager.updateList(
                    this.editingData.id,
                    name,
                    this.editingData.items
                );
                
                if (updatedList) {
                    this.listManager.renderLists();
                    this.showDetailScreen(this.editingData.id);
                } else {
                    this.uiManager.showAlert('リストの更新に失敗しました');
                }
            } else {
                // 新規リストの作成
                const newList = this.listManager.createList(name, this.editingData.items);
                this.listManager.renderLists();
                this.showListScreen();
            }
            
        } catch (error) {
            console.error('リストの保存に失敗しました:', error);
            this.uiManager.showAlert(error.message || 'リストの保存に失敗しました');
        }
    }

    /**
     * 指定されたIDのリストを削除
     * @param {string} listId - リストID
     */
    deleteList(listId) {
        if (this.uiManager.showConfirm('このリストを削除しますか？')) {
            if (this.listManager.deleteList(listId)) {
                this.listManager.renderLists();
                
                // 現在表示中のリストが削除された場合
                if (this.currentListId === listId) {
                    this.showListScreen();
                }
            }
        }
    }

    /**
     * アプリケーションの統計情報を取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        return this.listManager.getStatistics();
    }

    /**
     * データをエクスポート
     * @returns {string} JSON形式のデータ
     */
    exportData() {
        const data = {
            lists: this.listManager.getLists(),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * データをインポート
     * @param {string} jsonData - JSON形式のデータ
     * @returns {boolean} インポート成功の場合true
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.lists || !Array.isArray(data.lists)) {
                throw new Error('無効なデータ形式です');
            }
            
            // データの妥当性チェック
            for (const list of data.lists) {
                if (!list.id || !list.name || !Array.isArray(list.items)) {
                    throw new Error('無効なリストデータです');
                }
                
                for (const item of list.items) {
                    if (!this.itemManager.validateItem(item)) {
                        throw new Error('無効な項目データです');
                    }
                }
            }
            
            // データを設定
            this.listManager.setLists(data.lists);
            this.dataManager.saveData(data.lists);
            this.listManager.renderLists();
            this.showListScreen();
            
            return true;
            
        } catch (error) {
            console.error('データのインポートに失敗しました:', error);
            this.uiManager.showAlert('データのインポートに失敗しました: ' + error.message);
            return false;
        }
    }

    /**
     * 現在のアプリケーション状態を取得
     * @returns {Object} アプリケーション状態
     */
    getAppState() {
        return {
            currentListId: this.currentListId,
            isEditing: this.isEditing,
            currentScreen: this.uiManager.getCurrentScreen(),
            listsCount: this.listManager.getLists().length
        };
    }

    /**
     * デバッグ情報を取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return {
            state: this.getAppState(),
            statistics: this.getStatistics(),
            lists: this.listManager.getLists().map(list => ({
                id: list.id,
                name: list.name,
                itemCount: list.items.length,
                progress: this.listManager.calculateProgress(list)
            }))
        };
    }
}

// モジュールエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChecklistApp;
} else {
    // ブラウザ環境では window.app として利用可能にする
    if (typeof window !== 'undefined') {
        window.ChecklistApp = ChecklistApp;
        window.app = new ChecklistApp();
    }
}

})();