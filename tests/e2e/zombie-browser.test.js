/**
 * Zombie.js Browser Simulation E2E Tests
 * Termux環境での軽量ブラウザシミュレーションテスト
 */

const Browser = require('zombie');
const { spawn } = require('child_process');

describe('Zombie.js Browser Simulation E2E Tests', () => {
  let browser;
  let serverProcess;
  const serverPort = 8082; // テスト用ポート
  const baseUrl = `http://localhost:${serverPort}`;

  beforeAll(async () => {
    // HTTP server を起動
    await new Promise((resolve, reject) => {
      serverProcess = spawn('npx', ['http-server', '-p', serverPort.toString(), '-c-1', '--cors'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Available on:') || output.includes('Starting up')) {
          setTimeout(resolve, 1000);
        }
      });

      serverProcess.on('error', reject);
      setTimeout(() => reject(new Error('Server startup timeout')), 10000);
    });

    // Zombie.js ブラウザを初期化
    browser = new Browser();
    browser.silent = true; // コンソールログを抑制
    browser.waitDuration = '30s'; // 待機時間を設定
  });

  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  beforeEach(() => {
    // 各テスト前にブラウザ状態をリセット
    browser.destroy();
    browser = new Browser();
    browser.silent = true;
    browser.waitDuration = '30s';
  });

  describe('ページロードテスト', () => {
    test('メインページが正しく読み込まれる', async () => {
      await browser.visit(baseUrl);
      
      expect(browser.success).toBe(true);
      expect(browser.text('title')).toBe('繰り返しチェックリスト');
      expect(browser.query('.app')).toBeTruthy();
    });

    test('JavaScriptファイルが正しく読み込まれる', async () => {
      await browser.visit(baseUrl);
      
      // window.appが正しく初期化されているかチェック
      expect(browser.window.ChecklistApp).toBeDefined();
      expect(browser.window.ChecklistDataManager).toBeDefined();
      expect(browser.window.ChecklistUIManager).toBeDefined();
    });

    test('CSSスタイルが正しく適用される', async () => {
      await browser.visit(baseUrl);
      
      const appElement = browser.query('.app');
      expect(appElement).toBeTruthy();
      
      // 画面の初期状態を確認
      expect(browser.query('#listScreen')).toBeTruthy();
      expect(browser.query('#detailScreen.hidden')).toBeTruthy();
      expect(browser.query('#editScreen.hidden')).toBeTruthy();
    });
  });

  describe('ユーザーインタラクションテスト', () => {
    test('リスト追加ボタンがクリックできる', async () => {
      await browser.visit(baseUrl);
      
      const addButton = browser.query('#addListBtn');
      expect(addButton).toBeTruthy();
      
      // ボタンクリックをシミュレート
      browser.fire(addButton, 'click');
      
      // 編集画面に遷移することを確認
      expect(browser.query('#editScreen:not(.hidden)')).toBeTruthy();
    });

    test('リスト名入力フィールドが動作する', async () => {
      await browser.visit(baseUrl);
      
      // 編集画面に遷移
      browser.fire('#addListBtn', 'click');
      
      // リスト名を入力
      browser.fill('#listNameInput', 'テストリスト');
      expect(browser.query('#listNameInput').value).toBe('テストリスト');
    });

    test('リスト保存機能が動作する', async () => {
      await browser.visit(baseUrl);
      
      // 編集画面に遷移
      browser.fire('#addListBtn', 'click');
      
      // リスト名を入力
      browser.fill('#listNameInput', 'テストリスト');
      
      // 項目を追加
      browser.fire('#addItemBtn', 'click');
      const itemInput = browser.query('.edit-item-input');
      if (itemInput) {
        browser.fill(itemInput, 'テスト項目1');
      }
      
      // 保存ボタンをクリック
      browser.fire('#saveBtn', 'click');
      
      // リスト画面に戻ることを確認
      expect(browser.query('#listScreen:not(.hidden)')).toBeTruthy();
    });
  });

  describe('画面遷移テスト', () => {
    test('リスト一覧から詳細画面への遷移', async () => {
      await browser.visit(baseUrl);
      
      // リストを作成
      await createTestList(browser, 'テストリスト', ['項目1', '項目2']);
      
      // 作成したリストをクリック
      const listItem = browser.query('.list-item');
      if (listItem) {
        browser.fire(listItem, 'click');
        
        // 詳細画面に遷移することを確認
        expect(browser.query('#detailScreen:not(.hidden)')).toBeTruthy();
        expect(browser.query('#listScreen.hidden')).toBeTruthy();
      }
    });

    test('詳細画面から編集画面への遷移', async () => {
      await browser.visit(baseUrl);
      
      // リストを作成して詳細画面に遷移
      await createTestList(browser, 'テストリスト', ['項目1']);
      const listItem = browser.query('.list-item');
      if (listItem) {
        browser.fire(listItem, 'click');
        
        // 編集ボタンをクリック
        browser.fire('#editBtn', 'click');
        
        // 編集画面に遷移することを確認
        expect(browser.query('#editScreen:not(.hidden)')).toBeTruthy();
        expect(browser.query('#detailScreen.hidden')).toBeTruthy();
      }
    });

    test('戻るボタンの動作', async () => {
      await browser.visit(baseUrl);
      
      // リストを作成して詳細画面に遷移
      await createTestList(browser, 'テストリスト', ['項目1']);
      const listItem = browser.query('.list-item');
      if (listItem) {
        browser.fire(listItem, 'click');
        
        // 戻るボタンをクリック
        browser.fire('#backBtn', 'click');
        
        // リスト画面に戻ることを確認
        expect(browser.query('#listScreen:not(.hidden)')).toBeTruthy();
        expect(browser.query('#detailScreen.hidden')).toBeTruthy();
      }
    });
  });

  describe('データ永続化テスト', () => {
    test('リストデータがlocalStorageに保存される', async () => {
      await browser.visit(baseUrl);
      
      // リストを作成
      await createTestList(browser, 'テストリスト', ['項目1', '項目2']);
      
      // localStorageにデータが保存されているかチェック
      const savedData = browser.window.localStorage.getItem('checklistData');
      expect(savedData).toBeTruthy();
      
      const data = JSON.parse(savedData);
      expect(data.lists).toHaveLength(1);
      expect(data.lists[0].name).toBe('テストリスト');
      expect(data.lists[0].items).toHaveLength(2);
    });

    test('ページリロード後もデータが保持される', async () => {
      await browser.visit(baseUrl);
      
      // リストを作成
      await createTestList(browser, 'テストリスト', ['項目1']);
      
      // ページをリロード
      await browser.reload();
      
      // データが保持されているかチェック
      const listItems = browser.queryAll('.list-item');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('チェックボックス機能テスト', () => {
    test('チェックボックスの状態変更が動作する', async () => {
      await browser.visit(baseUrl);
      
      // リストを作成して詳細画面に遷移
      await createTestList(browser, 'テストリスト', ['項目1', '項目2']);
      const listItem = browser.query('.list-item');
      if (listItem) {
        browser.fire(listItem, 'click');
        
        // チェックボックスをクリック
        const checkbox = browser.query('.item-checkbox');
        if (checkbox) {
          browser.fire(checkbox, 'change');
          
          // チェック状態が変更されることを確認
          expect(checkbox.checked).toBe(true);
        }
      }
    });

    test('プログレスバーが正しく更新される', async () => {
      await browser.visit(baseUrl);
      
      // リストを作成して詳細画面に遷移
      await createTestList(browser, 'テストリスト', ['項目1', '項目2']);
      const listItem = browser.query('.list-item');
      if (listItem) {
        browser.fire(listItem, 'click');
        
        // 1つ目の項目をチェック
        const firstCheckbox = browser.query('.item-checkbox');
        if (firstCheckbox) {
          browser.fire(firstCheckbox, 'change');
          
          // プログレスバーが更新されることを確認
          const progressText = browser.query('#progressText');
          expect(progressText.textContent).toContain('1/2');
        }
      }
    });
  });

  describe('エラーハンドリングテスト', () => {
    test('無効なリスト名でのエラーハンドリング', async () => {
      await browser.visit(baseUrl);
      
      // 編集画面に遷移
      browser.fire('#addListBtn', 'click');
      
      // 空のリスト名で保存を試行
      browser.fill('#listNameInput', '');
      browser.fire('#saveBtn', 'click');
      
      // エラーが適切に処理されることを確認
      // （実際の実装に応じてアサーションを調整）
      expect(browser.query('#editScreen:not(.hidden)')).toBeTruthy();
    });
  });

  // ヘルパー関数
  async function createTestList(browser, listName, items) {
    // 編集画面に遷移
    browser.fire('#addListBtn', 'click');
    
    // リスト名を入力
    browser.fill('#listNameInput', listName);
    
    // 項目を追加
    for (const item of items) {
      browser.fire('#addItemBtn', 'click');
      const itemInputs = browser.queryAll('.edit-item-input');
      const lastInput = itemInputs[itemInputs.length - 1];
      if (lastInput) {
        browser.fill(lastInput, item);
      }
    }
    
    // 保存
    browser.fire('#saveBtn', 'click');
    
    // リスト画面に戻るまで待機
    await browser.wait();
  }
});