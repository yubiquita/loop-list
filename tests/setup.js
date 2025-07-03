const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

const dom = new JSDOM(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>繰り返しチェックリスト</title>
</head>
<body>
    <div class="app">
        <header class="header">
            <h1>繰り返しチェックリスト</h1>
            <button class="add-list-btn" id="addListBtn">+</button>
        </header>

        <main class="main">
            <div class="screen" id="listScreen">
                <div class="list-container" id="listContainer">
                </div>
            </div>

            <div class="screen hidden" id="detailScreen">
                <div class="detail-header">
                    <button class="back-btn" id="backBtn">←</button>
                    <h2 id="listTitle"></h2>
                    <button class="edit-btn" id="editBtn">編集</button>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                    <span class="progress-text" id="progressText">0/0</span>
                </div>
                <div class="item-list" id="itemList">
                </div>
                <div class="action-buttons">
                    <button class="reset-btn" id="resetBtn">リセット</button>
                </div>
            </div>

            <div class="screen hidden" id="editScreen">
                <div class="edit-header">
                    <button class="cancel-btn" id="cancelBtn">キャンセル</button>
                    <h2 id="editTitle">編集</h2>
                    <button class="save-btn" id="saveBtn">保存</button>
                </div>
                <div class="edit-form">
                    <input type="text" id="listNameInput" placeholder="リスト名" class="list-name-input">
                    <div class="edit-items" id="editItems">
                    </div>
                    <button class="add-item-btn" id="addItemBtn">項目を追加</button>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
`, { url: 'http://localhost' });

// localStorageモックを作成
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

// windowオブジェクトにlocalStorageを設定してからglobalに設定
dom.window.localStorage = localStorageMock;

global.document = dom.window.document;
global.window = dom.window;
global.localStorage = dom.window.localStorage;
global.localStorageMock = localStorageMock;

global.alert = jest.fn();
global.confirm = jest.fn();

beforeEach(() => {
    // localStorageモックのリセット（jest.clearAllMocks()の前に実行）
    global.localStorageMock.getItem.mockReturnValue(null);
    global.localStorageMock.setItem.mockClear();
    global.localStorageMock.removeItem.mockClear();
    global.localStorageMock.clear.mockClear();
    
    // 他のモックをクリア
    global.alert.mockClear();
    global.confirm.mockReturnValue(true);
    
    document.body.innerHTML = `
        <div class="app">
            <header class="header">
                <h1>繰り返しチェックリスト</h1>
                <button class="add-list-btn" id="addListBtn">+</button>
            </header>

            <main class="main">
                <div class="screen" id="listScreen">
                    <div class="list-container" id="listContainer">
                    </div>
                </div>

                <div class="screen hidden" id="detailScreen">
                    <div class="detail-header">
                        <button class="back-btn" id="backBtn">←</button>
                        <h2 id="listTitle"></h2>
                        <button class="edit-btn" id="editBtn">編集</button>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                        <span class="progress-text" id="progressText">0/0</span>
                    </div>
                    <div class="item-list" id="itemList">
                    </div>
                    <div class="action-buttons">
                        <button class="reset-btn" id="resetBtn">リセット</button>
                    </div>
                </div>

                <div class="screen hidden" id="editScreen">
                    <div class="edit-header">
                        <button class="cancel-btn" id="cancelBtn">キャンセル</button>
                        <h2 id="editTitle">編集</h2>
                        <button class="save-btn" id="saveBtn">保存</button>
                    </div>
                    <div class="edit-form">
                        <input type="text" id="listNameInput" placeholder="リスト名" class="list-name-input">
                        <div class="edit-items" id="editItems">
                        </div>
                        <button class="add-item-btn" id="addItemBtn">項目を追加</button>
                    </div>
                </div>
            </main>
        </div>
    `;
});