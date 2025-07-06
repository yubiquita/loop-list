const ChecklistUIManager = require('../src/ChecklistUIManager.js');

describe('ChecklistUIManager', () => {
    let uiManager;

    beforeEach(() => {
        uiManager = new ChecklistUIManager();
    });

    describe('初期化', () => {
        test('コンストラクタで正しく初期化される', () => {
            expect(uiManager.currentScreen).toBe('listScreen');
            expect(uiManager.elements).toBeDefined();
            expect(typeof uiManager.elements).toBe('object');
        });

        test('DOM要素が正しく取得される', () => {
            expect(uiManager.elements.listScreen).toBe(document.getElementById('listScreen'));
            expect(uiManager.elements.detailScreen).toBe(document.getElementById('detailScreen'));
            expect(uiManager.elements.editScreen).toBe(document.getElementById('editScreen'));
            expect(uiManager.elements.listContainer).toBe(document.getElementById('listContainer'));
            expect(uiManager.elements.itemList).toBe(document.getElementById('itemList'));
            expect(uiManager.elements.editItems).toBe(document.getElementById('editItems'));
        });
    });

    describe('要素取得機能', () => {
        test('getElement()で正しい要素が取得される', () => {
            const listScreen = uiManager.getElement('listScreen');
            expect(listScreen).toBe(document.getElementById('listScreen'));
            
            const nonExistentElement = uiManager.getElement('nonExistent');
            expect(nonExistentElement).toBeUndefined();
        });

        test('hasElement()で要素の存在が正しく判定される', () => {
            expect(uiManager.hasElement('listScreen')).toBe(true);
            expect(uiManager.hasElement('nonExistent')).toBe(false);
        });
    });

    describe('画面遷移機能', () => {
        test('showListScreen()でリスト画面が表示される', () => {
            uiManager.showListScreen();
            
            expect(uiManager.elements.listScreen.classList.contains('hidden')).toBe(false);
            expect(uiManager.elements.detailScreen.classList.contains('hidden')).toBe(true);
            expect(uiManager.elements.editScreen.classList.contains('hidden')).toBe(true);
            expect(uiManager.currentScreen).toBe('listScreen');
        });

        test('showDetailScreen()で詳細画面が表示される', () => {
            const title = 'テストリスト';
            uiManager.showDetailScreen(title);
            
            expect(uiManager.elements.listScreen.classList.contains('hidden')).toBe(true);
            expect(uiManager.elements.detailScreen.classList.contains('hidden')).toBe(false);
            expect(uiManager.elements.editScreen.classList.contains('hidden')).toBe(true);
            expect(uiManager.elements.listTitle.textContent).toBe(title);
            expect(uiManager.currentScreen).toBe('detailScreen');
        });

        test('showEditScreen()で編集画面が表示される（新規作成モード）', () => {
            uiManager.showEditScreen(false);
            
            expect(uiManager.elements.listScreen.classList.contains('hidden')).toBe(true);
            expect(uiManager.elements.detailScreen.classList.contains('hidden')).toBe(true);
            expect(uiManager.elements.editScreen.classList.contains('hidden')).toBe(false);
            expect(uiManager.elements.editTitle.textContent).toBe('リスト作成');
            expect(uiManager.elements.listNameInput.value).toBe('');
            expect(uiManager.currentScreen).toBe('editScreen');
        });

        test('showEditScreen()で編集画面が表示される（編集モード）', () => {
            const title = 'テストリスト';
            uiManager.showEditScreen(true, title);
            
            expect(uiManager.elements.listScreen.classList.contains('hidden')).toBe(true);
            expect(uiManager.elements.detailScreen.classList.contains('hidden')).toBe(true);
            expect(uiManager.elements.editScreen.classList.contains('hidden')).toBe(false);
            expect(uiManager.elements.editTitle.textContent).toBe('リスト編集');
            expect(uiManager.elements.listNameInput.value).toBe(title);
            expect(uiManager.currentScreen).toBe('editScreen');
        });

        test('hideAllScreens()で全ての画面が非表示になる', () => {
            uiManager.hideAllScreens();
            
            expect(uiManager.elements.listScreen.classList.contains('hidden')).toBe(true);
            expect(uiManager.elements.detailScreen.classList.contains('hidden')).toBe(true);
            expect(uiManager.elements.editScreen.classList.contains('hidden')).toBe(true);
        });

        test('getCurrentScreen()で現在の画面が取得される', () => {
            expect(uiManager.getCurrentScreen()).toBe('listScreen');
            
            uiManager.showDetailScreen('テスト');
            expect(uiManager.getCurrentScreen()).toBe('detailScreen');
            
            uiManager.showEditScreen();
            expect(uiManager.getCurrentScreen()).toBe('editScreen');
        });
    });

    describe('プログレスバー機能', () => {
        test('updateProgress()でプログレスバーが更新される', () => {
            uiManager.updateProgress(2, 5);
            
            expect(uiManager.elements.progressFill.style.width).toBe('40%');
            expect(uiManager.elements.progressText.textContent).toBe('2/5');
        });

        test('全項目完了時にプログレスバーが100%になる', () => {
            uiManager.updateProgress(3, 3);
            
            expect(uiManager.elements.progressFill.style.width).toBe('100%');
            expect(uiManager.elements.progressText.textContent).toBe('3/3');
        });

        test('項目が0個の場合にプログレスバーが0%になる', () => {
            uiManager.updateProgress(0, 0);
            
            expect(uiManager.elements.progressFill.style.width).toBe('0%');
            expect(uiManager.elements.progressText.textContent).toBe('0/0');
        });
    });

    describe('コンテナクリア機能', () => {
        test('clearListContainer()でリストコンテナがクリアされる', () => {
            uiManager.elements.listContainer.innerHTML = '<div>テスト</div>';
            uiManager.clearListContainer();
            
            expect(uiManager.elements.listContainer.innerHTML).toBe('');
        });

        test('clearItemList()で項目リストがクリアされる', () => {
            uiManager.elements.itemList.innerHTML = '<div>テスト</div>';
            uiManager.clearItemList();
            
            expect(uiManager.elements.itemList.innerHTML).toBe('');
        });

        test('clearEditItems()で編集項目がクリアされる', () => {
            uiManager.elements.editItems.innerHTML = '<div>テスト</div>';
            uiManager.clearEditItems();
            
            expect(uiManager.elements.editItems.innerHTML).toBe('');
        });
    });

    describe('要素追加機能', () => {
        test('appendToListContainer()でリストコンテナに要素が追加される', () => {
            const element = document.createElement('div');
            element.textContent = 'テスト';
            
            uiManager.appendToListContainer(element);
            
            expect(uiManager.elements.listContainer.children.length).toBe(1);
            expect(uiManager.elements.listContainer.children[0]).toBe(element);
        });

        test('appendToItemList()で項目リストに要素が追加される', () => {
            const element = document.createElement('div');
            element.textContent = 'テスト';
            
            uiManager.appendToItemList(element);
            
            expect(uiManager.elements.itemList.children.length).toBe(1);
            expect(uiManager.elements.itemList.children[0]).toBe(element);
        });

        test('appendToEditItems()で編集項目に要素が追加される', () => {
            const element = document.createElement('div');
            element.textContent = 'テスト';
            
            uiManager.appendToEditItems(element);
            
            expect(uiManager.elements.editItems.children.length).toBe(1);
            expect(uiManager.elements.editItems.children[0]).toBe(element);
        });
    });

    describe('入力値操作機能', () => {
        test('getListNameInput()で入力値が取得される', () => {
            uiManager.elements.listNameInput.value = '  テストリスト  ';
            
            expect(uiManager.getListNameInput()).toBe('テストリスト');
        });

        test('setListNameInput()で入力値が設定される', () => {
            uiManager.setListNameInput('新しいリスト');
            
            expect(uiManager.elements.listNameInput.value).toBe('新しいリスト');
        });
    });

    describe('ダイアログ機能', () => {
        test('showAlert()でアラートが表示される', () => {
            uiManager.showAlert('テストメッセージ');
            
            expect(alert).toHaveBeenCalledWith('テストメッセージ');
        });

        test('showConfirm()で確認ダイアログが表示される', () => {
            confirm.mockReturnValue(true);
            
            const result = uiManager.showConfirm('テストメッセージ');
            
            expect(confirm).toHaveBeenCalledWith('テストメッセージ');
            expect(result).toBe(true);
        });
    });

    describe('イベントバインディング機能', () => {
        test('bindEvents()でイベントが正しくバインドされる', () => {
            const handlers = {
                addList: jest.fn(),
                back: jest.fn(),
                edit: jest.fn(),
                reset: jest.fn(),
                cancel: jest.fn(),
                save: jest.fn(),
                addItem: jest.fn()
            };

            uiManager.bindEvents(handlers);

            // 各ボタンのクリックイベントをテスト
            uiManager.elements.addListBtn.click();
            expect(handlers.addList).toHaveBeenCalled();

            uiManager.elements.backBtn.click();
            expect(handlers.back).toHaveBeenCalled();

            uiManager.elements.editBtn.click();
            expect(handlers.edit).toHaveBeenCalled();

            uiManager.elements.resetBtn.click();
            expect(handlers.reset).toHaveBeenCalled();

            uiManager.elements.cancelBtn.click();
            expect(handlers.cancel).toHaveBeenCalled();

            uiManager.elements.saveBtn.click();
            expect(handlers.save).toHaveBeenCalled();

            uiManager.elements.addItemBtn.click();
            expect(handlers.addItem).toHaveBeenCalled();
        });

        test('bindEvents()で一部のハンドラーが未定義でもエラーが発生しない', () => {
            const handlers = {
                addList: jest.fn()
                // 他のハンドラーは未定義
            };

            expect(() => uiManager.bindEvents(handlers)).not.toThrow();
            
            uiManager.elements.addListBtn.click();
            expect(handlers.addList).toHaveBeenCalled();
        });
    });

    describe('要素可視性制御', () => {
        test('setElementVisibility()で要素の可視性が制御される', () => {
            // 要素を非表示にする
            uiManager.setElementVisibility('listScreen', false);
            expect(uiManager.elements.listScreen.classList.contains('hidden')).toBe(true);

            // 要素を表示する
            uiManager.setElementVisibility('listScreen', true);
            expect(uiManager.elements.listScreen.classList.contains('hidden')).toBe(false);
        });

        test('setElementVisibility()で存在しない要素を指定してもエラーが発生しない', () => {
            expect(() => uiManager.setElementVisibility('nonExistent', true)).not.toThrow();
        });
    });

    describe('リスト名入力フィールドでのEnterキー処理', () => {
        test('bindEvents()でリスト名入力フィールドのEnterキーハンドラーが正しくバインドされる', () => {
            const handlers = {
                addList: jest.fn(),
                back: jest.fn(),
                edit: jest.fn(),
                reset: jest.fn(),
                cancel: jest.fn(),
                save: jest.fn(),
                addItem: jest.fn(),
                listNameEnter: jest.fn()
            };

            uiManager.bindEvents(handlers);

            // リスト名入力フィールドでEnterキーを押す
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            uiManager.elements.listNameInput.dispatchEvent(enterEvent);

            expect(handlers.listNameEnter).toHaveBeenCalled();
        });

        test('リスト名入力フィールドでEnter以外のキーを押してもハンドラーは呼ばれない', () => {
            const handlers = {
                listNameEnter: jest.fn()
            };

            uiManager.bindEvents(handlers);

            // Tab キーを押す
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
            uiManager.elements.listNameInput.dispatchEvent(tabEvent);

            expect(handlers.listNameEnter).not.toHaveBeenCalled();
        });

        test('リスト名入力フィールドでのEnterキーハンドラーが未定義でもエラーが発生しない', () => {
            const handlers = {
                addList: jest.fn()
                // listNameEnterは未定義
            };

            expect(() => uiManager.bindEvents(handlers)).not.toThrow();

            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            expect(() => uiManager.elements.listNameInput.dispatchEvent(enterEvent)).not.toThrow();
        });
    });
});