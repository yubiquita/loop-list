/**
 * チェックリストのリスト管理クラス
 * リストCRUD操作、リスト描画、リスト検索・フィルタリングを担当
 */
class ChecklistListManager {
    constructor(dataManager, uiManager) {
        this.dataManager = dataManager;
        this.uiManager = uiManager;
        this.lists = [];
    }

    /**
     * リストデータを設定
     * @param {Array} lists - リストの配列
     */
    setLists(lists) {
        this.lists = lists;
    }

    /**
     * 全リストを取得
     * @returns {Array} リストの配列
     */
    getLists() {
        return this.lists;
    }

    /**
     * 指定されたIDのリストを取得
     * @param {string} listId - リストID
     * @returns {Object|null} リストオブジェクト、見つからない場合はnull
     */
    getListById(listId) {
        return this.lists.find(list => list.id === listId) || null;
    }

    /**
     * 新しいリストを作成
     * @param {string} name - リスト名
     * @param {Array} items - 項目配列（デフォルトは空配列）
     * @returns {Object} 作成されたリスト
     */
    createList(name, items = []) {
        if (!this.dataManager.validateListName(name)) {
            throw new Error('リスト名を入力してください');
        }

        const validItems = this.dataManager.filterValidItems(items);
        const newList = this.dataManager.createListData(name, validItems);
        
        this.lists.push(newList);
        this.dataManager.saveData(this.lists);
        
        return newList;
    }

    /**
     * 既存のリストを更新
     * @param {string} listId - リストID
     * @param {string} name - 新しいリスト名
     * @param {Array} items - 新しい項目配列
     * @returns {Object|null} 更新されたリスト、見つからない場合はnull
     */
    updateList(listId, name, items = []) {
        if (!this.dataManager.validateListName(name)) {
            throw new Error('リスト名を入力してください');
        }

        const listIndex = this.lists.findIndex(list => list.id === listId);
        if (listIndex === -1) {
            return null;
        }

        const validItems = this.dataManager.filterValidItems(items);
        const updatedList = {
            ...this.lists[listIndex],
            name: name,
            items: validItems
        };
        
        updatedList.updatedAt = new Date().toISOString();
        this.lists[listIndex] = updatedList;
        this.dataManager.saveData(this.lists);
        
        return updatedList;
    }

    /**
     * リストを削除
     * @param {string} listId - リストID
     * @returns {boolean} 削除成功の場合true
     */
    deleteList(listId) {
        const initialLength = this.lists.length;
        this.lists = this.lists.filter(list => list.id !== listId);
        
        if (this.lists.length < initialLength) {
            this.dataManager.saveData(this.lists);
            return true;
        }
        return false;
    }

    /**
     * リストの進捗情報を計算
     * @param {Object} list - リストオブジェクト
     * @returns {Object} 進捗情報 {checkedCount, totalCount, percentage}
     */
    calculateProgress(list) {
        const checkedCount = list.items.filter(item => item.checked).length;
        const totalCount = list.items.length;
        const percentage = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
        
        return {
            checkedCount,
            totalCount,
            percentage
        };
    }

    /**
     * リスト一覧を描画
     */
    renderLists() {
        this.uiManager.clearListContainer();
        
        this.lists.forEach(list => {
            const listElement = this.createListElement(list);
            this.uiManager.appendToListContainer(listElement);
        });
    }

    /**
     * リスト要素を作成
     * @param {Object} list - リストオブジェクト
     * @returns {HTMLElement} リスト要素
     */
    createListElement(list) {
        const progress = this.calculateProgress(list);
        
        const listElement = document.createElement('div');
        listElement.className = 'list-item';
        listElement.innerHTML = `
            <div class="list-info">
                <h3>${this.escapeHtml(list.name)}</h3>
                <p>${progress.checkedCount}/${progress.totalCount} 完了</p>
            </div>
            <div class="list-actions">
                <button class="delete-btn" data-list-id="${list.id}">削除</button>
            </div>
        `;
        
        // リスト詳細表示のクリックイベント
        listElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn')) {
                this.onListClick(list.id);
            }
        });
        
        // 削除ボタンのクリックイベント
        const deleteBtn = listElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onDeleteClick(list.id);
        });
        
        return listElement;
    }

    /**
     * HTMLエスケープ
     * @param {string} text - エスケープするテキスト
     * @returns {string} エスケープされたテキスト
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * リストクリック時のコールバック（オーバーライド可能）
     * @param {string} listId - リストID
     */
    onListClick(listId) {
        // デフォルトは何もしない（メインアプリでオーバーライド）
    }

    /**
     * 削除ボタンクリック時のコールバック（オーバーライド可能）
     * @param {string} listId - リストID
     */
    onDeleteClick(listId) {
        if (this.uiManager.showConfirm('このリストを削除しますか？')) {
            if (this.deleteList(listId)) {
                this.renderLists();
            }
        }
    }

    /**
     * リスト名で検索
     * @param {string} query - 検索クエリ
     * @returns {Array} 検索結果のリスト配列
     */
    searchLists(query) {
        if (!query || query.trim() === '') {
            return this.lists;
        }
        
        const lowerQuery = query.toLowerCase();
        return this.lists.filter(list => 
            list.name.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * 完了率でリストをフィルタリング
     * @param {number} minPercentage - 最小完了率（0-100）
     * @param {number} maxPercentage - 最大完了率（0-100）
     * @returns {Array} フィルタリングされたリスト配列
     */
    filterByProgress(minPercentage = 0, maxPercentage = 100) {
        return this.lists.filter(list => {
            const progress = this.calculateProgress(list);
            return progress.percentage >= minPercentage && progress.percentage <= maxPercentage;
        });
    }

    /**
     * リストを作成日時でソート
     * @param {boolean} ascending - 昇順の場合true、降順の場合false
     * @returns {Array} ソートされたリスト配列
     */
    sortByCreatedAt(ascending = true) {
        return [...this.lists].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }

    /**
     * リストを更新日時でソート
     * @param {boolean} ascending - 昇順の場合true、降順の場合false
     * @returns {Array} ソートされたリスト配列
     */
    sortByUpdatedAt(ascending = true) {
        return [...this.lists].sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }

    /**
     * リストを名前でソート
     * @param {boolean} ascending - 昇順の場合true、降順の場合false
     * @returns {Array} ソートされたリスト配列
     */
    sortByName(ascending = true) {
        return [...this.lists].sort((a, b) => {
            return ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        });
    }

    /**
     * リストの統計情報を取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        const totalLists = this.lists.length;
        const totalItems = this.lists.reduce((sum, list) => sum + list.items.length, 0);
        const totalCheckedItems = this.lists.reduce((sum, list) => 
            sum + list.items.filter(item => item.checked).length, 0);
        
        const completedLists = this.lists.filter(list => {
            const progress = this.calculateProgress(list);
            return progress.percentage === 100 && list.items.length > 0;
        }).length;
        
        return {
            totalLists,
            totalItems,
            totalCheckedItems,
            completedLists,
            averageProgress: totalItems > 0 ? (totalCheckedItems / totalItems) * 100 : 0
        };
    }
}

// モジュールエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChecklistListManager;
}