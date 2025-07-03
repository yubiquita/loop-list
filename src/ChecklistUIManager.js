/**
 * チェックリストUI管理クラス
 * 画面遷移制御、DOM要素の取得・管理、イベントバインディング、プログレスバー更新を担当
 */
class ChecklistUIManager {
    constructor() {
        this.elements = {};
        this.currentScreen = 'listScreen';
        this.initializeElements();
    }

    /**
     * DOM要素を初期化
     */
    initializeElements() {
        // 画面要素
        this.elements.listScreen = document.getElementById('listScreen');
        this.elements.detailScreen = document.getElementById('detailScreen');
        this.elements.editScreen = document.getElementById('editScreen');
        
        // コンテナ要素
        this.elements.listContainer = document.getElementById('listContainer');
        this.elements.itemList = document.getElementById('itemList');
        this.elements.editItems = document.getElementById('editItems');
        
        // ボタン要素
        this.elements.addListBtn = document.getElementById('addListBtn');
        this.elements.backBtn = document.getElementById('backBtn');
        this.elements.editBtn = document.getElementById('editBtn');
        this.elements.resetBtn = document.getElementById('resetBtn');
        this.elements.cancelBtn = document.getElementById('cancelBtn');
        this.elements.saveBtn = document.getElementById('saveBtn');
        this.elements.addItemBtn = document.getElementById('addItemBtn');
        
        // その他の要素
        this.elements.listTitle = document.getElementById('listTitle');
        this.elements.editTitle = document.getElementById('editTitle');
        this.elements.progressFill = document.getElementById('progressFill');
        this.elements.progressText = document.getElementById('progressText');
        this.elements.listNameInput = document.getElementById('listNameInput');
    }

    /**
     * DOM要素を取得
     * @param {string} elementName - 要素名
     * @returns {HTMLElement} DOM要素
     */
    getElement(elementName) {
        return this.elements[elementName];
    }

    /**
     * イベントリスナーをバインド
     * @param {Object} handlers - イベントハンドラーのオブジェクト
     */
    bindEvents(handlers) {
        if (handlers.addList && this.elements.addListBtn) {
            this.elements.addListBtn.addEventListener('click', handlers.addList);
        }
        if (handlers.back && this.elements.backBtn) {
            this.elements.backBtn.addEventListener('click', handlers.back);
        }
        if (handlers.edit && this.elements.editBtn) {
            this.elements.editBtn.addEventListener('click', handlers.edit);
        }
        if (handlers.reset && this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', handlers.reset);
        }
        if (handlers.cancel && this.elements.cancelBtn) {
            this.elements.cancelBtn.addEventListener('click', handlers.cancel);
        }
        if (handlers.save && this.elements.saveBtn) {
            this.elements.saveBtn.addEventListener('click', handlers.save);
        }
        if (handlers.addItem && this.elements.addItemBtn) {
            this.elements.addItemBtn.addEventListener('click', handlers.addItem);
        }
    }

    /**
     * リスト画面を表示
     */
    showListScreen() {
        this.hideAllScreens();
        this.elements.listScreen.classList.remove('hidden');
        this.currentScreen = 'listScreen';
    }

    /**
     * 詳細画面を表示
     * @param {string} title - リストのタイトル
     */
    showDetailScreen(title) {
        this.hideAllScreens();
        this.elements.detailScreen.classList.remove('hidden');
        this.elements.listTitle.textContent = title;
        this.currentScreen = 'detailScreen';
    }

    /**
     * 編集画面を表示
     * @param {boolean} isEditing - 編集モードかどうか
     * @param {string} title - 編集するリストのタイトル（新規作成時は空文字）
     */
    showEditScreen(isEditing = false, title = '') {
        this.hideAllScreens();
        this.elements.editScreen.classList.remove('hidden');
        
        if (isEditing) {
            this.elements.editTitle.textContent = 'リスト編集';
            this.elements.listNameInput.value = title;
        } else {
            this.elements.editTitle.textContent = 'リスト作成';
            this.elements.listNameInput.value = '';
        }
        
        this.currentScreen = 'editScreen';
    }

    /**
     * 全ての画面を非表示
     */
    hideAllScreens() {
        this.elements.listScreen.classList.add('hidden');
        this.elements.detailScreen.classList.add('hidden');
        this.elements.editScreen.classList.add('hidden');
    }

    /**
     * プログレスバーを更新
     * @param {number} checkedCount - チェック済み項目数
     * @param {number} totalCount - 全項目数
     */
    updateProgress(checkedCount, totalCount) {
        const percentage = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
        
        this.elements.progressFill.style.width = `${percentage}%`;
        this.elements.progressText.textContent = `${checkedCount}/${totalCount}`;
    }

    /**
     * リストコンテナをクリア
     */
    clearListContainer() {
        this.elements.listContainer.innerHTML = '';
    }

    /**
     * 項目リストをクリア
     */
    clearItemList() {
        this.elements.itemList.innerHTML = '';
    }

    /**
     * 編集項目をクリア
     */
    clearEditItems() {
        this.elements.editItems.innerHTML = '';
    }

    /**
     * リストコンテナに要素を追加
     * @param {HTMLElement} element - 追加する要素
     */
    appendToListContainer(element) {
        this.elements.listContainer.appendChild(element);
    }

    /**
     * 項目リストに要素を追加
     * @param {HTMLElement} element - 追加する要素
     */
    appendToItemList(element) {
        this.elements.itemList.appendChild(element);
    }

    /**
     * 編集項目に要素を追加
     * @param {HTMLElement} element - 追加する要素
     */
    appendToEditItems(element) {
        this.elements.editItems.appendChild(element);
    }

    /**
     * リスト名の入力値を取得
     * @returns {string} 入力されたリスト名
     */
    getListNameInput() {
        return this.elements.listNameInput.value.trim();
    }

    /**
     * リスト名の入力値を設定
     * @param {string} value - 設定する値
     */
    setListNameInput(value) {
        this.elements.listNameInput.value = value;
    }

    /**
     * 現在の画面を取得
     * @returns {string} 現在の画面名
     */
    getCurrentScreen() {
        return this.currentScreen;
    }

    /**
     * アラートを表示
     * @param {string} message - メッセージ
     */
    showAlert(message) {
        alert(message);
    }

    /**
     * 確認ダイアログを表示
     * @param {string} message - メッセージ
     * @returns {boolean} ユーザーの選択
     */
    showConfirm(message) {
        return confirm(message);
    }

    /**
     * 特定のDOM要素が存在するかチェック
     * @param {string} elementName - 要素名
     * @returns {boolean} 要素が存在するかどうか
     */
    hasElement(elementName) {
        return this.elements[elementName] !== null && this.elements[elementName] !== undefined;
    }

    /**
     * 要素の可視性を設定
     * @param {string} elementName - 要素名
     * @param {boolean} visible - 可視性
     */
    setElementVisibility(elementName, visible) {
        const element = this.elements[elementName];
        if (element) {
            if (visible) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    }
}

// モジュールエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChecklistUIManager;
}