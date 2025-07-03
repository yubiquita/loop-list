/**
 * アプリケーション定数ファイル
 * アプリケーション全体で使用する定数を管理
 */

// CSS クラス名
const CSS_CLASSES = {
    // 画面関連
    screen: 'screen',
    hidden: 'hidden',
    
    // リスト関連
    listItem: 'list-item',
    listInfo: 'list-info',
    listActions: 'list-actions',
    listContainer: 'list-container',
    
    // 項目関連
    checkItem: 'check-item',
    checked: 'checked',
    editItem: 'edit-item',
    itemList: 'item-list',
    editItems: 'edit-items',
    
    // ボタン関連
    addListBtn: 'add-list-btn',
    deleteBtn: 'delete-btn',
    backBtn: 'back-btn',
    editBtn: 'edit-btn',
    resetBtn: 'reset-btn',
    cancelBtn: 'cancel-btn',
    saveBtn: 'save-btn',
    addItemBtn: 'add-item-btn',
    
    // プログレスバー関連
    progressBar: 'progress-bar',
    progressFill: 'progress-fill',
    progressText: 'progress-text',
    
    // フォーム関連
    editForm: 'edit-form',
    listNameInput: 'list-name-input',
    
    // アクション関連
    actionButtons: 'action-buttons',
    
    // ヘッダー関連
    header: 'header',
    detailHeader: 'detail-header',
    editHeader: 'edit-header'
};

// DOM要素ID
const ELEMENT_IDS = {
    // 画面
    listScreen: 'listScreen',
    detailScreen: 'detailScreen',
    editScreen: 'editScreen',
    
    // コンテナ
    listContainer: 'listContainer',
    itemList: 'itemList',
    editItems: 'editItems',
    
    // ボタン
    addListBtn: 'addListBtn',
    backBtn: 'backBtn',
    editBtn: 'editBtn',
    resetBtn: 'resetBtn',
    cancelBtn: 'cancelBtn',
    saveBtn: 'saveBtn',
    addItemBtn: 'addItemBtn',
    
    // テキスト要素
    listTitle: 'listTitle',
    editTitle: 'editTitle',
    progressText: 'progressText',
    
    // プログレス要素
    progressFill: 'progressFill',
    
    // 入力要素
    listNameInput: 'listNameInput'
};

// メッセージ定数
const MESSAGES = {
    // エラーメッセージ
    errors: {
        listNameRequired: 'リスト名を入力してください',
        itemTextRequired: '項目名を入力してください',
        listNotFound: 'リストが見つかりません',
        itemNotFound: '項目が見つかりません',
        invalidData: 'データが無効です',
        storageError: 'データの保存に失敗しました',
        loadError: 'データの読み込みに失敗しました'
    },
    
    // 確認メッセージ
    confirmations: {
        deleteList: 'このリストを削除しますか？',
        deleteItem: 'この項目を削除しますか？',
        resetList: 'このリストをリセットしますか？',
        discardChanges: '変更を破棄しますか？'
    },
    
    // 成功メッセージ
    success: {
        listCreated: 'リストが作成されました',
        listUpdated: 'リストが更新されました',
        listDeleted: 'リストが削除されました',
        itemAdded: '項目が追加されました',
        itemUpdated: '項目が更新されました',
        itemDeleted: '項目が削除されました',
        dataExported: 'データがエクスポートされました',
        dataImported: 'データがインポートされました'
    },
    
    // 情報メッセージ
    info: {
        noLists: 'リストがありません',
        noItems: '項目がありません',
        allCompleted: 'すべて完了しました！',
        partiallyCompleted: '一部完了しています',
        emptyList: 'このリストは空です'
    },
    
    // ページタイトル
    titles: {
        listCreate: 'リスト作成',
        listEdit: 'リスト編集',
        itemEdit: '項目編集',
        settings: '設定',
        statistics: '統計'
    }
};

