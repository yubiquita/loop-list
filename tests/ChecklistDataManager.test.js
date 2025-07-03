const ChecklistDataManager = require('../src/ChecklistDataManager.js');

describe('ChecklistDataManager', () => {
    let dataManager;

    beforeEach(() => {
        // 新しいインスタンスを作成する前にlocalStorageモックを適切に設定
        global.localStorageMock.getItem.mockReturnValue(null);
        global.localStorageMock.setItem.mockClear();
        
        dataManager = new ChecklistDataManager();
        // getStorageメソッドをモックして、モックオブジェクトを返すようにする
        jest.spyOn(dataManager, 'getStorage').mockReturnValue(global.localStorageMock);
    });

    describe('ID生成機能', () => {
        test('generateId()で一意のIDが生成される', () => {
            const id1 = dataManager.generateId();
            const id2 = dataManager.generateId();
            
            expect(id1).toBeTruthy();
            expect(id2).toBeTruthy();
            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(typeof id2).toBe('string');
        });
    });

    describe('データ読み込み機能', () => {
        test('localStorageが空の場合、空の配列を返す', () => {
            global.localStorageMock.getItem.mockReturnValue(null);
            
            const result = dataManager.loadData();
            
            expect(result).toEqual([]);
            expect(global.localStorageMock.getItem).toHaveBeenCalledWith('checklists');
        });

        test('localStorageに正常なデータがある場合、そのデータを返す', () => {
            const mockData = [
                {
                    id: 'test-id',
                    name: 'テストリスト',
                    items: [
                        { id: 'item-1', text: 'アイテム1', checked: false }
                    ]
                }
            ];
            
            global.localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
            
            const result = dataManager.loadData();
            
            expect(result).toEqual(mockData);
            expect(global.localStorageMock.getItem).toHaveBeenCalledWith('checklists');
        });

        test('localStorageに不正なJSONがある場合、空の配列を返す', () => {
            global.localStorageMock.getItem.mockReturnValue('不正なJSON');
            
            const result = dataManager.loadData();
            
            expect(result).toEqual([]);
        });
    });

    describe('データ保存機能', () => {
        test('saveData()でlocalStorageにデータが保存される', () => {
            const testData = [
                {
                    id: 'test-id',
                    name: 'テストリスト',
                    items: []
                }
            ];
            
            dataManager.saveData(testData);
            
            expect(global.localStorageMock.setItem).toHaveBeenCalledWith(
                'checklists',
                JSON.stringify(testData)
            );
        });

        test('saveData()でlocalStorageエラーが発生しても例外を投げない', () => {
            global.localStorageMock.setItem.mockImplementation(() => {
                throw new Error('localStorage error');
            });
            
            const testData = [{ id: 'test-id', name: 'テストリスト', items: [] }];
            
            expect(() => dataManager.saveData(testData)).not.toThrow();
        });
    });

    describe('データ構造作成機能', () => {
        test('createListData()で正しいリストデータが作成される', () => {
            const name = 'テストリスト';
            const items = [{ id: 'item-1', text: 'アイテム1', checked: false }];
            
            const result = dataManager.createListData(name, items);
            
            expect(result).toEqual({
                id: expect.any(String),
                name: name,
                items: items,
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });
            
            // 日付が正しいISO形式かチェック
            expect(new Date(result.createdAt)).toBeInstanceOf(Date);
            expect(new Date(result.updatedAt)).toBeInstanceOf(Date);
        });

        test('createListData()で項目が指定されない場合、空配列になる', () => {
            const name = 'テストリスト';
            
            const result = dataManager.createListData(name);
            
            expect(result.items).toEqual([]);
        });

        test('createItemData()で正しい項目データが作成される', () => {
            const text = 'テスト項目';
            const checked = true;
            
            const result = dataManager.createItemData(text, checked);
            
            expect(result).toEqual({
                id: expect.any(String),
                text: text,
                checked: checked
            });
        });

        test('createItemData()でチェック状態が指定されない場合、falseになる', () => {
            const text = 'テスト項目';
            
            const result = dataManager.createItemData(text);
            
            expect(result.checked).toBe(false);
        });
    });

    describe('バリデーション機能', () => {
        test('validateListName()で正しいリスト名がバリデーションされる', () => {
            expect(dataManager.validateListName('テストリスト')).toBe(true);
            expect(dataManager.validateListName('   テストリスト   ')).toBe(true);
            expect(dataManager.validateListName('')).toBe(false);
            expect(dataManager.validateListName('   ')).toBe(false);
            expect(dataManager.validateListName(null)).toBe(false);
            expect(dataManager.validateListName(undefined)).toBe(false);
            expect(dataManager.validateListName(123)).toBe(false);
        });

        test('validateItemText()で正しい項目テキストがバリデーションされる', () => {
            expect(dataManager.validateItemText('テスト項目')).toBe(true);
            expect(dataManager.validateItemText('   テスト項目   ')).toBe(true);
            expect(dataManager.validateItemText('')).toBe(false);
            expect(dataManager.validateItemText('   ')).toBe(false);
            expect(dataManager.validateItemText(null)).toBe(false);
            expect(dataManager.validateItemText(undefined)).toBe(false);
            expect(dataManager.validateItemText(123)).toBe(false);
        });

        test('filterValidItems()で無効な項目が除外される', () => {
            const items = [
                { id: '1', text: '有効な項目', checked: false },
                { id: '2', text: '', checked: false },
                { id: '3', text: '   ', checked: false },
                { id: '4', text: '別の有効な項目', checked: true }
            ];
            
            const result = dataManager.filterValidItems(items);
            
            expect(result).toHaveLength(2);
            expect(result[0].text).toBe('有効な項目');
            expect(result[1].text).toBe('別の有効な項目');
        });
    });

    describe('タイムスタンプ更新機能', () => {
        test('updateTimestamp()でupdatedAtが更新される', () => {
            const listData = {
                id: 'test-id',
                name: 'テストリスト',
                items: [],
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-01T00:00:00.000Z'
            };
            
            const result = dataManager.updateTimestamp(listData);
            
            expect(result.updatedAt).not.toBe(listData.updatedAt);
            expect(result.createdAt).toBe(listData.createdAt);
            expect(new Date(result.updatedAt)).toBeInstanceOf(Date);
            
            // 元のデータが変更されていないことを確認
            expect(listData.updatedAt).toBe('2023-01-01T00:00:00.000Z');
        });
    });
});