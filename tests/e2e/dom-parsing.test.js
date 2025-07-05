/**
 * Cheerio DOM Parsing E2E Tests
 * Termux環境でのHTMLパーシング・DOM操作テスト
 */

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

describe('DOM Parsing E2E Tests', () => {
  let $;
  let htmlContent;

  beforeEach(() => {
    // HTMLファイルを読み込み
    const htmlPath = path.join(__dirname, '../../index.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    $ = cheerio.load(htmlContent);
  });

  describe('HTML構造テスト', () => {
    test('基本的なHTML構造が正しく読み込まれる', () => {
      expect($('html').length).toBe(1);
      expect($('head').length).toBe(1);
      expect($('body').length).toBe(1);
      expect($('title').text()).toBe('繰り返しチェックリスト');
    });

    test('メタタグが正しく設定されている', () => {
      expect($('meta[charset="UTF-8"]').length).toBe(1);
      expect($('meta[name="viewport"]').length).toBe(1);
      expect($('meta[name="viewport"]').attr('content')).toBe('width=device-width, initial-scale=1.0');
    });

    test('CSSファイルが正しくリンクされている', () => {
      expect($('link[rel="stylesheet"]').length).toBe(1);
      expect($('link[rel="stylesheet"]').attr('href')).toBe('style.css');
    });
  });

  describe('アプリケーション構造テスト', () => {
    test('メインアプリケーションコンテナが存在する', () => {
      expect($('.app').length).toBe(1);
      expect($('.header').length).toBe(1);
      expect($('.main').length).toBe(1);
    });

    test('ヘッダー要素が正しく配置されている', () => {
      expect($('.header h1').text()).toBe('繰り返しチェックリスト');
      expect($('.add-list-btn').length).toBe(1);
      expect($('.add-list-btn').attr('id')).toBe('addListBtn');
    });

    test('3つの画面が正しく配置されている', () => {
      expect($('.screen').length).toBe(3);
      expect($('#listScreen').length).toBe(1);
      expect($('#detailScreen').length).toBe(1);
      expect($('#editScreen').length).toBe(1);
    });
  });

  describe('リスト画面テスト', () => {
    test('リスト画面の要素が正しく配置されている', () => {
      expect($('#listScreen').hasClass('screen')).toBe(true);
      expect($('#listScreen').hasClass('hidden')).toBe(false);
      expect($('#listContainer').length).toBe(1);
    });
  });

  describe('詳細画面テスト', () => {
    test('詳細画面の要素が正しく配置されている', () => {
      expect($('#detailScreen').hasClass('screen')).toBe(true);
      expect($('#detailScreen').hasClass('hidden')).toBe(true);
      
      // ヘッダー要素
      expect($('#backBtn').length).toBe(1);
      expect($('#listTitle').length).toBe(1);
      expect($('#editBtn').length).toBe(1);
      
      // プログレスバー
      expect($('.progress-bar').length).toBe(1);
      expect($('#progressFill').length).toBe(1);
      expect($('#progressText').length).toBe(1);
      
      // アイテムリスト
      expect($('#itemList').length).toBe(1);
      
      // アクションボタン
      expect($('#resetBtn').length).toBe(1);
    });

    test('プログレスバーの初期状態が正しい', () => {
      expect($('#progressText').text()).toBe('0/0');
    });
  });

  describe('編集画面テスト', () => {
    test('編集画面の要素が正しく配置されている', () => {
      expect($('#editScreen').hasClass('screen')).toBe(true);
      expect($('#editScreen').hasClass('hidden')).toBe(true);
      
      // ヘッダー要素
      expect($('#cancelBtn').length).toBe(1);
      expect($('#editTitle').text()).toBe('編集');
      expect($('#saveBtn').length).toBe(1);
      
      // フォーム要素
      expect($('#listNameInput').length).toBe(1);
      expect($('#listNameInput').attr('placeholder')).toBe('リスト名');
      expect($('#editItems').length).toBe(1);
      expect($('#addItemBtn').length).toBe(1);
    });
  });

  describe('JavaScriptファイル読み込みテスト', () => {
    test('必要なJavaScriptファイルが正しく読み込まれている', () => {
      const scriptSources = $('script[src]').map((i, el) => $(el).attr('src')).get();
      
      expect(scriptSources).toContain('src/config.js');
      expect(scriptSources).toContain('src/constants.js');
      expect(scriptSources).toContain('src/ChecklistDataManager.js');
      expect(scriptSources).toContain('src/ChecklistUIManager.js');
      expect(scriptSources).toContain('src/ChecklistListManager.js');
      expect(scriptSources).toContain('src/ChecklistItemManager.js');
      expect(scriptSources).toContain('src/ChecklistApp.js');
    });

    test('スクリプトの読み込み順序が正しい', () => {
      const scriptSources = $('script[src]').map((i, el) => $(el).attr('src')).get();
      const appScripts = scriptSources.filter(src => src.startsWith('src/'));
      
      expect(appScripts.indexOf('src/config.js')).toBeLessThan(appScripts.indexOf('src/constants.js'));
      expect(appScripts.indexOf('src/constants.js')).toBeLessThan(appScripts.indexOf('src/ChecklistDataManager.js'));
      expect(appScripts.indexOf('src/ChecklistDataManager.js')).toBeLessThan(appScripts.indexOf('src/ChecklistApp.js'));
    });
  });

  describe('DOM操作シミュレーションテスト', () => {
    test('画面切り替えクラスの操作をシミュレート', () => {
      // 初期状態確認
      expect($('#listScreen').hasClass('hidden')).toBe(false);
      expect($('#detailScreen').hasClass('hidden')).toBe(true);
      expect($('#editScreen').hasClass('hidden')).toBe(true);
      
      // 詳細画面への切り替えをシミュレート
      $('#listScreen').addClass('hidden');
      $('#detailScreen').removeClass('hidden');
      
      expect($('#listScreen').hasClass('hidden')).toBe(true);
      expect($('#detailScreen').hasClass('hidden')).toBe(false);
      expect($('#editScreen').hasClass('hidden')).toBe(true);
    });

    test('プログレスバーの更新をシミュレート', () => {
      // プログレスバーの更新をシミュレート
      $('#progressText').text('3/5');
      $('#progressFill').css('width', '60%');
      
      expect($('#progressText').text()).toBe('3/5');
      expect($('#progressFill').css('width')).toBe('60%');
    });

    test('リストアイテムの動的追加をシミュレート', () => {
      // リストアイテムの動的追加をシミュレート
      const newItem = '<div class="list-item" data-id="test-id">テストリスト</div>';
      $('#listContainer').append(newItem);
      
      expect($('#listContainer .list-item').length).toBe(1);
      expect($('#listContainer .list-item').text()).toBe('テストリスト');
      expect($('#listContainer .list-item').attr('data-id')).toBe('test-id');
    });

    test('チェックボックスの状態変更をシミュレート', () => {
      // チェックボックスアイテムの追加
      const checkboxItem = '<div class="item"><input type="checkbox" class="item-checkbox" data-id="item-1"><span class="item-text">テスト項目</span></div>';
      $('#itemList').append(checkboxItem);
      
      // チェック状態の変更をシミュレート
      $('#itemList .item-checkbox').prop('checked', true);
      
      expect($('#itemList .item-checkbox').prop('checked')).toBe(true);
    });

    test('編集フォームの入力値設定をシミュレート', () => {
      // フォーム入力値の設定をシミュレート
      $('#listNameInput').val('新しいリスト名');
      
      expect($('#listNameInput').val()).toBe('新しいリスト名');
    });
  });

  describe('セレクタ検証テスト', () => {
    test('CSS セレクタが正しく動作する', () => {
      // クラスセレクタ
      expect($('.screen').length).toBe(3);
      expect($('.hidden').length).toBe(2);
      
      // IDセレクタ
      expect($('#listScreen').length).toBe(1);
      expect($('#detailScreen').length).toBe(1);
      expect($('#editScreen').length).toBe(1);
      
      // 属性セレクタ
      expect($('button[id]').length).toBeGreaterThan(0);
      expect($('input[type="text"]').length).toBe(1);
      
      // 複合セレクタ
      expect($('.screen.hidden').length).toBe(2);
      expect($('.screen:not(.hidden)').length).toBe(1);
    });

    test('階層セレクタが正しく動作する', () => {
      // 子要素セレクタ
      expect($('.header > h1').length).toBe(1);
      expect($('.header > button').length).toBe(1);
      
      // 子孫要素セレクタ
      expect($('.app .screen').length).toBe(3);
      expect($('.detail-header button').length).toBe(2);
      
      // 隣接セレクタ
      expect($('.progress-bar + .item-list').length).toBe(1);
    });
  });
});