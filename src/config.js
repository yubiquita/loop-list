/**
 * アプリケーション設定ファイル
 * アプリケーション全体で使用する設定値を管理
 */
const CONFIG = {
    // ストレージ設定
    storage: {
        key: 'checklists',
        version: '1.0'
    },

    // UI設定
    ui: {
        // 画面遷移アニメーション時間（ミリ秒）
        transitionDuration: 300,
        
        // プログレスバー更新アニメーション時間（ミリ秒）
        progressAnimationDuration: 300,
        
        // 最大表示可能リスト数（パフォーマンス制限）
        maxDisplayLists: 1000,
        
        // 最大表示可能項目数（パフォーマンス制限）
        maxDisplayItems: 1000,
        
        // デバウンス時間（ミリ秒）
        debounceTime: 300
    },

    // バリデーション設定
    validation: {
        // リスト名の最大長
        maxListNameLength: 100,
        
        // 項目テキストの最大長
        maxItemTextLength: 200,
        
        // 1つのリストあたりの最大項目数
        maxItemsPerList: 1000
    },

    // 機能設定
    features: {
        // 自動保存機能
        autoSave: true,
        
        // 自動保存の遅延時間（ミリ秒）
        autoSaveDelay: 1000,
        
        // 確認ダイアログの表示
        confirmDialogs: true,
        
        // 進捗表示機能
        showProgress: true,
        
        // 統計情報表示機能
        showStatistics: false,
        
        // 検索機能
        enableSearch: false,
        
        // ソート機能
        enableSort: false
    },

    // デバッグ設定
    debug: {
        // デバッグモード
        enabled: false,
        
        // コンソールログ出力
        consoleLog: false,
        
        // エラー詳細表示
        verboseErrors: false
    },

    // パフォーマンス設定
    performance: {
        // 仮想スクロール有効化閾値
        virtualScrollThreshold: 100,
        
        // 遅延レンダリング
        lazyRendering: false,
        
        // メモリ制限（MB）
        memoryLimit: 50
    }
};

// 環境に応じた設定のオーバーライド
if (typeof window !== 'undefined') {
    // ブラウザ環境
    CONFIG.storage.available = typeof Storage !== 'undefined';
} else {
    // Node.js環境（テスト等）
    CONFIG.storage.available = false;
    CONFIG.debug.enabled = true;
}

// 設定値の取得関数
const getConfig = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], CONFIG);
};

// 設定値の設定関数（開発用）
const setConfig = (path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
        if (!obj[key]) obj[key] = {};
        return obj[key];
    }, CONFIG);
    target[lastKey] = value;
};

// 設定の妥当性チェック
const validateConfig = () => {
    const errors = [];
    
    if (CONFIG.validation.maxListNameLength <= 0) {
        errors.push('maxListNameLength must be positive');
    }
    
    if (CONFIG.validation.maxItemTextLength <= 0) {
        errors.push('maxItemTextLength must be positive');
    }
    
    if (CONFIG.ui.transitionDuration < 0) {
        errors.push('transitionDuration must be non-negative');
    }
    
    return errors;
};

// モジュールエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        getConfig,
        setConfig,
        validateConfig
    };
} else {
    // ブラウザ環境
    window.AppConfig = {
        CONFIG,
        getConfig,
        setConfig,
        validateConfig
    };
}