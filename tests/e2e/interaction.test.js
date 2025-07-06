/**
 * User Interaction E2E Tests
 * @testing-library/domを使用したユーザーインタラクションテスト
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Testing Library関数のインポート
const { getByText, getByPlaceholderText, queryByText, fireEvent } = require('@testing-library/dom');

// Node.js環境で直接クラスをrequire
const ChecklistDataManager = require('../../src/ChecklistDataManager.js');
const ChecklistUIManager = require('../../src/ChecklistUIManager.js');
const ChecklistListManager = require('../../src/ChecklistListManager.js');
const ChecklistItemManager = require('../../src/ChecklistItemManager.js');
const ChecklistApp = require('../../src/ChecklistApp.js');

describe('User Interaction E2E Tests', () => {
  let dom;
  let container;
  let app;

  beforeEach(() => {
    // 1. HTMLファイルの読み込みとJSDOM環境の設定
    const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
    dom = new JSDOM(html, {
      url: 'http://localhost',
      runScripts: 'outside-only',
      pretendToBeVisual: true,
    });
    container = dom.window.document.body;
    
    // 2. グローバル環境の設定
    global.window = dom.window;
    global.document = dom.window.document;
    
    // localStorageモック（実際にデータを保存・取得）
    const storage = {};
    global.localStorage = {
      getItem: jest.fn((key) => storage[key] || null),
      setItem: jest.fn((key, value) => { storage[key] = value; }),
      removeItem: jest.fn((key) => { delete storage[key]; }),
      clear: jest.fn(() => { Object.keys(storage).forEach(key => delete storage[key]); }),
    };
    global.confirm = jest.fn(() => true);
    global.alert = jest.fn();
    global.SortableJS = {
      create: jest.fn(() => ({
        destroy: jest.fn(),
      })),
    };

    // 3. ChecklistAppを直接インスタンス化
    app = new ChecklistApp();
    global.window.app = app;
  });

  afterEach(() => {
    // グローバル環境のクリーンアップ
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.confirm;
    delete global.alert;
    delete global.SortableJS;
  });

  describe('基本機能テスト', () => {
    test('アプリケーションが正常に初期化される', () => {
      expect(app).toBeDefined();
      expect(app.dataManager).toBeDefined();
      expect(app.uiManager).toBeDefined();
      expect(app.listManager).toBeDefined();
      expect(app.itemManager).toBeDefined();
    });

    test('DOM構造が正しく読み込まれる', () => {
      expect(container.querySelector('.app')).not.toBeNull();
      expect(container.querySelector('#listScreen')).not.toBeNull();
      expect(container.querySelector('#detailScreen')).not.toBeNull();
      expect(container.querySelector('#editScreen')).not.toBeNull();
    });

    test('初期画面はリスト画面が表示される', () => {
      const listScreen = container.querySelector('#listScreen');
      const detailScreen = container.querySelector('#detailScreen');
      const editScreen = container.querySelector('#editScreen');
      
      expect(listScreen.classList.contains('hidden')).toBe(false);
      expect(detailScreen.classList.contains('hidden')).toBe(true);
      expect(editScreen.classList.contains('hidden')).toBe(true);
    });
  });

  describe('画面遷移テスト', () => {
    test('編集画面に遷移できる', () => {
      app.showEditScreen();
      
      const editScreen = container.querySelector('#editScreen');
      const listScreen = container.querySelector('#listScreen');
      
      expect(editScreen.classList.contains('hidden')).toBe(false);
      expect(listScreen.classList.contains('hidden')).toBe(true);
    });

    test('リスト画面に戻ることができる', () => {
      app.showEditScreen();
      app.showListScreen();
      
      const editScreen = container.querySelector('#editScreen');
      const listScreen = container.querySelector('#listScreen');
      
      expect(editScreen.classList.contains('hidden')).toBe(true);
      expect(listScreen.classList.contains('hidden')).toBe(false);
    });
  });

  describe('リスト作成テスト', () => {
    test('新しいリストを作成できる', () => {
      // 編集画面に遷移
      app.showEditScreen();
      
      // リスト名を入力
      const listNameInput = getByPlaceholderText(container, 'リスト名');
      fireEvent.change(listNameInput, { target: { value: 'テストリスト' } });
      
      // 保存
      app.saveList();
      
      // リスト画面に戻ることを確認
      const listScreen = container.querySelector('#listScreen');
      expect(listScreen.classList.contains('hidden')).toBe(false);
      
      // DOMにリストが表示されることを確認
      const listContainer = container.querySelector('#listContainer');
      expect(listContainer.children.length).toBeGreaterThan(0);
    });

    test('リスト名なしでは保存できない', () => {
      app.showEditScreen();
      
      // 空のまま保存を試行
      app.saveList();
      
      // 編集画面のままであることを確認
      const editScreen = container.querySelector('#editScreen');
      expect(editScreen.classList.contains('hidden')).toBe(false);
    });
  });

  describe('項目管理テスト（基本）', () => {
    test('編集画面で項目を追加できる', () => {
      app.showEditScreen();
      
      // 項目を追加
      app.addEditItem();
      
      // 項目入力フィールドが追加されることを確認
      const itemInputs = container.querySelectorAll('#editItems input[type="text"]');
      expect(itemInputs.length).toBe(1);
    });

    test('複数の項目を追加できる', () => {
      app.showEditScreen();
      
      // 複数の項目を追加
      app.addEditItem();
      app.addEditItem();
      app.addEditItem();
      
      // 3つの項目入力フィールドが追加されることを確認
      const itemInputs = container.querySelectorAll('#editItems input[type="text"]');
      expect(itemInputs.length).toBe(3);
    });
  });

  describe('統合テスト', () => {
    test('リスト作成から項目追加まで一連の流れが動作する', () => {
      // 1. 編集画面に遷移
      app.showEditScreen();
      
      // 2. リスト名を入力
      const listNameInput = getByPlaceholderText(container, 'リスト名');
      fireEvent.change(listNameInput, { target: { value: '統合テストリスト' } });
      
      // 3. 項目を追加
      app.addEditItem();
      const itemInput = container.querySelector('#editItems input[type="text"]');
      fireEvent.change(itemInput, { target: { value: 'テスト項目1' } });
      
      // 4. 保存
      app.saveList();
      
      // 5. 結果確認
      const listScreen = container.querySelector('#listScreen');
      expect(listScreen.classList.contains('hidden')).toBe(false);
      
      const listContainer = container.querySelector('#listContainer');
      expect(listContainer.children.length).toBeGreaterThan(0);
    });

    test('画面遷移がスムーズに動作する', () => {
      // リスト画面 → 編集画面 → リスト画面
      expect(container.querySelector('#listScreen').classList.contains('hidden')).toBe(false);
      
      app.showEditScreen();
      expect(container.querySelector('#editScreen').classList.contains('hidden')).toBe(false);
      expect(container.querySelector('#listScreen').classList.contains('hidden')).toBe(true);
      
      app.showListScreen();
      expect(container.querySelector('#listScreen').classList.contains('hidden')).toBe(false);
      expect(container.querySelector('#editScreen').classList.contains('hidden')).toBe(true);
    });
  });

  describe('UI要素テスト', () => {
    test('必要なボタンが存在する', () => {
      expect(container.querySelector('#addListBtn')).not.toBeNull();
      expect(container.querySelector('#saveBtn')).not.toBeNull();
      expect(container.querySelector('#cancelBtn')).not.toBeNull();
      expect(container.querySelector('#addItemBtn')).not.toBeNull();
    });

    test('詳細画面の要素が存在する', () => {
      expect(container.querySelector('#backBtn')).not.toBeNull();
      expect(container.querySelector('#editBtn')).not.toBeNull();
      expect(container.querySelector('#resetBtn')).not.toBeNull();
      expect(container.querySelector('#progressFill')).not.toBeNull();
      expect(container.querySelector('#progressText')).not.toBeNull();
    });
  });
});