// アクション定数
const ACTIONS = {
    // データ操作
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    
    // UI操作
    SHOW_LIST_SCREEN: 'SHOW_LIST_SCREEN',
    SHOW_DETAIL_SCREEN: 'SHOW_DETAIL_SCREEN',
    SHOW_EDIT_SCREEN: 'SHOW_EDIT_SCREEN',
    
    // リスト操作
    ADD_LIST: 'ADD_LIST',
    EDIT_LIST: 'EDIT_LIST',
    DELETE_LIST: 'DELETE_LIST',
    RESET_LIST: 'RESET_LIST',
    
    // 項目操作
    ADD_ITEM: 'ADD_ITEM',
    EDIT_ITEM: 'EDIT_ITEM',
    DELETE_ITEM: 'DELETE_ITEM',
    TOGGLE_ITEM: 'TOGGLE_ITEM',
    
    // データ操作
    SAVE_DATA: 'SAVE_DATA',
    LOAD_DATA: 'LOAD_DATA',
    EXPORT_DATA: 'EXPORT_DATA',
    IMPORT_DATA: 'IMPORT_DATA'
};

// 状態定数
const STATES = {
    // アプリケーション状態
    LOADING: 'LOADING',
    READY: 'READY',
    ERROR: 'ERROR',
    SAVING: 'SAVING',
    
    // 編集状態
    CREATING: 'CREATING',
    EDITING: 'EDITING',
    VIEWING: 'VIEWING',
    
    // データ状態
    CLEAN: 'CLEAN',
    DIRTY: 'DIRTY',
    SYNCING: 'SYNCING',
    OFFLINE: 'OFFLINE'
};

// イベント定数
const EVENTS = {
    // DOM イベント
    CLICK: 'click',
    CHANGE: 'change',
    INPUT: 'input',
    SUBMIT: 'submit',
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',
    FOCUS: 'focus',
    BLUR: 'blur',
    
    // カスタムイベント
    LIST_CREATED: 'list:created',
    LIST_UPDATED: 'list:updated',
    LIST_DELETED: 'list:deleted',
    ITEM_CREATED: 'item:created',
    ITEM_UPDATED: 'item:updated',
    ITEM_DELETED: 'item:deleted',
    ITEM_TOGGLED: 'item:toggled',
    DATA_SAVED: 'data:saved',
    DATA_LOADED: 'data:loaded',
    SCREEN_CHANGED: 'screen:changed'
};

// キーコード定数
const KEY_CODES = {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    ARROW_UP: 38,
    ARROW_DOWN: 40,
    DELETE: 46,
    BACKSPACE: 8
};

// データフォーマット定数
const DATA_FORMATS = {
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm:ss',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    ISO_FORMAT: 'ISO',
    
    // エクスポート形式
    JSON: 'json',
    CSV: 'csv',
    TXT: 'txt'
};

// ローカルストレージキー
const STORAGE_KEYS = {
    CHECKLISTS: 'checklists',
    SETTINGS: 'settings',
    USER_PREFERENCES: 'userPreferences',
    APP_STATE: 'appState',
    BACKUP: 'backup'
};

// URL/ルート定数
const ROUTES = {
    HOME: '/',
    LIST: '/list',
    DETAIL: '/detail',
    EDIT: '/edit',
    SETTINGS: '/settings',
    ABOUT: '/about'
};

// API エンドポイント（将来の拡張用）
const API_ENDPOINTS = {
    BASE_URL: '',
    LISTS: '/api/lists',
    ITEMS: '/api/items',
    SYNC: '/api/sync',
    BACKUP: '/api/backup'
};

// 数値定数
const NUMBERS = {
    // ページネーション
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    
    // 制限値
    MAX_LIST_NAME_LENGTH: 100,
    MAX_ITEM_TEXT_LENGTH: 200,
    MAX_LISTS_COUNT: 1000,
    MAX_ITEMS_PER_LIST: 1000,
    
    // タイムアウト
    DEFAULT_TIMEOUT: 5000,
    SAVE_TIMEOUT: 3000,
    LOAD_TIMEOUT: 10000
};

// モジュールエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CSS_CLASSES,
        ELEMENT_IDS,
        MESSAGES,
        ACTIONS,
        STATES,
        EVENTS,
        KEY_CODES,
        DATA_FORMATS,
        STORAGE_KEYS,
        ROUTES,
        API_ENDPOINTS,
        NUMBERS
    };
} else {
    // ブラウザ環境
    window.AppConstants = {
        CSS_CLASSES,
        ELEMENT_IDS,
        MESSAGES,
        ACTIONS,
        STATES,
        EVENTS,
        KEY_CODES,
        DATA_FORMATS,
        STORAGE_KEYS,
        ROUTES,
        API_ENDPOINTS,
        NUMBERS
    };
}