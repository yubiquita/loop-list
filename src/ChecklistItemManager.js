/**
 * チェックリストの項目管理クラス
 * 項目CRUD操作、項目チェック状態管理、項目描画・編集を担当
 */
(function() {
    'use strict';
    
class ChecklistItemManager {
    constructor(dataManager, uiManager) {
        this.dataManager = dataManager;
        this.uiManager = uiManager;
    }

    /**
     * 項目リストを描画
     * @param {Object} list - リストオブジェクト
     * @param {Function} onItemChange - 項目変更時のコールバック
     */
    renderItems(list, onItemChange) {
        this.uiManager.clearItemList();
        
        list.items.forEach(item => {
            const itemElement = this.createItemElement(item, onItemChange);
            this.uiManager.appendToItemList(itemElement);
        });
    }

    /**
     * 項目要素を作成
     * @param {Object} item - 項目オブジェクト
     * @param {Function} onItemChange - 項目変更時のコールバック
     * @returns {HTMLElement} 項目要素
     */
    createItemElement(item, onItemChange) {
        const itemElement = document.createElement('div');
        itemElement.className = item.checked ? 'check-item checked' : 'check-item';
        itemElement.innerHTML = `
            <input type="checkbox" id="item-${item.id}" ${item.checked ? 'checked' : ''}>
            <label for="item-${item.id}">${this.escapeHtml(item.text)}</label>
        `;
        
        const checkbox = itemElement.querySelector('input');
        checkbox.addEventListener('change', () => {
            item.checked = checkbox.checked;
            itemElement.classList.toggle('checked', item.checked);
            
            if (onItemChange) {
                onItemChange(item);
            }
        });
        
        return itemElement;
    }

    /**
     * 編集用の項目リストを描画
     * @param {Array} items - 項目配列
     * @param {Function} onItemTextChange - 項目テキスト変更時のコールバック
     * @param {Function} onItemRemove - 項目削除時のコールバック
     */
    renderEditItems(items, onItemTextChange, onItemRemove) {
        this.uiManager.clearEditItems();
        
        items.forEach((item, index) => {
            const itemElement = this.createEditItemElement(item, index, onItemTextChange, onItemRemove);
            this.uiManager.appendToEditItems(itemElement);
        });
    }

    /**
     * 編集用の項目要素を作成
     * @param {Object} item - 項目オブジェクト
     * @param {number} index - 項目のインデックス
     * @param {Function} onItemTextChange - 項目テキスト変更時のコールバック
     * @param {Function} onItemRemove - 項目削除時のコールバック
     * @returns {HTMLElement} 編集用項目要素
     */
    createEditItemElement(item, index, onItemTextChange, onItemRemove) {
        const itemElement = document.createElement('div');
        itemElement.className = 'edit-item';
        itemElement.dataset.id = item.id;
        itemElement.innerHTML = `
            <span class="drag-handle">:::</span>
            <input type="text" value="${this.escapeHtml(item.text)}" placeholder="項目名">
            <button type="button" data-index="${index}">削除</button>
        `;
        
        const input = itemElement.querySelector('input');
        input.addEventListener('input', () => {
            item.text = input.value;
            if (onItemTextChange) {
                onItemTextChange(item, index);
            }
        });
        
        const deleteBtn = itemElement.querySelector('button');
        deleteBtn.addEventListener('click', () => {
            if (onItemRemove) {
                onItemRemove(index);
            }
        });
        
        return itemElement;
    }

    /**
     * 新しい項目を作成
     * @param {string} text - 項目テキスト
     * @param {boolean} checked - チェック状態（デフォルトはfalse）
     * @returns {Object} 作成された項目
     */
    createItem(text, checked = false) {
        return this.dataManager.createItemData(text, checked);
    }

    /**
     * 項目のチェック状態を切り替え
     * @param {Object} item - 項目オブジェクト
     * @returns {Object} 更新された項目
     */
    toggleItemCheck(item) {
        item.checked = !item.checked;
        return item;
    }

    /**
     * 項目のテキストを更新
     * @param {Object} item - 項目オブジェクト
     * @param {string} newText - 新しいテキスト
     * @returns {Object} 更新された項目
     */
    updateItemText(item, newText) {
        item.text = newText;
        return item;
    }

    /**
     * 配列から項目を削除
     * @param {Array} items - 項目配列
     * @param {number} index - 削除する項目のインデックス
     * @returns {Array} 更新された項目配列
     */
    removeItem(items, index) {
        if (index >= 0 && index < items.length) {
            items.splice(index, 1);
        }
        return items;
    }

    /**
     * 項目を配列に追加
     * @param {Array} items - 項目配列
     * @param {Object} item - 追加する項目
     * @returns {Array} 更新された項目配列
     */
    addItem(items, item) {
        items.push(item);
        return items;
    }

    /**
     * 新しい空の項目を配列に追加
     * @param {Array} items - 項目配列
     * @returns {Array} 更新された項目配列
     */
    addEmptyItem(items) {
        const newItem = this.createItem('', false);
        return this.addItem(items, newItem);
    }

    /**
     * すべての項目のチェック状態をリセット
     * @param {Array} items - 項目配列
     * @returns {Array} 更新された項目配列
     */
    resetAllItems(items) {
        items.forEach(item => {
            item.checked = false;
        });
        return items;
    }

    /**
     * チェック済み項目をフィルタリング
     * @param {Array} items - 項目配列
     * @returns {Array} チェック済み項目の配列
     */
    getCheckedItems(items) {
        return items.filter(item => item.checked);
    }

    /**
     * 未チェック項目をフィルタリング
     * @param {Array} items - 項目配列
     * @returns {Array} 未チェック項目の配列
     */
    getUncheckedItems(items) {
        return items.filter(item => !item.checked);
    }

    /**
     * 項目の完了率を計算
     * @param {Array} items - 項目配列
     * @returns {number} 完了率（0-100）
     */
    calculateCompletionRate(items) {
        if (items.length === 0) {
            return 0;
        }
        
        const checkedCount = this.getCheckedItems(items).length;
        return (checkedCount / items.length) * 100;
    }

    /**
     * SortableJSを初期化
     * @param {HTMLElement} container - ソート可能にするコンテナ要素
     * @returns {Object} SortableJSインスタンス
     */
    initializeSortable(container) {
        if (!container) {
            throw new Error('Invalid container element');
        }
        
        if (typeof Sortable === 'undefined') {
            throw new Error('SortableJS library not found');
        }
        
        const options = {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            handle: '.drag-handle',
            emptyInsertThreshold: 5,
            forceFallback: false,
            fallbackTolerance: 3,
            onStart: (evt) => this.onSortStart(evt),
            onUpdate: (evt) => this.onSortUpdate(this.currentItems, evt),
            onEnd: (evt) => this.onSortEnd(evt),
            onMove: (evt) => this.onSortMove(evt)
        };
        
        this.sortableInstance = Sortable.create(container, options);
        return this.sortableInstance;
    }

    /**
     * SortableJSインスタンスを破棄
     */
    destroySortable() {
        if (this.sortableInstance) {
            this.sortableInstance.destroy();
            this.sortableInstance = null;
        }
    }

    /**
     * ソート開始時のイベントハンドラー
     * @param {Event} evt - SortableJSイベント
     */
    onSortStart(evt) {
        // ドラッグ開始時の処理（必要に応じて拡張）
        console.log('Sort start:', evt.oldIndex);
    }

    /**
     * ソート更新時のイベントハンドラー（reorderItemsの代替）
     * @param {Array} items - 項目配列
     * @param {Event} evt - SortableJSイベント
     * @returns {Array} 並び替えられた項目配列
     */
    onSortUpdate(items, evt) {
        if (!items || !evt) {
            return items;
        }
        
        const { oldIndex, newIndex } = evt;
        
        // インデックスの妥当性チェック
        if (oldIndex < 0 || oldIndex >= items.length || 
            newIndex < 0 || newIndex >= items.length ||
            oldIndex === newIndex) {
            return items;
        }
        
        // 配列の並び替え（SortableJS最適化）
        const item = items.splice(oldIndex, 1)[0];
        items.splice(newIndex, 0, item);
        
        // データの同期
        this.syncDOMWithData(items);
        
        return items;
    }

    /**
     * ソート終了時のイベントハンドラー
     * @param {Event} evt - SortableJSイベント
     */
    onSortEnd(evt) {
        // ドラッグ終了時の処理（必要に応じて拡張）
        console.log('Sort end:', evt.oldIndex, '→', evt.newIndex);
        
        // ドラッグオーバークラスをクリーンアップ
        const containers = document.querySelectorAll('.edit-items');
        containers.forEach(container => {
            container.classList.remove('sortable-drag-over');
        });
    }

    /**
     * ソート移動時のイベントハンドラー（ターゲットライン表示用）
     * @param {Event} evt - SortableJSイベント
     * @returns {boolean|number} 移動許可の判定
     */
    onSortMove(evt) {
        const { related, willInsertAfter } = evt;
        
        // ドラッグオーバー効果を追加
        const container = evt.to;
        if (container && container.classList.contains('edit-items')) {
            container.classList.add('sortable-drag-over');
        }
        
        // デフォルトの挿入ポイントを維持
        return true;
    }

    /**
     * DOM要素とデータ配列を同期
     * @param {Array} items - 項目配列
     */
    syncDOMWithData(items) {
        if (!items) return;
        
        const container = document.getElementById('editItems');
        if (!container) return;
        
        // DOM要素の順序を更新
        items.forEach((item, index) => {
            const element = container.querySelector(`[data-id="${item.id}"]`);
            if (element) {
                // 要素を正しい位置に移動
                if (container.children[index] !== element) {
                    container.insertBefore(element, container.children[index]);
                }
                
                // 入力値を同期
                const input = element.querySelector('input[type="text"]');
                if (input && input.value !== item.text) {
                    input.value = item.text;
                }
            }
        });
    }

    /**
     * 現在の項目配列を設定（SortableJS用）
     * @param {Array} items - 項目配列
     */
    setCurrentItems(items) {
        this.currentItems = items;
    }

    /**
     * 項目を複製
     * @param {Object} item - 複製する項目
     * @returns {Object} 複製された項目
     */
    duplicateItem(item) {
        return this.createItem(item.text, item.checked);
    }

    /**
     * 項目配列を複製
     * @param {Array} items - 複製する項目配列
     * @returns {Array} 複製された項目配列
     */
    duplicateItems(items) {
        return items.map(item => this.duplicateItem(item));
    }

    /**
     * 項目をテキストで検索
     * @param {Array} items - 項目配列
     * @param {string} query - 検索クエリ
     * @returns {Array} 検索結果の項目配列
     */
    searchItems(items, query) {
        if (!query || query.trim() === '') {
            return items;
        }
        
        const lowerQuery = query.toLowerCase();
        return items.filter(item => 
            item.text.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * 項目をチェック状態でフィルタリング
     * @param {Array} items - 項目配列
     * @param {boolean} checked - フィルタリングするチェック状態
     * @returns {Array} フィルタリングされた項目配列
     */
    filterItemsByStatus(items, checked) {
        return items.filter(item => item.checked === checked);
    }

    /**
     * 空のテキストを持つ項目を除去
     * @param {Array} items - 項目配列
     * @returns {Array} フィルタリングされた項目配列
     */
    removeEmptyItems(items) {
        return this.dataManager.filterValidItems(items);
    }

    /**
     * 項目の統計情報を取得
     * @param {Array} items - 項目配列
     * @returns {Object} 統計情報
     */
    getItemStatistics(items) {
        const total = items.length;
        const checked = this.getCheckedItems(items).length;
        const unchecked = this.getUncheckedItems(items).length;
        const completionRate = this.calculateCompletionRate(items);
        
        return {
            total,
            checked,
            unchecked,
            completionRate
        };
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
     * 項目の妥当性を検証
     * @param {Object} item - 項目オブジェクト
     * @returns {boolean} 妥当性
     */
    validateItem(item) {
        return item !== null && 
               item !== undefined &&
               typeof item.id === 'string' && 
               typeof item.text === 'string' && 
               typeof item.checked === 'boolean';
    }

    /**
     * 項目配列の妥当性を検証
     * @param {Array} items - 項目配列
     * @returns {boolean} 妥当性
     */
    validateItems(items) {
        return Array.isArray(items) && 
               items.every(item => this.validateItem(item));
    }
}

// モジュールエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChecklistItemManager;
} else {
    // ブラウザ環境でグローバルオブジェクトに追加
    window.ChecklistItemManager = ChecklistItemManager;
}

})();