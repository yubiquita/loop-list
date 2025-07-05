const ChecklistItemManager = require('../src/ChecklistItemManager.js');

describe('ChecklistItemManager', () => {
    let itemManager;
    let mockDataManager;
    let mockUIManager;

    beforeEach(() => {
        // DataManagerのモック作成
        mockDataManager = {
            createItemData: jest.fn(),
            filterValidItems: jest.fn()
        };

        // UIManagerのモック作成
        mockUIManager = {
            clearItemList: jest.fn(),
            appendToItemList: jest.fn(),
            clearEditItems: jest.fn(),
            appendToEditItems: jest.fn()
        };

        itemManager = new ChecklistItemManager(mockDataManager, mockUIManager);
    });

    describe('初期化', () => {
        test('コンストラクタで正しく初期化される', () => {
            expect(itemManager.dataManager).toBe(mockDataManager);
            expect(itemManager.uiManager).toBe(mockUIManager);
        });
    });

    describe('項目描画機能', () => {
        test('renderItems()で項目リストが描画される', () => {
            const list = {
                items: [
                    { id: '1', text: 'アイテム1', checked: false },
                    { id: '2', text: 'アイテム2', checked: true }
                ]
            };
            const onItemChange = jest.fn();

            jest.spyOn(itemManager, 'createItemElement').mockImplementation(() => {
                return document.createElement('div');
            });

            itemManager.renderItems(list, onItemChange);

            expect(mockUIManager.clearItemList).toHaveBeenCalled();
            expect(itemManager.createItemElement).toHaveBeenCalledTimes(2);
            expect(mockUIManager.appendToItemList).toHaveBeenCalledTimes(2);
        });

        test('createItemElement()で正しい項目要素が作成される', () => {
            const item = { id: 'test-id', text: 'テスト項目', checked: false };
            const onItemChange = jest.fn();

            const element = itemManager.createItemElement(item, onItemChange);

            expect(element.className).toBe('check-item');
            expect(element.querySelector('input').id).toBe('item-test-id');
            expect(element.querySelector('label').textContent).toBe('テスト項目');
            expect(element.querySelector('input').checked).toBe(false);
        });

        test('createItemElement()でチェック済み項目の要素が作成される', () => {
            const item = { id: 'test-id', text: 'テスト項目', checked: true };
            const onItemChange = jest.fn();

            const element = itemManager.createItemElement(item, onItemChange);

            expect(element.className).toBe('check-item checked');
            expect(element.querySelector('input').checked).toBe(true);
        });

        test('createItemElement()でチェックボックス変更時にコールバックが呼ばれる', () => {
            const item = { id: 'test-id', text: 'テスト項目', checked: false };
            const onItemChange = jest.fn();

            const element = itemManager.createItemElement(item, onItemChange);
            const checkbox = element.querySelector('input');

            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));

            expect(item.checked).toBe(true);
            expect(element.classList.contains('checked')).toBe(true);
            expect(onItemChange).toHaveBeenCalledWith(item);
        });
    });

    describe('編集項目描画機能', () => {
        test('renderEditItems()で編集項目リストが描画される', () => {
            const items = [
                { id: '1', text: 'アイテム1', checked: false },
                { id: '2', text: 'アイテム2', checked: true }
            ];
            const onItemTextChange = jest.fn();
            const onItemRemove = jest.fn();

            jest.spyOn(itemManager, 'createEditItemElement').mockImplementation(() => {
                return document.createElement('div');
            });

            itemManager.renderEditItems(items, onItemTextChange, onItemRemove);

            expect(mockUIManager.clearEditItems).toHaveBeenCalled();
            expect(itemManager.createEditItemElement).toHaveBeenCalledTimes(2);
            expect(mockUIManager.appendToEditItems).toHaveBeenCalledTimes(2);
        });

        test('createEditItemElement()で正しい編集項目要素が作成される', () => {
            const item = { id: 'test-id', text: 'テスト項目', checked: false };
            const index = 0;
            const onItemTextChange = jest.fn();
            const onItemRemove = jest.fn();

            const element = itemManager.createEditItemElement(item, index, onItemTextChange, onItemRemove);

            expect(element.className).toBe('edit-item');
            expect(element.querySelector('input').value).toBe('テスト項目');
            expect(element.querySelector('button').dataset.index).toBe('0');
        });

        test('createEditItemElement()でテキスト変更時にコールバックが呼ばれる', () => {
            const item = { id: 'test-id', text: 'テスト項目', checked: false };
            const index = 0;
            const onItemTextChange = jest.fn();
            const onItemRemove = jest.fn();

            const element = itemManager.createEditItemElement(item, index, onItemTextChange, onItemRemove);
            const input = element.querySelector('input');

            input.value = '新しいテキスト';
            input.dispatchEvent(new Event('input'));

            expect(item.text).toBe('新しいテキスト');
            expect(onItemTextChange).toHaveBeenCalledWith(item, index);
        });

        test('createEditItemElement()で削除ボタンクリック時にコールバックが呼ばれる', () => {
            const item = { id: 'test-id', text: 'テスト項目', checked: false };
            const index = 0;
            const onItemTextChange = jest.fn();
            const onItemRemove = jest.fn();

            const element = itemManager.createEditItemElement(item, index, onItemTextChange, onItemRemove);
            const deleteBtn = element.querySelector('button');

            deleteBtn.click();

            expect(onItemRemove).toHaveBeenCalledWith(index);
        });
    });

    describe('項目作成機能', () => {
        test('createItem()で新しい項目が作成される', () => {
            const text = 'テスト項目';
            const checked = true;
            const mockItem = { id: 'new-id', text: text, checked: checked };

            mockDataManager.createItemData.mockReturnValue(mockItem);

            const result = itemManager.createItem(text, checked);

            expect(mockDataManager.createItemData).toHaveBeenCalledWith(text, checked);
            expect(result).toBe(mockItem);
        });

        test('createItem()でチェック状態が指定されない場合falseになる', () => {
            const text = 'テスト項目';
            const mockItem = { id: 'new-id', text: text, checked: false };

            mockDataManager.createItemData.mockReturnValue(mockItem);

            const result = itemManager.createItem(text);

            expect(mockDataManager.createItemData).toHaveBeenCalledWith(text, false);
            expect(result).toBe(mockItem);
        });
    });

    describe('項目操作機能', () => {
        test('toggleItemCheck()でチェック状態が切り替わる', () => {
            const item = { id: '1', text: 'テスト', checked: false };

            const result = itemManager.toggleItemCheck(item);

            expect(result.checked).toBe(true);
            expect(result).toBe(item);
        });

        test('updateItemText()でテキストが更新される', () => {
            const item = { id: '1', text: '古いテキスト', checked: false };
            const newText = '新しいテキスト';

            const result = itemManager.updateItemText(item, newText);

            expect(result.text).toBe(newText);
            expect(result).toBe(item);
        });

        test('removeItem()で指定されたインデックスの項目が削除される', () => {
            const items = [
                { id: '1', text: 'アイテム1', checked: false },
                { id: '2', text: 'アイテム2', checked: false },
                { id: '3', text: 'アイテム3', checked: false }
            ];

            const result = itemManager.removeItem(items, 1);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('1');
            expect(result[1].id).toBe('3');
        });

        test('removeItem()で無効なインデックスの場合配列が変更されない', () => {
            const items = [
                { id: '1', text: 'アイテム1', checked: false }
            ];

            const result1 = itemManager.removeItem(items, -1);
            const result2 = itemManager.removeItem(items, 1);

            expect(result1).toHaveLength(1);
            expect(result2).toHaveLength(1);
        });

        test('addItem()で項目が配列に追加される', () => {
            const items = [
                { id: '1', text: 'アイテム1', checked: false }
            ];
            const newItem = { id: '2', text: 'アイテム2', checked: false };

            const result = itemManager.addItem(items, newItem);

            expect(result).toHaveLength(2);
            expect(result[1]).toBe(newItem);
        });

        test('addEmptyItem()で空の項目が追加される', () => {
            const items = [];
            const mockItem = { id: 'new-id', text: '', checked: false };

            mockDataManager.createItemData.mockReturnValue(mockItem);

            const result = itemManager.addEmptyItem(items);

            expect(result).toHaveLength(1);
            expect(mockDataManager.createItemData).toHaveBeenCalledWith('', false);
            expect(result[0]).toBe(mockItem);
        });

        test('resetAllItems()で全項目のチェック状態がリセットされる', () => {
            const items = [
                { id: '1', text: 'アイテム1', checked: true },
                { id: '2', text: 'アイテム2', checked: true },
                { id: '3', text: 'アイテム3', checked: false }
            ];

            const result = itemManager.resetAllItems(items);

            expect(result.every(item => item.checked === false)).toBe(true);
        });
    });

    describe('項目フィルタリング・検索機能', () => {
        let items;

        beforeEach(() => {
            items = [
                { id: '1', text: 'ショッピング', checked: true },
                { id: '2', text: 'TODO項目', checked: false },
                { id: '3', text: '買い物メモ', checked: true },
                { id: '4', text: 'タスク管理', checked: false }
            ];
        });

        test('getCheckedItems()でチェック済み項目が取得される', () => {
            const result = itemManager.getCheckedItems(items);

            expect(result).toHaveLength(2);
            expect(result[0].text).toBe('ショッピング');
            expect(result[1].text).toBe('買い物メモ');
        });

        test('getUncheckedItems()で未チェック項目が取得される', () => {
            const result = itemManager.getUncheckedItems(items);

            expect(result).toHaveLength(2);
            expect(result[0].text).toBe('TODO項目');
            expect(result[1].text).toBe('タスク管理');
        });

        test('searchItems()でテキスト検索ができる', () => {
            const result = itemManager.searchItems(items, 'TODO');

            expect(result).toHaveLength(1);
            expect(result[0].text).toBe('TODO項目');
        });

        test('searchItems()で大文字小文字を区別しない検索ができる', () => {
            const result = itemManager.searchItems(items, 'タスク');

            expect(result).toHaveLength(1);
            expect(result[0].text).toBe('タスク管理');
        });

        test('searchItems()で空のクエリの場合全項目が返される', () => {
            const result = itemManager.searchItems(items, '');

            expect(result).toHaveLength(4);
        });

        test('filterItemsByStatus()でチェック状態によるフィルタリングができる', () => {
            const checkedResult = itemManager.filterItemsByStatus(items, true);
            const uncheckedResult = itemManager.filterItemsByStatus(items, false);

            expect(checkedResult).toHaveLength(2);
            expect(uncheckedResult).toHaveLength(2);
        });
    });

    describe('統計・計算機能', () => {
        test('calculateCompletionRate()で完了率が正しく計算される', () => {
            const items = [
                { checked: true },
                { checked: false },
                { checked: true },
                { checked: false }
            ];

            const result = itemManager.calculateCompletionRate(items);

            expect(result).toBe(50);
        });

        test('calculateCompletionRate()で項目が0個の場合0が返される', () => {
            const items = [];

            const result = itemManager.calculateCompletionRate(items);

            expect(result).toBe(0);
        });

        test('getItemStatistics()で正しい統計情報が取得される', () => {
            const items = [
                { checked: true },
                { checked: false },
                { checked: true }
            ];

            const result = itemManager.getItemStatistics(items);

            expect(result).toEqual({
                total: 3,
                checked: 2,
                unchecked: 1,
                completionRate: (2/3) * 100
            });
        });
    });

    describe('項目操作機能（高度）', () => {
        test('onSortUpdate()で項目の並び替えができる（reorderItemsの代替）', () => {
            const items = [
                { id: '1', text: 'A' },
                { id: '2', text: 'B' },
                { id: '3', text: 'C' }
            ];
            const evt = { oldIndex: 0, newIndex: 2 };

            const result = itemManager.onSortUpdate(items, evt);

            expect(result[0].text).toBe('B');
            expect(result[1].text).toBe('C');
            expect(result[2].text).toBe('A');
        });

        test('onSortUpdate()で無効なインデックスの場合配列が変更されない', () => {
            const items = [
                { id: '1', text: 'A' },
                { id: '2', text: 'B' }
            ];

            const evt1 = { oldIndex: -1, newIndex: 1 };
            const evt2 = { oldIndex: 0, newIndex: 3 };

            const result1 = itemManager.onSortUpdate(items, evt1);
            const result2 = itemManager.onSortUpdate([...items], evt2);

            expect(result1[0].text).toBe('A');
            expect(result2[0].text).toBe('A');
        });

        test('duplicateItem()で項目が複製される', () => {
            const item = { id: '1', text: 'テスト', checked: true };
            const mockDuplicate = { id: '2', text: 'テスト', checked: true };

            mockDataManager.createItemData.mockReturnValue(mockDuplicate);

            const result = itemManager.duplicateItem(item);

            expect(mockDataManager.createItemData).toHaveBeenCalledWith('テスト', true);
            expect(result).toBe(mockDuplicate);
        });

        test('duplicateItems()で項目配列が複製される', () => {
            const items = [
                { id: '1', text: 'A', checked: false },
                { id: '2', text: 'B', checked: true }
            ];

            jest.spyOn(itemManager, 'duplicateItem')
                .mockReturnValueOnce({ id: '3', text: 'A', checked: false })
                .mockReturnValueOnce({ id: '4', text: 'B', checked: true });

            const result = itemManager.duplicateItems(items);

            expect(result).toHaveLength(2);
            expect(itemManager.duplicateItem).toHaveBeenCalledTimes(2);
        });

        test('removeEmptyItems()で空の項目が除去される', () => {
            const items = [
                { text: 'アイテム1' },
                { text: '' },
                { text: 'アイテム2' }
            ];
            const filteredItems = [items[0], items[2]];

            mockDataManager.filterValidItems.mockReturnValue(filteredItems);

            const result = itemManager.removeEmptyItems(items);

            expect(mockDataManager.filterValidItems).toHaveBeenCalledWith(items);
            expect(result).toBe(filteredItems);
        });
    });

    describe('バリデーション機能', () => {
        test('validateItem()で有効な項目がvalidateされる', () => {
            const validItem = { id: 'test-id', text: 'テスト', checked: false };
            const invalidItem1 = { id: 123, text: 'テスト', checked: false };
            const invalidItem2 = { id: 'test-id', text: 123, checked: false };
            const invalidItem3 = { id: 'test-id', text: 'テスト', checked: 'false' };
            const invalidItem4 = null;

            expect(itemManager.validateItem(validItem)).toBe(true);
            expect(itemManager.validateItem(invalidItem1)).toBe(false);
            expect(itemManager.validateItem(invalidItem2)).toBe(false);
            expect(itemManager.validateItem(invalidItem3)).toBe(false);
            expect(itemManager.validateItem(invalidItem4)).toBe(false);
        });

        test('validateItems()で項目配列がvalidateされる', () => {
            const validItems = [
                { id: '1', text: 'A', checked: false },
                { id: '2', text: 'B', checked: true }
            ];
            const invalidItems1 = [
                { id: '1', text: 'A', checked: false },
                { id: 123, text: 'B', checked: true }
            ];
            const invalidItems2 = 'not an array';

            expect(itemManager.validateItems(validItems)).toBe(true);
            expect(itemManager.validateItems(invalidItems1)).toBe(false);
            expect(itemManager.validateItems(invalidItems2)).toBe(false);
        });
    });

    describe('HTMLエスケープ機能', () => {
        test('escapeHtml()でHTMLが正しくエスケープされる', () => {
            const input = '<script>alert("xss")</script>';
            const result = itemManager.escapeHtml(input);
            
            expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
        });

        test('escapeHtml()で通常のテキストはそのまま返される', () => {
            const input = 'Hello World';
            const result = itemManager.escapeHtml(input);
            
            expect(result).toBe('Hello World');
        });
    });

    describe('Enterキーによる項目追加機能', () => {
        let onItemTextChange, onItemRemove, onAddNewItem;
        
        beforeEach(() => {
            onItemTextChange = jest.fn();
            onItemRemove = jest.fn();
            onAddNewItem = jest.fn();
        });

        test('テキスト入力済み項目でEnterキーを押すと新項目追加コールバックが呼ばれる', () => {
            const item = { id: '1', text: 'テスト項目', checked: false };
            const itemElement = itemManager.createEditItemElement(item, 0, onItemTextChange, onItemRemove, onAddNewItem);
            const input = itemElement.querySelector('input[type="text"]');
            
            // テキストが入力されている状態でEnterキーを押下
            input.value = 'テスト項目';
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            input.dispatchEvent(enterEvent);
            
            expect(onAddNewItem).toHaveBeenCalledTimes(1);
        });

        test('空の項目でEnterキーを押しても新項目追加コールバックは呼ばれない', () => {
            const item = { id: '1', text: '', checked: false };
            const itemElement = itemManager.createEditItemElement(item, 0, onItemTextChange, onItemRemove, onAddNewItem);
            const input = itemElement.querySelector('input[type="text"]');
            
            // 空の状態でEnterキーを押下
            input.value = '';
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            input.dispatchEvent(enterEvent);
            
            expect(onAddNewItem).not.toHaveBeenCalled();
        });

        test('スペースのみの項目でEnterキーを押しても新項目追加コールバックは呼ばれない', () => {
            const item = { id: '1', text: '   ', checked: false };
            const itemElement = itemManager.createEditItemElement(item, 0, onItemTextChange, onItemRemove, onAddNewItem);
            const input = itemElement.querySelector('input[type="text"]');
            
            // スペースのみの状態でEnterキーを押下
            input.value = '   ';
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            input.dispatchEvent(enterEvent);
            
            expect(onAddNewItem).not.toHaveBeenCalled();
        });

        test('他のキー（例：Tab）では新項目追加コールバックは呼ばれない', () => {
            const item = { id: '1', text: 'テスト項目', checked: false };
            const itemElement = itemManager.createEditItemElement(item, 0, onItemTextChange, onItemRemove, onAddNewItem);
            const input = itemElement.querySelector('input[type="text"]');
            
            // テキストが入力されている状態でTabキーを押下
            input.value = 'テスト項目';
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
            input.dispatchEvent(tabEvent);
            
            expect(onAddNewItem).not.toHaveBeenCalled();
        });
    });
});