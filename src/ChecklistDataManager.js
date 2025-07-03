/**
 * チェックリストデータ管理クラス
 * localStorage操作、データ保存・読み込み、ID生成、データバリデーションを担当
 */
class ChecklistDataManager {
    constructor() {
        this.storageKey = 'checklists';
    }

    /**
     * 一意のIDを生成
     * @returns {string} 生成されたID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * localStorageからデータを読み込み
     * @returns {Array} チェックリストの配列
     */
    loadData() {
        try {
            const storage = this.getStorage();
            const data = storage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);
            return [];
        }
    }

    /**
     * localStorageにデータを保存
     * @param {Array} lists - チェックリストの配列
     */
    saveData(lists) {
        try {
            const storage = this.getStorage();
            storage.setItem(this.storageKey, JSON.stringify(lists));
        } catch (error) {
            console.error('データの保存に失敗しました:', error);
        }
    }

    /**
     * ストレージオブジェクトを取得（テスト用）
     * @returns {Storage} localStorageオブジェクト
     */
    getStorage() {
        return (typeof window !== 'undefined' && window.localStorage) || 
               (typeof global !== 'undefined' && global.localStorage) ||
               localStorage;
    }

    /**
     * 新しいリストのデータ構造を作成
     * @param {string} name - リスト名
     * @param {Array} items - 項目配列（デフォルトは空配列）
     * @returns {Object} 新しいリストオブジェクト
     */
    createListData(name, items = []) {
        return {
            id: this.generateId(),
            name: name,
            items: items,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * 新しい項目のデータ構造を作成
     * @param {string} text - 項目テキスト
     * @param {boolean} checked - チェック状態（デフォルトはfalse）
     * @returns {Object} 新しい項目オブジェクト
     */
    createItemData(text, checked = false) {
        return {
            id: this.generateId(),
            text: text,
            checked: checked
        };
    }

    /**
     * リスト名のバリデーション
     * @param {string} name - リスト名
     * @returns {boolean} バリデーション結果
     */
    validateListName(name) {
        return typeof name === 'string' && name.trim().length > 0;
    }

    /**
     * 項目テキストのバリデーション
     * @param {string} text - 項目テキスト
     * @returns {boolean} バリデーション結果
     */
    validateItemText(text) {
        return typeof text === 'string' && text.trim().length > 0;
    }

    /**
     * 項目配列から空のテキストを持つ項目を除外
     * @param {Array} items - 項目配列
     * @returns {Array} フィルタリングされた項目配列
     */
    filterValidItems(items) {
        return items.filter(item => this.validateItemText(item.text));
    }

    /**
     * リストデータのupdatedAtを更新
     * @param {Object} listData - リストデータ
     * @returns {Object} 更新されたリストデータ
     */
    updateTimestamp(listData) {
        return {
            ...listData,
            updatedAt: new Date().toISOString()
        };
    }
}

// モジュールエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChecklistDataManager;
}