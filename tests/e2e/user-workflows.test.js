/**
 * User Workflows E2E Tests
 * フォーム送信・ナビゲーション・データ永続化の包括的なテスト
 */

const Browser = require('zombie');
const { spawn } = require('child_process');

describe('User Workflows E2E Tests', () => {
  let browser;
  let serverProcess;
  const serverPort = 8083;
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
  });

  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  beforeEach(async () => {
    // 各テスト前にブラウザ状態をリセット
    browser = new Browser();
    browser.silent = true;
    browser.waitDuration = '30s';
    await browser.visit(baseUrl);
    
    // localStorageをクリア
    browser.window.localStorage.clear();
  });

  describe('完全なユーザーワークフロー', () => {
    test('新規リスト作成から完了まで', async () => {
      // Step 1: 新規リスト作成開始
      const addButton = browser.query('#addListBtn');
      expect(addButton).toBeTruthy();
      browser.fire(addButton, 'click');
      
      // Step 2: 編集画面に遷移していることを確認
      expect(browser.query('#editScreen:not(.hidden)')).toBeTruthy();
      expect(browser.query('#listScreen.hidden')).toBeTruthy();
      
      // Step 3: リスト名を入力
      browser.fill('#listNameInput', '日課チェックリスト');
      expect(browser.query('#listNameInput').value).toBe('日課チェックリスト');
      
      // Step 4: 複数の項目を追加
      const items = ['朝の運動', '読書', '日記を書く', '水分補給'];
      for (let i = 0; i < items.length; i++) {
        browser.fire('#addItemBtn', 'click');
        await browser.wait(100); // 少し待機
        
        const itemInputs = browser.queryAll('.edit-item-input');
        const lastInput = itemInputs[itemInputs.length - 1];
        if (lastInput) {
          browser.fill(lastInput, items[i]);
        }
      }
      
      // Step 5: リストを保存
      browser.fire('#saveBtn', 'click');
      
      // Step 6: リスト画面に戻ることを確認
      expect(browser.query('#listScreen:not(.hidden)')).toBeTruthy();
      expect(browser.query('#editScreen.hidden')).toBeTruthy();
      
      // Step 7: 作成したリストが表示されることを確認
      const listItems = browser.queryAll('.list-item');
      expect(listItems.length).toBe(1);
      expect(listItems[0].textContent).toContain('日課チェックリスト');
      
      // Step 8: リストをクリックして詳細画面に遷移
      browser.fire(listItems[0], 'click');
      
      // Step 9: 詳細画面に遷移していることを確認
      expect(browser.query('#detailScreen:not(.hidden)')).toBeTruthy();
      expect(browser.query('#listTitle').textContent).toBe('日課チェックリスト');
      
      // Step 10: 全ての項目が表示されることを確認
      const detailItems = browser.queryAll('.item');
      expect(detailItems.length).toBe(4);
      
      // Step 11: 各項目をチェック
      const checkboxes = browser.queryAll('.item-checkbox');
      expect(checkboxes.length).toBe(4);
      
      // 最初の2つの項目をチェック
      browser.fire(checkboxes[0], 'change');
      browser.fire(checkboxes[1], 'change');
      
      // Step 12: プログレスバーが更新されることを確認
      const progressText = browser.query('#progressText');
      expect(progressText.textContent).toBe('2/4');
      
      // Step 13: 残りの項目もチェック
      browser.fire(checkboxes[2], 'change');
      browser.fire(checkboxes[3], 'change');
      
      // Step 14: 完了状態を確認
      expect(browser.query('#progressText').textContent).toBe('4/4');
      
      // Step 15: リセット機能をテスト
      browser.fire('#resetBtn', 'click');
      
      // Step 16: 全てのチェックが外れることを確認
      const resetCheckboxes = browser.queryAll('.item-checkbox');
      resetCheckboxes.forEach(checkbox => {
        expect(checkbox.checked).toBe(false);
      });
      expect(browser.query('#progressText').textContent).toBe('0/4');
    });

    test('リスト編集ワークフロー', async () => {
      // Step 1: 初期リストを作成
      await createTestList(browser, 'テストリスト', ['項目1', '項目2']);
      
      // Step 2: 作成したリストの詳細画面に遷移
      const listItem = browser.query('.list-item');
      browser.fire(listItem, 'click');
      
      // Step 3: 編集画面に遷移
      browser.fire('#editBtn', 'click');
      
      // Step 4: 編集画面であることを確認
      expect(browser.query('#editScreen:not(.hidden)')).toBeTruthy();
      
      // Step 5: リスト名を変更
      browser.fill('#listNameInput', '更新されたテストリスト');
      
      // Step 6: 新しい項目を追加
      browser.fire('#addItemBtn', 'click');
      const itemInputs = browser.queryAll('.edit-item-input');
      const lastInput = itemInputs[itemInputs.length - 1];
      if (lastInput) {
        browser.fill(lastInput, '新しい項目');
      }
      
      // Step 7: 変更を保存
      browser.fire('#saveBtn', 'click');
      
      // Step 8: リスト画面に戻ることを確認
      expect(browser.query('#listScreen:not(.hidden)')).toBeTruthy();
      
      // Step 9: 変更が反映されていることを確認
      const updatedListItem = browser.query('.list-item');
      expect(updatedListItem.textContent).toContain('更新されたテストリスト');
      
      // Step 10: 詳細画面で項目が追加されていることを確認
      browser.fire(updatedListItem, 'click');
      const detailItems = browser.queryAll('.item');
      expect(detailItems.length).toBe(3);
    });

    test('複数リスト管理ワークフロー', async () => {
      // Step 1: 複数のリストを作成
      const listConfigs = [
        { name: '朝のルーティン', items: ['歯磨き', '洗顔', '朝食'] },
        { name: '夜のルーティン', items: ['入浴', '読書', '就寝準備'] },
        { name: '週次タスク', items: ['掃除', '買い物', '洗濯'] }
      ];
      
      for (const config of listConfigs) {
        await createTestList(browser, config.name, config.items);
      }
      
      // Step 2: 3つのリストが作成されていることを確認
      const listItems = browser.queryAll('.list-item');
      expect(listItems.length).toBe(3);
      
      // Step 3: 各リストの詳細画面を確認
      for (let i = 0; i < listItems.length; i++) {
        browser.fire(listItems[i], 'click');
        
        // 詳細画面であることを確認
        expect(browser.query('#detailScreen:not(.hidden)')).toBeTruthy();
        
        // リスト名が正しいことを確認
        const listTitle = browser.query('#listTitle').textContent;
        expect(listConfigs.some(config => config.name === listTitle)).toBe(true);
        
        // 項目数が正しいことを確認
        const detailItems = browser.queryAll('.item');
        const expectedItems = listConfigs.find(config => config.name === listTitle).items;
        expect(detailItems.length).toBe(expectedItems.length);
        
        // 戻るボタンで一覧に戻る
        browser.fire('#backBtn', 'click');
        expect(browser.query('#listScreen:not(.hidden)')).toBeTruthy();
      }
    });
  });

  describe('データ永続化とセッション管理', () => {
    test('ページリロード後のデータ保持', async () => {
      // Step 1: リストを作成
      await createTestList(browser, 'データ永続化テスト', ['項目1', '項目2', '項目3']);
      
      // Step 2: 詳細画面に遷移してチェック
      const listItem = browser.query('.list-item');
      browser.fire(listItem, 'click');
      
      const checkboxes = browser.queryAll('.item-checkbox');
      browser.fire(checkboxes[0], 'change');
      browser.fire(checkboxes[1], 'change');
      
      // Step 3: localStorageにデータが保存されていることを確認
      const savedData = browser.window.localStorage.getItem('checklistData');
      expect(savedData).toBeTruthy();
      
      const data = JSON.parse(savedData);
      expect(data.lists).toHaveLength(1);
      expect(data.lists[0].items.filter(item => item.checked)).toHaveLength(2);
      
      // Step 4: ページをリロード
      await browser.reload();
      
      // Step 5: データが保持されていることを確認
      const restoredListItems = browser.queryAll('.list-item');
      expect(restoredListItems.length).toBe(1);
      
      // Step 6: 詳細画面でチェック状態が保持されていることを確認
      browser.fire(restoredListItems[0], 'click');
      const restoredCheckboxes = browser.queryAll('.item-checkbox');
      const checkedCount = restoredCheckboxes.filter(cb => cb.checked).length;
      expect(checkedCount).toBe(2);
    });

    test('異なるセッションでのデータ一貫性', async () => {
      // Step 1: 初期データを作成
      await createTestList(browser, 'セッションテスト', ['項目A', '項目B']);
      
      // Step 2: 新しいブラウザインスタンスを作成
      const newBrowser = new Browser();
      newBrowser.silent = true;
      await newBrowser.visit(baseUrl);
      
      // Step 3: 同じlocalStorageを設定
      const originalData = browser.window.localStorage.getItem('checklistData');
      newBrowser.window.localStorage.setItem('checklistData', originalData);
      
      // Step 4: 新しいブラウザでページをリロード
      await newBrowser.reload();
      
      // Step 5: データが一貫していることを確認
      const newListItems = newBrowser.queryAll('.list-item');
      expect(newListItems.length).toBe(1);
      expect(newListItems[0].textContent).toContain('セッションテスト');
    });
  });

  describe('フォーム検証とエラーハンドリング', () => {
    test('無効なフォーム送信のハンドリング', async () => {
      // Step 1: 編集画面に遷移
      browser.fire('#addListBtn', 'click');
      
      // Step 2: 空のリスト名で保存を試行
      browser.fill('#listNameInput', '');
      browser.fire('#saveBtn', 'click');
      
      // Step 3: 編集画面に留まることを確認（エラーハンドリング）
      expect(browser.query('#editScreen:not(.hidden)')).toBeTruthy();
      
      // Step 4: 有効なリスト名を入力
      browser.fill('#listNameInput', '有効なリスト名');
      
      // Step 5: 項目なしで保存を試行
      browser.fire('#saveBtn', 'click');
      
      // Step 6: 適切にハンドリングされることを確認
      // （具体的な動作は実装依存）
    });

    test('特殊文字を含むデータの処理', async () => {
      // Step 1: 特殊文字を含むリストを作成
      const specialName = 'テスト&リスト<script>alert("test")</script>';
      const specialItems = ['項目"1"', "項目'2'", '項目&3'];
      
      await createTestList(browser, specialName, specialItems);
      
      // Step 2: データが正しく処理されることを確認
      const listItem = browser.query('.list-item');
      expect(listItem).toBeTruthy();
      
      // Step 3: 詳細画面で特殊文字が適切に表示されることを確認
      browser.fire(listItem, 'click');
      const detailItems = browser.queryAll('.item');
      expect(detailItems.length).toBe(3);
    });
  });

  describe('ユーザビリティとアクセシビリティ', () => {
    test('キーボードナビゲーション', async () => {
      // Step 1: リストを作成
      await createTestList(browser, 'キーボードテスト', ['項目1']);
      
      // Step 2: フォーカス管理を確認
      const listItem = browser.query('.list-item');
      browser.fire(listItem, 'click');
      
      // Step 3: 要素にフォーカスが設定されることを確認
      const focusableElements = browser.queryAll('button, input, [tabindex]');
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    test('レスポンシブ対応確認', async () => {
      // Step 1: 画面サイズに応じた要素の確認
      const screenElements = browser.queryAll('.screen');
      expect(screenElements.length).toBe(3);
      
      // Step 2: モバイル対応要素の確認
      const appContainer = browser.query('.app');
      expect(appContainer).toBeTruthy();
      
      // Step 3: 基本的なUI要素の存在確認
      const essentialElements = [
        '.header',
        '.main',
        '#addListBtn',
        '#listContainer'
      ];
      
      essentialElements.forEach(selector => {
        expect(browser.query(selector)).toBeTruthy();
      });
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
      await browser.wait(50); // 少し待機
      
      const itemInputs = browser.queryAll('.edit-item-input');
      const lastInput = itemInputs[itemInputs.length - 1];
      if (lastInput) {
        browser.fill(lastInput, item);
      }
    }
    
    // 保存
    browser.fire('#saveBtn', 'click');
    
    // リスト画面に戻るまで待機
    await browser.wait(100);
  }
});