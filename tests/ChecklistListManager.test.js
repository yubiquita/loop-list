const ChecklistListManager = require('../src/ChecklistListManager.js');

describe('ChecklistListManager', () => {
    let listManager;
    let mockDataManager;
    let mockUIManager;

    beforeEach(() => {
        // DataManagerのモック作成
        mockDataManager = {
            validateListName: jest.fn(),
            filterValidItems: jest.fn(),
            createListData: jest.fn(),
            saveData: jest.fn()
        };

        // UIManagerのモック作成
        mockUIManager = {
            clearListContainer: jest.fn(),
            appendToListContainer: jest.fn(),
            showConfirm: jest.fn()
        };

        listManager = new ChecklistListManager(mockDataManager, mockUIManager);
    });

    describe('初期化', () => {
        test('コンストラクタで正しく初期化される', () => {
            expect(listManager.dataManager).toBe(mockDataManager);
            expect(listManager.uiManager).toBe(mockUIManager);
            expect(listManager.lists).toEqual([]);
        });
    });

    describe('リストデータ操作', () => {
        test('setLists()でリストが設定される', () => {
            const testLists = [
                { id: '1', name: 'リスト1', items: [] },
                { id: '2', name: 'リスト2', items: [] }
            ];
            
            listManager.setLists(testLists);
            
            expect(listManager.lists).toBe(testLists);
        });

        test('getLists()でリストが取得される', () => {
            const testLists = [
                { id: '1', name: 'リスト1', items: [] }
            ];
            listManager.lists = testLists;
            
            expect(listManager.getLists()).toBe(testLists);
        });

        test('getListById()で指定IDのリストが取得される', () => {
            const testLists = [
                { id: '1', name: 'リスト1', items: [] },
                { id: '2', name: 'リスト2', items: [] }
            ];
            listManager.lists = testLists;
            
            const result = listManager.getListById('2');
            expect(result).toBe(testLists[1]);
        });

        test('getListById()で存在しないIDの場合nullが返される', () => {
            const testLists = [
                { id: '1', name: 'リスト1', items: [] }
            ];
            listManager.lists = testLists;
            
            const result = listManager.getListById('999');
            expect(result).toBeNull();
        });
    });

    describe('リスト作成機能', () => {
        test('createList()で新しいリストが作成される', () => {
            const name = 'テストリスト';
            const items = [{ id: 'item1', text: 'アイテム1', checked: false }];
            const newListData = { id: 'new-id', name: name, items: items };

            mockDataManager.validateListName.mockReturnValue(true);
            mockDataManager.filterValidItems.mockReturnValue(items);
            mockDataManager.createListData.mockReturnValue(newListData);

            const result = listManager.createList(name, items);

            expect(mockDataManager.validateListName).toHaveBeenCalledWith(name);
            expect(mockDataManager.filterValidItems).toHaveBeenCalledWith(items);
            expect(mockDataManager.createListData).toHaveBeenCalledWith(name, items);
            expect(mockDataManager.saveData).toHaveBeenCalledWith([newListData]);
            expect(result).toBe(newListData);
            expect(listManager.lists).toContain(newListData);
        });

        test('createList()で無効なリスト名の場合エラーが投げられる', () => {
            mockDataManager.validateListName.mockReturnValue(false);

            expect(() => listManager.createList('')).toThrow('リスト名を入力してください');
            expect(mockDataManager.saveData).not.toHaveBeenCalled();
        });
    });

    describe('リスト更新機能', () => {
        beforeEach(() => {
            listManager.lists = [
                {
                    id: 'test-id',
                    name: '元のリスト',
                    items: [],
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-01T00:00:00.000Z'
                }
            ];
        });

        test('updateList()で既存のリストが更新される', () => {
            const newName = '更新されたリスト';
            const newItems = [{ id: 'item1', text: 'アイテム1', checked: false }];

            mockDataManager.validateListName.mockReturnValue(true);
            mockDataManager.filterValidItems.mockReturnValue(newItems);

            const result = listManager.updateList('test-id', newName, newItems);

            expect(mockDataManager.validateListName).toHaveBeenCalledWith(newName);
            expect(mockDataManager.filterValidItems).toHaveBeenCalledWith(newItems);
            expect(result.name).toBe(newName);
            expect(result.items).toBe(newItems);
            expect(result.updatedAt).not.toBe('2023-01-01T00:00:00.000Z');
            expect(mockDataManager.saveData).toHaveBeenCalled();
        });

        test('updateList()で存在しないIDの場合nullが返される', () => {
            mockDataManager.validateListName.mockReturnValue(true);

            const result = listManager.updateList('non-existent', 'テスト');

            expect(result).toBeNull();
            expect(mockDataManager.saveData).not.toHaveBeenCalled();
        });

        test('updateList()で無効なリスト名の場合エラーが投げられる', () => {
            mockDataManager.validateListName.mockReturnValue(false);

            expect(() => listManager.updateList('test-id', '')).toThrow('リスト名を入力してください');
            expect(mockDataManager.saveData).not.toHaveBeenCalled();
        });
    });

    describe('リスト削除機能', () => {
        beforeEach(() => {
            listManager.lists = [
                { id: '1', name: 'リスト1', items: [] },
                { id: '2', name: 'リスト2', items: [] }
            ];
        });

        test('deleteList()で指定されたリストが削除される', () => {
            const result = listManager.deleteList('1');

            expect(result).toBe(true);
            expect(listManager.lists).toHaveLength(1);
            expect(listManager.lists[0].id).toBe('2');
            expect(mockDataManager.saveData).toHaveBeenCalledWith(listManager.lists);
        });

        test('deleteList()で存在しないIDの場合falseが返される', () => {
            const result = listManager.deleteList('999');

            expect(result).toBe(false);
            expect(listManager.lists).toHaveLength(2);
            expect(mockDataManager.saveData).not.toHaveBeenCalled();
        });
    });

    describe('進捗計算機能', () => {
        test('calculateProgress()で正しい進捗が計算される', () => {
            const list = {
                items: [
                    { checked: true },
                    { checked: false },
                    { checked: true },
                    { checked: false }
                ]
            };

            const result = listManager.calculateProgress(list);

            expect(result).toEqual({
                checkedCount: 2,
                totalCount: 4,
                percentage: 50
            });
        });

        test('calculateProgress()で項目が0個の場合', () => {
            const list = { items: [] };

            const result = listManager.calculateProgress(list);

            expect(result).toEqual({
                checkedCount: 0,
                totalCount: 0,
                percentage: 0
            });
        });

        test('calculateProgress()で全項目完了の場合', () => {
            const list = {
                items: [
                    { checked: true },
                    { checked: true }
                ]
            };

            const result = listManager.calculateProgress(list);

            expect(result).toEqual({
                checkedCount: 2,
                totalCount: 2,
                percentage: 100
            });
        });
    });

    describe('リスト描画機能', () => {
        test('renderLists()でリスト一覧が描画される', () => {
            const testLists = [
                { id: '1', name: 'リスト1', items: [{ checked: true }, { checked: false }] },
                { id: '2', name: 'リスト2', items: [] }
            ];
            listManager.lists = testLists;

            // createListElementをモック化
            jest.spyOn(listManager, 'createListElement').mockImplementation(() => {
                return document.createElement('div');
            });

            listManager.renderLists();

            expect(mockUIManager.clearListContainer).toHaveBeenCalled();
            expect(listManager.createListElement).toHaveBeenCalledTimes(2);
            expect(mockUIManager.appendToListContainer).toHaveBeenCalledTimes(2);
        });
    });

    describe('リスト要素作成機能', () => {
        test('createListElement()で正しいリスト要素が作成される', () => {
            const list = {
                id: 'test-id',
                name: 'テストリスト',
                items: [
                    { checked: true },
                    { checked: false }
                ]
            };

            const element = listManager.createListElement(list);

            expect(element.className).toBe('list-item');
            expect(element.querySelector('h3').textContent).toBe('テストリスト');
            expect(element.querySelector('p').textContent).toBe('1/2 完了');
            expect(element.querySelector('.delete-btn')).toBeTruthy();
        });

        test('createListElement()でHTMLエスケープが適用される', () => {
            const list = {
                id: 'test-id',
                name: '<script>alert("xss")</script>',
                items: []
            };

            const element = listManager.createListElement(list);

            expect(element.querySelector('h3').textContent).toBe('<script>alert("xss")</script>');
            expect(element.innerHTML).not.toContain('<script>');
        });
    });

    describe('検索・フィルタリング機能', () => {
        beforeEach(() => {
            listManager.lists = [
                { id: '1', name: 'ショッピングリスト', items: [{ checked: true }, { checked: false }] },
                { id: '2', name: 'TODOリスト', items: [{ checked: true }, { checked: true }] },
                { id: '3', name: '買い物メモ', items: [] }
            ];
        });

        test('searchLists()でリスト名による検索ができる', () => {
            const result = listManager.searchLists('リスト');
            
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('ショッピングリスト');
            expect(result[1].name).toBe('TODOリスト');
        });

        test('searchLists()で大文字小文字を区別しない検索ができる', () => {
            const result = listManager.searchLists('todo');
            
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('TODOリスト');
        });

        test('searchLists()で空のクエリの場合全リストが返される', () => {
            const result = listManager.searchLists('');
            
            expect(result).toHaveLength(3);
        });

        test('filterByProgress()で完了率によるフィルタリングができる', () => {
            const result = listManager.filterByProgress(50, 100);
            
            expect(result).toHaveLength(2); // 50%と100%のリスト
        });

        test('filterByProgress()で完了リストのみフィルタリングできる', () => {
            const result = listManager.filterByProgress(100, 100);
            
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('TODOリスト');
        });
    });

    describe('ソート機能', () => {
        beforeEach(() => {
            listManager.lists = [
                { id: '1', name: 'C リスト', createdAt: '2023-01-03T00:00:00.000Z', updatedAt: '2023-01-05T00:00:00.000Z' },
                { id: '2', name: 'A リスト', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-03T00:00:00.000Z' },
                { id: '3', name: 'B リスト', createdAt: '2023-01-02T00:00:00.000Z', updatedAt: '2023-01-04T00:00:00.000Z' }
            ];
        });

        test('sortByName()で名前の昇順ソートができる', () => {
            const result = listManager.sortByName(true);
            
            expect(result[0].name).toBe('A リスト');
            expect(result[1].name).toBe('B リスト');
            expect(result[2].name).toBe('C リスト');
        });

        test('sortByName()で名前の降順ソートができる', () => {
            const result = listManager.sortByName(false);
            
            expect(result[0].name).toBe('C リスト');
            expect(result[1].name).toBe('B リスト');
            expect(result[2].name).toBe('A リスト');
        });

        test('sortByCreatedAt()で作成日時の昇順ソートができる', () => {
            const result = listManager.sortByCreatedAt(true);
            
            expect(result[0].name).toBe('A リスト');
            expect(result[1].name).toBe('B リスト');
            expect(result[2].name).toBe('C リスト');
        });

        test('sortByUpdatedAt()で更新日時の降順ソートができる', () => {
            const result = listManager.sortByUpdatedAt(false);
            
            expect(result[0].name).toBe('C リスト');
            expect(result[1].name).toBe('B リスト');
            expect(result[2].name).toBe('A リスト');
        });
    });

    describe('統計機能', () => {
        test('getStatistics()で正しい統計情報が計算される', () => {
            listManager.lists = [
                { id: '1', name: 'リスト1', items: [{ checked: true }, { checked: false }] },
                { id: '2', name: 'リスト2', items: [{ checked: true }, { checked: true }] },
                { id: '3', name: 'リスト3', items: [] }
            ];

            const result = listManager.getStatistics();

            expect(result).toEqual({
                totalLists: 3,
                totalItems: 4,
                totalCheckedItems: 3,
                completedLists: 1, // リスト2のみ完了（リスト3は項目が0個なので除外）
                averageProgress: 75 // 3/4 * 100
            });
        });

        test('getStatistics()でリストが空の場合', () => {
            listManager.lists = [];

            const result = listManager.getStatistics();

            expect(result).toEqual({
                totalLists: 0,
                totalItems: 0,
                totalCheckedItems: 0,
                completedLists: 0,
                averageProgress: 0
            });
        });
    });

    describe('HTMLエスケープ機能', () => {
        test('escapeHtml()でHTMLが正しくエスケープされる', () => {
            const input = '<script>alert("xss")</script>';
            const result = listManager.escapeHtml(input);
            
            expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
        });

        test('escapeHtml()で通常のテキストはそのまま返される', () => {
            const input = 'Hello World';
            const result = listManager.escapeHtml(input);
            
            expect(result).toBe('Hello World');
        });
    });

    describe('イベント処理', () => {
        test('onDeleteClick()で確認ダイアログが表示され削除が実行される', () => {
            listManager.lists = [
                { id: '1', name: 'リスト1', items: [] },
                { id: '2', name: 'リスト2', items: [] }
            ];
            
            mockUIManager.showConfirm.mockReturnValue(true);
            jest.spyOn(listManager, 'renderLists').mockImplementation(() => {});

            listManager.onDeleteClick('1');

            expect(mockUIManager.showConfirm).toHaveBeenCalledWith('このリストを削除しますか？');
            expect(listManager.lists).toHaveLength(1);
            expect(listManager.renderLists).toHaveBeenCalled();
        });

        test('onDeleteClick()で確認ダイアログでキャンセルした場合削除されない', () => {
            listManager.lists = [
                { id: '1', name: 'リスト1', items: [] }
            ];
            
            mockUIManager.showConfirm.mockReturnValue(false);
            jest.spyOn(listManager, 'renderLists').mockImplementation(() => {});

            listManager.onDeleteClick('1');

            expect(mockUIManager.showConfirm).toHaveBeenCalledWith('このリストを削除しますか？');
            expect(listManager.lists).toHaveLength(1);
            expect(listManager.renderLists).not.toHaveBeenCalled();
        });
    });
});