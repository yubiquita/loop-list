const ChecklistApp = require('../src/ChecklistApp.js');

describe('ChecklistApp', () => {
    let app;

    beforeEach(() => {
        // 新しいインスタンスを作成する前にlocalStorageモックを適切に設定
        global.localStorageMock.getItem.mockReturnValue(null);
        global.localStorageMock.setItem.mockClear();
        
        app = new ChecklistApp();
    });

    describe('初期化', () => {
        test('コンストラクタで正しく初期化される', () => {
            expect(app.dataManager).toBeDefined();
            expect(app.uiManager).toBeDefined();
            expect(app.listManager).toBeDefined();
            expect(app.itemManager).toBeDefined();
            
            expect(app.currentListId).toBeNull();
            expect(app.isEditing).toBe(false);
            expect(app.editingData).toBeNull();
        });

        test('各管理クラスが正しく依存関係を持つ', () => {
            expect(app.listManager.dataManager).toBe(app.dataManager);
            expect(app.listManager.uiManager).toBe(app.uiManager);
            expect(app.itemManager.dataManager).toBe(app.dataManager);
            expect(app.itemManager.uiManager).toBe(app.uiManager);
        });
    });

    describe('画面遷移機能', () => {
        beforeEach(() => {
            // テスト用のリストデータを設定
            const testLists = [
                {
                    id: 'test-id',
                    name: 'テストリスト',
                    items: [
                        { id: 'item-1', text: 'アイテム1', checked: false },
                        { id: 'item-2', text: 'アイテム2', checked: true }
                    ],
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-01T00:00:00.000Z'
                }
            ];
            app.listManager.setLists(testLists);
        });

        test('showListScreen()でリスト画面が表示される', () => {
            app.currentListId = 'test-id';
            
            app.showListScreen();
            
            expect(app.uiManager.getCurrentScreen()).toBe('listScreen');
            expect(app.currentListId).toBeNull();
        });

        test('showDetailScreen()で詳細画面が表示される', () => {
            jest.spyOn(app.itemManager, 'renderItems').mockImplementation(() => {});
            jest.spyOn(app, 'updateProgress').mockImplementation(() => {});
            
            app.showDetailScreen('test-id');
            
            expect(app.uiManager.getCurrentScreen()).toBe('detailScreen');
            expect(app.currentListId).toBe('test-id');
            expect(app.itemManager.renderItems).toHaveBeenCalled();
            expect(app.updateProgress).toHaveBeenCalled();
        });

        test('showDetailScreen()で存在しないIDの場合アラートが表示される', () => {
            jest.spyOn(app.uiManager, 'showAlert').mockImplementation(() => {});
            
            app.showDetailScreen('non-existent');
            
            expect(app.uiManager.showAlert).toHaveBeenCalledWith('リストが見つかりません');
        });

        test('showEditScreen()で編集画面が表示される（新規作成）', () => {
            jest.spyOn(app, 'renderEditItems').mockImplementation(() => {});
            
            app.showEditScreen();
            
            expect(app.uiManager.getCurrentScreen()).toBe('editScreen');
            expect(app.isEditing).toBe(false);
            expect(app.editingData).toBeDefined();
            expect(app.editingData.name).toBe('');
            expect(app.renderEditItems).toHaveBeenCalled();
        });

        test('showEditScreen()で編集画面が表示される（編集モード）', () => {
            jest.spyOn(app, 'renderEditItems').mockImplementation(() => {});
            
            app.showEditScreen('test-id');
            
            expect(app.uiManager.getCurrentScreen()).toBe('editScreen');
            expect(app.isEditing).toBe(true);
            expect(app.editingData.name).toBe('テストリスト');
            expect(app.renderEditItems).toHaveBeenCalled();
        });

        test('showEditScreen()で存在しないIDの場合アラートが表示される', () => {
            jest.spyOn(app.uiManager, 'showAlert').mockImplementation(() => {});
            
            app.showEditScreen('non-existent');
            
            expect(app.uiManager.showAlert).toHaveBeenCalledWith('リストが見つかりません');
        });
    });

    describe('編集機能', () => {
        test('addEditItem()で編集項目が追加される', () => {
            app.editingData = { items: [] };
            jest.spyOn(app.itemManager, 'addEmptyItem').mockImplementation((items) => {
                items.push({ id: 'new-id', text: '', checked: false });
                return items;
            });
            jest.spyOn(app, 'renderEditItems').mockImplementation(() => {});
            
            app.addEditItem();
            
            expect(app.itemManager.addEmptyItem).toHaveBeenCalledWith(app.editingData.items);
            expect(app.renderEditItems).toHaveBeenCalled();
        });

        test('cancelEdit()で編集がキャンセルされる（詳細画面から）', () => {
            app.currentListId = 'test-id';
            jest.spyOn(app, 'showDetailScreen').mockImplementation(() => {});
            
            app.cancelEdit();
            
            expect(app.showDetailScreen).toHaveBeenCalledWith('test-id');
        });

        test('cancelEdit()で編集がキャンセルされる（リスト画面から）', () => {
            app.currentListId = null;
            jest.spyOn(app, 'showListScreen').mockImplementation(() => {});
            
            app.cancelEdit();
            
            expect(app.showListScreen).toHaveBeenCalled();
        });
    });

    describe('リスト保存機能', () => {
        beforeEach(() => {
            app.editingData = {
                id: 'test-id',
                name: 'テストリスト',
                items: [
                    { id: 'item-1', text: 'アイテム1', checked: false },
                    { id: 'item-2', text: '', checked: false } // 空の項目
                ]
            };
        });

        test('saveList()で新規リストが保存される', () => {
            app.isEditing = false;
            jest.spyOn(app.uiManager, 'getListNameInput').mockReturnValue('新しいリスト');
            jest.spyOn(app.dataManager, 'validateListName').mockReturnValue(true);
            jest.spyOn(app.itemManager, 'removeEmptyItems').mockReturnValue([
                { id: 'item-1', text: 'アイテム1', checked: false }
            ]);
            jest.spyOn(app.listManager, 'createList').mockReturnValue({
                id: 'new-id',
                name: '新しいリスト',
                items: [{ id: 'item-1', text: 'アイテム1', checked: false }]
            });
            jest.spyOn(app.listManager, 'renderLists').mockImplementation(() => {});
            jest.spyOn(app, 'showListScreen').mockImplementation(() => {});
            
            app.saveList();
            
            expect(app.listManager.createList).toHaveBeenCalled();
            expect(app.listManager.renderLists).toHaveBeenCalled();
            expect(app.showListScreen).toHaveBeenCalled();
        });

        test('saveList()で既存リストが更新される', () => {
            app.isEditing = true;
            jest.spyOn(app.uiManager, 'getListNameInput').mockReturnValue('更新されたリスト');
            jest.spyOn(app.dataManager, 'validateListName').mockReturnValue(true);
            jest.spyOn(app.itemManager, 'removeEmptyItems').mockReturnValue([
                { id: 'item-1', text: 'アイテム1', checked: false }
            ]);
            jest.spyOn(app.listManager, 'updateList').mockReturnValue({
                id: 'test-id',
                name: '更新されたリスト',
                items: [{ id: 'item-1', text: 'アイテム1', checked: false }]
            });
            jest.spyOn(app.listManager, 'renderLists').mockImplementation(() => {});
            jest.spyOn(app, 'showDetailScreen').mockImplementation(() => {});
            
            app.saveList();
            
            expect(app.listManager.updateList).toHaveBeenCalled();
            expect(app.listManager.renderLists).toHaveBeenCalled();
            expect(app.showDetailScreen).toHaveBeenCalledWith('test-id');
        });

        test('saveList()でリスト名が無効な場合アラートが表示される', () => {
            jest.spyOn(app.uiManager, 'getListNameInput').mockReturnValue('');
            jest.spyOn(app.dataManager, 'validateListName').mockReturnValue(false);
            jest.spyOn(app.uiManager, 'showAlert').mockImplementation(() => {});
            
            app.saveList();
            
            expect(app.uiManager.showAlert).toHaveBeenCalledWith('リスト名を入力してください');
        });

        test('saveList()でエラーが発生した場合適切に処理される', () => {
            jest.spyOn(app.uiManager, 'getListNameInput').mockReturnValue('テストリスト');
            jest.spyOn(app.dataManager, 'validateListName').mockReturnValue(true);
            jest.spyOn(app.itemManager, 'removeEmptyItems').mockImplementation(() => {
                throw new Error('テストエラー');
            });
            jest.spyOn(app.uiManager, 'showAlert').mockImplementation(() => {});
            
            app.saveList();
            
            expect(app.uiManager.showAlert).toHaveBeenCalledWith('テストエラー');
        });
    });

    describe('リスト削除機能', () => {
        beforeEach(() => {
            const testLists = [
                { id: 'test-id', name: 'テストリスト', items: [] }
            ];
            app.listManager.setLists(testLists);
        });

        test('deleteList()でリストが削除される', () => {
            jest.spyOn(app.uiManager, 'showConfirm').mockReturnValue(true);
            jest.spyOn(app.listManager, 'deleteList').mockReturnValue(true);
            jest.spyOn(app.listManager, 'renderLists').mockImplementation(() => {});
            
            app.deleteList('test-id');
            
            expect(app.uiManager.showConfirm).toHaveBeenCalledWith('このリストを削除しますか？');
            expect(app.listManager.deleteList).toHaveBeenCalledWith('test-id');
            expect(app.listManager.renderLists).toHaveBeenCalled();
        });

        test('deleteList()で現在表示中のリストが削除された場合リスト画面に戻る', () => {
            app.currentListId = 'test-id';
            jest.spyOn(app.uiManager, 'showConfirm').mockReturnValue(true);
            jest.spyOn(app.listManager, 'deleteList').mockReturnValue(true);
            jest.spyOn(app.listManager, 'renderLists').mockImplementation(() => {});
            jest.spyOn(app, 'showListScreen').mockImplementation(() => {});
            
            app.deleteList('test-id');
            
            expect(app.showListScreen).toHaveBeenCalled();
        });

        test('deleteList()で確認ダイアログでキャンセルした場合削除されない', () => {
            jest.spyOn(app.uiManager, 'showConfirm').mockReturnValue(false);
            jest.spyOn(app.listManager, 'deleteList').mockImplementation(() => {});
            
            app.deleteList('test-id');
            
            expect(app.listManager.deleteList).not.toHaveBeenCalled();
        });
    });

    describe('リセット機能', () => {
        beforeEach(() => {
            const testLists = [
                {
                    id: 'test-id',
                    name: 'テストリスト',
                    items: [
                        { id: 'item-1', text: 'アイテム1', checked: true },
                        { id: 'item-2', text: 'アイテム2', checked: true }
                    ]
                }
            ];
            app.listManager.setLists(testLists);
            app.currentListId = 'test-id';
        });

        test('resetList()でリストがリセットされる', () => {
            jest.spyOn(app.uiManager, 'showConfirm').mockReturnValue(true);
            jest.spyOn(app.itemManager, 'resetAllItems').mockImplementation((items) => {
                items.forEach(item => item.checked = false);
                return items;
            });
            jest.spyOn(app.itemManager, 'renderItems').mockImplementation(() => {});
            jest.spyOn(app, 'updateProgress').mockImplementation(() => {});
            jest.spyOn(app.dataManager, 'saveData').mockImplementation(() => {});
            
            app.resetList();
            
            expect(app.uiManager.showConfirm).toHaveBeenCalledWith('このリストをリセットしますか？');
            expect(app.itemManager.resetAllItems).toHaveBeenCalled();
            expect(app.itemManager.renderItems).toHaveBeenCalled();
            expect(app.updateProgress).toHaveBeenCalled();
            expect(app.dataManager.saveData).toHaveBeenCalled();
        });

        test('resetList()でcurrentListIdがない場合何もしない', () => {
            app.currentListId = null;
            jest.spyOn(app.uiManager, 'showConfirm').mockImplementation(() => {});
            
            app.resetList();
            
            expect(app.uiManager.showConfirm).not.toHaveBeenCalled();
        });
    });

    describe('プログレス更新機能', () => {
        test('updateProgress()でプログレスバーが更新される', () => {
            const list = {
                items: [
                    { checked: true },
                    { checked: false },
                    { checked: true }
                ]
            };
            jest.spyOn(app.listManager, 'calculateProgress').mockReturnValue({
                checkedCount: 2,
                totalCount: 3,
                percentage: 66.67
            });
            jest.spyOn(app.uiManager, 'updateProgress').mockImplementation(() => {});
            
            app.updateProgress(list);
            
            expect(app.listManager.calculateProgress).toHaveBeenCalledWith(list);
            expect(app.uiManager.updateProgress).toHaveBeenCalledWith(2, 3);
        });

        test('onItemChanged()で項目変更時の処理が実行される', () => {
            const list = { items: [] };
            jest.spyOn(app, 'updateProgress').mockImplementation(() => {});
            jest.spyOn(app.dataManager, 'saveData').mockImplementation(() => {});
            jest.spyOn(app.listManager, 'getLists').mockReturnValue([]);
            
            app.onItemChanged(list);
            
            expect(app.updateProgress).toHaveBeenCalledWith(list);
            expect(app.dataManager.saveData).toHaveBeenCalled();
        });
    });

    describe('統計・状態取得機能', () => {
        test('getStatistics()で統計情報が取得される', () => {
            const mockStats = {
                totalLists: 2,
                totalItems: 5,
                totalCheckedItems: 3,
                completedLists: 1,
                averageProgress: 60
            };
            jest.spyOn(app.listManager, 'getStatistics').mockReturnValue(mockStats);
            
            const result = app.getStatistics();
            
            expect(result).toBe(mockStats);
            expect(app.listManager.getStatistics).toHaveBeenCalled();
        });

        test('getAppState()でアプリケーション状態が取得される', () => {
            app.currentListId = 'test-id';
            app.isEditing = true;
            jest.spyOn(app.uiManager, 'getCurrentScreen').mockReturnValue('editScreen');
            jest.spyOn(app.listManager, 'getLists').mockReturnValue([{}, {}]);
            
            const result = app.getAppState();
            
            expect(result).toEqual({
                currentListId: 'test-id',
                isEditing: true,
                currentScreen: 'editScreen',
                listsCount: 2
            });
        });

        test('getDebugInfo()でデバッグ情報が取得される', () => {
            const mockAppState = { currentListId: 'test' };
            const mockStats = { totalLists: 1 };
            const mockLists = [{ id: 'test', name: 'Test', items: [] }];
            
            jest.spyOn(app, 'getAppState').mockReturnValue(mockAppState);
            jest.spyOn(app, 'getStatistics').mockReturnValue(mockStats);
            jest.spyOn(app.listManager, 'getLists').mockReturnValue(mockLists);
            jest.spyOn(app.listManager, 'calculateProgress').mockReturnValue({
                checkedCount: 0,
                totalCount: 0,
                percentage: 0
            });
            
            const result = app.getDebugInfo();
            
            expect(result).toHaveProperty('state', mockAppState);
            expect(result).toHaveProperty('statistics', mockStats);
            expect(result).toHaveProperty('lists');
            expect(result.lists).toHaveLength(1);
        });
    });

    describe('データ管理機能', () => {
        test('exportData()でデータがエクスポートされる', () => {
            const mockLists = [{ id: 'test', name: 'Test', items: [] }];
            jest.spyOn(app.listManager, 'getLists').mockReturnValue(mockLists);
            
            const result = app.exportData();
            const data = JSON.parse(result);
            
            expect(data).toHaveProperty('lists', mockLists);
            expect(data).toHaveProperty('exportedAt');
            expect(data).toHaveProperty('version', '1.0');
            expect(new Date(data.exportedAt)).toBeInstanceOf(Date);
        });

        test('importData()で有効なデータがインポートされる', () => {
            const importData = {
                lists: [
                    {
                        id: 'test-id',
                        name: 'インポートリスト',
                        items: [
                            { id: 'item-1', text: 'アイテム1', checked: false }
                        ]
                    }
                ],
                version: '1.0'
            };
            
            jest.spyOn(app.itemManager, 'validateItem').mockReturnValue(true);
            jest.spyOn(app.listManager, 'setLists').mockImplementation(() => {});
            jest.spyOn(app.dataManager, 'saveData').mockImplementation(() => {});
            jest.spyOn(app.listManager, 'renderLists').mockImplementation(() => {});
            jest.spyOn(app, 'showListScreen').mockImplementation(() => {});
            
            const result = app.importData(JSON.stringify(importData));
            
            expect(result).toBe(true);
            expect(app.listManager.setLists).toHaveBeenCalledWith(importData.lists);
            expect(app.dataManager.saveData).toHaveBeenCalledWith(importData.lists);
            expect(app.listManager.renderLists).toHaveBeenCalled();
            expect(app.showListScreen).toHaveBeenCalled();
        });

        test('importData()で無効なJSONの場合falseが返される', () => {
            jest.spyOn(app.uiManager, 'showAlert').mockImplementation(() => {});
            
            const result = app.importData('invalid json');
            
            expect(result).toBe(false);
            expect(app.uiManager.showAlert).toHaveBeenCalled();
        });

        test('importData()で無効なデータ形式の場合falseが返される', () => {
            const invalidData = { notLists: [] };
            jest.spyOn(app.uiManager, 'showAlert').mockImplementation(() => {});
            
            const result = app.importData(JSON.stringify(invalidData));
            
            expect(result).toBe(false);
            expect(app.uiManager.showAlert).toHaveBeenCalledWith(
                expect.stringContaining('無効なデータ形式です')
            );
        });
    });
});