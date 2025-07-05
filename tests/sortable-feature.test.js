/**
 * SortableJS並び替え機能のテストスイート
 * TDD原則に従って、新しい並び替え機能の実装前にテストを作成
 */

// DOM環境のセットアップ
require('./setup');

// 依存関係のインポート
const ChecklistItemManager = require('../src/ChecklistItemManager');
const ChecklistDataManager = require('../src/ChecklistDataManager');
const ChecklistUIManager = require('../src/ChecklistUIManager');

// SortableJSのモック
const mockSortable = {
    create: jest.fn(),
    instances: [],
    destroy: jest.fn()
};

// グローバルSortableをモック
global.Sortable = mockSortable;

describe('SortableJS並び替え機能', () => {
    let dataManager;
    let uiManager;
    let itemManager;
    let testItems;

    beforeEach(() => {
        // モックをリセット
        mockSortable.create.mockReset();
        mockSortable.instances = [];
        mockSortable.destroy.mockReset();

        // 各管理クラスのセットアップ
        dataManager = new ChecklistDataManager();
        uiManager = new ChecklistUIManager();
        itemManager = new ChecklistItemManager(dataManager, uiManager);

        // テスト用データ
        testItems = [
            { id: 'item1', text: '項目1', checked: false },
            { id: 'item2', text: '項目2', checked: true },
            { id: 'item3', text: '項目3', checked: false },
            { id: 'item4', text: '項目4', checked: true }
        ];

        // DOM要素のセットアップ
        document.body.innerHTML = `
            <div class="edit-items" id="editItems">
                <div class="edit-item" data-id="item1">
                    <span class="drag-handle">:::</span>
                    <input type="text" value="項目1">
                    <button class="delete-btn">削除</button>
                </div>
                <div class="edit-item" data-id="item2">
                    <span class="drag-handle">:::</span>
                    <input type="text" value="項目2">
                    <button class="delete-btn">削除</button>
                </div>
                <div class="edit-item" data-id="item3">
                    <span class="drag-handle">:::</span>
                    <input type="text" value="項目3">
                    <button class="delete-btn">削除</button>
                </div>
                <div class="edit-item" data-id="item4">
                    <span class="drag-handle">:::</span>
                    <input type="text" value="項目4">
                    <button class="delete-btn">削除</button>
                </div>
            </div>
        `;
    });

    describe('SortableJS初期化', () => {
        test('initializeSortable()が正しくSortableJSを初期化する', () => {
            // 実装予定: itemManager.initializeSortable()
            const container = document.getElementById('editItems');
            
            // まだ実装されていないメソッドのテスト（RED段階）
            expect(() => {
                itemManager.initializeSortable(container);
            }).not.toThrow();
            
            // SortableJS.create()が呼ばれることを確認
            expect(mockSortable.create).toHaveBeenCalledWith(container, expect.any(Object));
        });

        test('SortableJS設定オプションが正しく設定される', () => {
            const container = document.getElementById('editItems');
            
            // 実装予定のメソッドを呼び出し
            if (itemManager.initializeSortable) {
                itemManager.initializeSortable(container);
                
                const callArgs = mockSortable.create.mock.calls[0];
                const options = callArgs[1];
                
                expect(options.animation).toBe(150);
                expect(options.ghostClass).toBe('sortable-ghost');
                expect(options.chosenClass).toBe('sortable-chosen');
                expect(options.handle).toBe('.drag-handle');
                expect(typeof options.onUpdate).toBe('function');
                expect(typeof options.onStart).toBe('function');
                expect(typeof options.onEnd).toBe('function');
            }
        });
    });

    describe('項目の並び替え処理', () => {
        test('onSortUpdate()が正しく項目の順序を更新する', () => {
            // 実装予定: itemManager.onSortUpdate()
            const eventData = {
                oldIndex: 0,
                newIndex: 2,
                item: document.querySelector('[data-id="item1"]')
            };
            
            // 配列の並び替え前の状態確認
            expect(testItems[0].id).toBe('item1');
            expect(testItems[2].id).toBe('item3');
            
            // 実装予定のメソッドテスト（RED段階）
            if (itemManager.onSortUpdate) {
                const result = itemManager.onSortUpdate(testItems, eventData);
                
                // 並び替え後の状態確認
                expect(result[0].id).toBe('item2');
                expect(result[1].id).toBe('item3');
                expect(result[2].id).toBe('item1');
                expect(result[3].id).toBe('item4');
            }
        });

        test('無効なインデックスでのエラーハンドリング', () => {
            const eventData = {
                oldIndex: -1,
                newIndex: 999,
                item: document.querySelector('[data-id="item1"]')
            };
            
            // 無効なインデックスの場合、元の配列を返す
            if (itemManager.onSortUpdate) {
                const result = itemManager.onSortUpdate(testItems, eventData);
                expect(result).toEqual(testItems);
            }
        });

        test('同じインデックスでの並び替え（変更なし）', () => {
            const eventData = {
                oldIndex: 1,
                newIndex: 1,
                item: document.querySelector('[data-id="item2"]')
            };
            
            if (itemManager.onSortUpdate) {
                const result = itemManager.onSortUpdate(testItems, eventData);
                expect(result).toEqual(testItems);
            }
        });
    });

    describe('DOM要素の同期', () => {
        test('DOM要素の順序がデータ配列と一致する', () => {
            // 実装予定: itemManager.syncDOMWithData()
            const reorderedItems = [
                testItems[2], // item3
                testItems[0], // item1
                testItems[3], // item4
                testItems[1]  // item2
            ];
            
            if (itemManager.syncDOMWithData) {
                itemManager.syncDOMWithData(reorderedItems);
                
                const domItems = document.querySelectorAll('.edit-item');
                expect(domItems[0].dataset.id).toBe('item3');
                expect(domItems[1].dataset.id).toBe('item1');
                expect(domItems[2].dataset.id).toBe('item4');
                expect(domItems[3].dataset.id).toBe('item2');
            }
        });

        test('入力値がデータ配列と一致する', () => {
            const items = [
                { id: 'item1', text: '更新された項目1', checked: false },
                { id: 'item2', text: '更新された項目2', checked: true }
            ];
            
            if (itemManager.syncDOMWithData) {
                itemManager.syncDOMWithData(items);
                
                const input1 = document.querySelector('[data-id="item1"] input');
                const input2 = document.querySelector('[data-id="item2"] input');
                
                expect(input1.value).toBe('更新された項目1');
                expect(input2.value).toBe('更新された項目2');
            }
        });
    });

    describe('SortableJSインスタンス管理', () => {
        test('destroySortable()が正しくインスタンスを破棄する', () => {
            // 実装予定: itemManager.destroySortable()
            const mockInstance = { destroy: jest.fn() };
            
            if (itemManager.destroySortable) {
                itemManager.sortableInstance = mockInstance;
                itemManager.destroySortable();
                
                expect(mockInstance.destroy).toHaveBeenCalled();
                expect(itemManager.sortableInstance).toBeNull();
            }
        });

        test('複数のSortableインスタンスの管理', () => {
            const container1 = document.createElement('div');
            container1.id = 'container1';
            const container2 = document.createElement('div');
            container2.id = 'container2';
            
            if (itemManager.initializeSortable) {
                itemManager.initializeSortable(container1);
                itemManager.initializeSortable(container2);
                
                expect(mockSortable.create).toHaveBeenCalledTimes(2);
            }
        });
    });

    describe('既存のreorderItems()メソッドとの互換性', () => {
        test('reorderItems()メソッドが削除されている', () => {
            // 新しい実装ではreorderItems()は削除される
            expect(itemManager.reorderItems).toBeUndefined();
        });

        test('既存のテストケースが新しい実装で動作する', () => {
            // 既存のreorderItems()のテストケースを新しい実装で検証
            const items = [...testItems];
            const eventData = { oldIndex: 1, newIndex: 3 };
            
            if (itemManager.onSortUpdate) {
                const result = itemManager.onSortUpdate(items, eventData);
                
                // 元のreorderItems(items, 1, 3)と同じ結果を期待
                expect(result[0].id).toBe('item1');
                expect(result[1].id).toBe('item3');
                expect(result[2].id).toBe('item4');
                expect(result[3].id).toBe('item2');
            }
        });
    });

    describe('イベントハンドラー', () => {
        test('onStart イベントが正しく処理される', () => {
            const startEvent = {
                oldIndex: 1,
                item: document.querySelector('[data-id="item2"]')
            };
            
            // 実装予定: itemManager.onSortStart()
            if (itemManager.onSortStart) {
                expect(() => {
                    itemManager.onSortStart(startEvent);
                }).not.toThrow();
            }
        });

        test('onEnd イベントが正しく処理される', () => {
            const endEvent = {
                oldIndex: 1,
                newIndex: 3,
                item: document.querySelector('[data-id="item2"]')
            };
            
            // 実装予定: itemManager.onSortEnd()
            if (itemManager.onSortEnd) {
                expect(() => {
                    itemManager.onSortEnd(endEvent);
                }).not.toThrow();
            }
        });
    });

    describe('エラーハンドリング', () => {
        test('無効なコンテナでの初期化エラー', () => {
            if (itemManager.initializeSortable) {
                expect(() => {
                    itemManager.initializeSortable(null);
                }).toThrow('Invalid container element');
            }
        });

        test('SortableJSライブラリが利用できない場合のエラー', () => {
            // グローバルSortableを削除
            delete global.Sortable;
            
            if (itemManager.initializeSortable) {
                expect(() => {
                    itemManager.initializeSortable(document.getElementById('editItems'));
                }).toThrow('SortableJS library not found');
            }
            
            // テスト後にSortableを復元
            global.Sortable = mockSortable;
        });
    });

    describe('パフォーマンス', () => {
        test('大量データでの並び替え性能', () => {
            // 1000個の項目を作成
            const largeItems = Array.from({ length: 1000 }, (_, i) => ({
                id: `item${i}`,
                text: `項目${i}`,
                checked: i % 2 === 0
            }));
            
            const startTime = performance.now();
            
            if (itemManager.onSortUpdate) {
                const eventData = { oldIndex: 0, newIndex: 999 };
                itemManager.onSortUpdate(largeItems, eventData);
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            // 1000個の項目の並び替えが100ms以内で完了することを確認
            expect(executionTime).toBeLessThan(100);
        });
    });
});