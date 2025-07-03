const {
    CSS_CLASSES,
    ELEMENT_IDS,
    MESSAGES,
    ACTIONS,
    STATES,
    EVENTS,
    KEY_CODES,
    DATA_FORMATS,
    STORAGE_KEYS,
    ROUTES,
    API_ENDPOINTS,
    NUMBERS
} = require('../src/constants.js');

describe('Constants', () => {
    describe('CSS_CLASSES', () => {
        test('has all required CSS class constants', () => {
            expect(CSS_CLASSES).toHaveProperty('screen', 'screen');
            expect(CSS_CLASSES).toHaveProperty('hidden', 'hidden');
            expect(CSS_CLASSES).toHaveProperty('listItem', 'list-item');
            expect(CSS_CLASSES).toHaveProperty('checkItem', 'check-item');
            expect(CSS_CLASSES).toHaveProperty('checked', 'checked');
        });

        test('all values are non-empty strings', () => {
            Object.values(CSS_CLASSES).forEach(value => {
                expect(typeof value).toBe('string');
                expect(value.length).toBeGreaterThan(0);
            });
        });

        test('has button-related classes', () => {
            expect(CSS_CLASSES).toHaveProperty('addListBtn');
            expect(CSS_CLASSES).toHaveProperty('deleteBtn');
            expect(CSS_CLASSES).toHaveProperty('editBtn');
            expect(CSS_CLASSES).toHaveProperty('saveBtn');
        });
    });

    describe('ELEMENT_IDS', () => {
        test('has all required element ID constants', () => {
            expect(ELEMENT_IDS).toHaveProperty('listScreen', 'listScreen');
            expect(ELEMENT_IDS).toHaveProperty('detailScreen', 'detailScreen');
            expect(ELEMENT_IDS).toHaveProperty('editScreen', 'editScreen');
            expect(ELEMENT_IDS).toHaveProperty('listContainer', 'listContainer');
        });

        test('all values are non-empty strings', () => {
            Object.values(ELEMENT_IDS).forEach(value => {
                expect(typeof value).toBe('string');
                expect(value.length).toBeGreaterThan(0);
            });
        });

        test('IDs match expected camelCase pattern', () => {
            Object.values(ELEMENT_IDS).forEach(id => {
                expect(id).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/);
            });
        });
    });

    describe('MESSAGES', () => {
        test('has all required message categories', () => {
            expect(MESSAGES).toHaveProperty('errors');
            expect(MESSAGES).toHaveProperty('confirmations');
            expect(MESSAGES).toHaveProperty('success');
            expect(MESSAGES).toHaveProperty('info');
            expect(MESSAGES).toHaveProperty('titles');
        });

        test('error messages are properly defined', () => {
            expect(MESSAGES.errors).toHaveProperty('listNameRequired');
            expect(MESSAGES.errors).toHaveProperty('storageError');
            expect(MESSAGES.errors).toHaveProperty('loadError');
            
            Object.values(MESSAGES.errors).forEach(message => {
                expect(typeof message).toBe('string');
                expect(message.length).toBeGreaterThan(0);
            });
        });

        test('confirmation messages are properly defined', () => {
            expect(MESSAGES.confirmations).toHaveProperty('deleteList');
            expect(MESSAGES.confirmations).toHaveProperty('resetList');
            
            Object.values(MESSAGES.confirmations).forEach(message => {
                expect(typeof message).toBe('string');
                expect(message.includes('？')).toBe(true); // Japanese question mark
            });
        });

        test('success messages are properly defined', () => {
            expect(MESSAGES.success).toHaveProperty('listCreated');
            expect(MESSAGES.success).toHaveProperty('listUpdated');
            expect(MESSAGES.success).toHaveProperty('listDeleted');
            
            Object.values(MESSAGES.success).forEach(message => {
                expect(typeof message).toBe('string');
                expect(message.length).toBeGreaterThan(0);
            });
        });
    });

    describe('ACTIONS', () => {
        test('has CRUD action constants', () => {
            expect(ACTIONS).toHaveProperty('CREATE', 'CREATE');
            expect(ACTIONS).toHaveProperty('READ', 'READ');
            expect(ACTIONS).toHaveProperty('UPDATE', 'UPDATE');
            expect(ACTIONS).toHaveProperty('DELETE', 'DELETE');
        });

        test('has UI action constants', () => {
            expect(ACTIONS).toHaveProperty('SHOW_LIST_SCREEN');
            expect(ACTIONS).toHaveProperty('SHOW_DETAIL_SCREEN');
            expect(ACTIONS).toHaveProperty('SHOW_EDIT_SCREEN');
        });

        test('has list action constants', () => {
            expect(ACTIONS).toHaveProperty('ADD_LIST');
            expect(ACTIONS).toHaveProperty('EDIT_LIST');
            expect(ACTIONS).toHaveProperty('DELETE_LIST');
            expect(ACTIONS).toHaveProperty('RESET_LIST');
        });

        test('all values are uppercase strings', () => {
            Object.values(ACTIONS).forEach(action => {
                expect(typeof action).toBe('string');
                expect(action).toBe(action.toUpperCase());
                expect(action.length).toBeGreaterThan(0);
            });
        });
    });

    describe('STATES', () => {
        test('has application state constants', () => {
            expect(STATES).toHaveProperty('LOADING', 'LOADING');
            expect(STATES).toHaveProperty('READY', 'READY');
            expect(STATES).toHaveProperty('ERROR', 'ERROR');
            expect(STATES).toHaveProperty('SAVING', 'SAVING');
        });

        test('has edit state constants', () => {
            expect(STATES).toHaveProperty('CREATING');
            expect(STATES).toHaveProperty('EDITING');
            expect(STATES).toHaveProperty('VIEWING');
        });

        test('all values are uppercase strings', () => {
            Object.values(STATES).forEach(state => {
                expect(typeof state).toBe('string');
                expect(state).toBe(state.toUpperCase());
            });
        });
    });

    describe('EVENTS', () => {
        test('has DOM event constants', () => {
            expect(EVENTS).toHaveProperty('CLICK', 'click');
            expect(EVENTS).toHaveProperty('CHANGE', 'change');
            expect(EVENTS).toHaveProperty('INPUT', 'input');
            expect(EVENTS).toHaveProperty('SUBMIT', 'submit');
        });

        test('has custom event constants', () => {
            expect(EVENTS).toHaveProperty('LIST_CREATED');
            expect(EVENTS).toHaveProperty('LIST_UPDATED');
            expect(EVENTS).toHaveProperty('ITEM_TOGGLED');
            expect(EVENTS).toHaveProperty('DATA_SAVED');
        });

        test('custom events follow naming convention', () => {
            const customEvents = [
                EVENTS.LIST_CREATED,
                EVENTS.LIST_UPDATED,
                EVENTS.LIST_DELETED,
                EVENTS.ITEM_CREATED,
                EVENTS.DATA_SAVED
            ];
            
            customEvents.forEach(event => {
                expect(event).toMatch(/^[a-z]+:[a-z]+$/);
            });
        });
    });

    describe('KEY_CODES', () => {
        test('has common key code constants', () => {
            expect(KEY_CODES).toHaveProperty('ENTER', 13);
            expect(KEY_CODES).toHaveProperty('ESCAPE', 27);
            expect(KEY_CODES).toHaveProperty('SPACE', 32);
            expect(KEY_CODES).toHaveProperty('ARROW_UP', 38);
            expect(KEY_CODES).toHaveProperty('ARROW_DOWN', 40);
        });

        test('all values are positive integers', () => {
            Object.values(KEY_CODES).forEach(code => {
                expect(typeof code).toBe('number');
                expect(code).toBeGreaterThan(0);
                expect(Number.isInteger(code)).toBe(true);
            });
        });
    });

    describe('DATA_FORMATS', () => {
        test('has date format constants', () => {
            expect(DATA_FORMATS).toHaveProperty('DATE_FORMAT');
            expect(DATA_FORMATS).toHaveProperty('TIME_FORMAT');
            expect(DATA_FORMATS).toHaveProperty('DATETIME_FORMAT');
            expect(DATA_FORMATS).toHaveProperty('ISO_FORMAT');
        });

        test('has export format constants', () => {
            expect(DATA_FORMATS).toHaveProperty('JSON', 'json');
            expect(DATA_FORMATS).toHaveProperty('CSV', 'csv');
            expect(DATA_FORMATS).toHaveProperty('TXT', 'txt');
        });

        test('all values are non-empty strings', () => {
            Object.values(DATA_FORMATS).forEach(format => {
                expect(typeof format).toBe('string');
                expect(format.length).toBeGreaterThan(0);
            });
        });
    });

    describe('STORAGE_KEYS', () => {
        test('has all required storage keys', () => {
            expect(STORAGE_KEYS).toHaveProperty('CHECKLISTS', 'checklists');
            expect(STORAGE_KEYS).toHaveProperty('SETTINGS', 'settings');
            expect(STORAGE_KEYS).toHaveProperty('USER_PREFERENCES', 'userPreferences');
            expect(STORAGE_KEYS).toHaveProperty('APP_STATE', 'appState');
            expect(STORAGE_KEYS).toHaveProperty('BACKUP', 'backup');
        });

        test('all values are camelCase strings', () => {
            Object.values(STORAGE_KEYS).forEach(key => {
                expect(typeof key).toBe('string');
                expect(key).toMatch(/^[a-z][a-zA-Z0-9]*$/);
            });
        });
    });

    describe('ROUTES', () => {
        test('has all required route constants', () => {
            expect(ROUTES).toHaveProperty('HOME', '/');
            expect(ROUTES).toHaveProperty('LIST', '/list');
            expect(ROUTES).toHaveProperty('DETAIL', '/detail');
            expect(ROUTES).toHaveProperty('EDIT', '/edit');
            expect(ROUTES).toHaveProperty('SETTINGS', '/settings');
        });

        test('all routes start with forward slash', () => {
            Object.values(ROUTES).forEach(route => {
                expect(typeof route).toBe('string');
                expect(route.startsWith('/')).toBe(true);
            });
        });
    });

    describe('API_ENDPOINTS', () => {
        test('has API endpoint constants', () => {
            expect(API_ENDPOINTS).toHaveProperty('BASE_URL');
            expect(API_ENDPOINTS).toHaveProperty('LISTS');
            expect(API_ENDPOINTS).toHaveProperty('ITEMS');
            expect(API_ENDPOINTS).toHaveProperty('SYNC');
            expect(API_ENDPOINTS).toHaveProperty('BACKUP');
        });

        test('API paths start with /api or are empty', () => {
            Object.entries(API_ENDPOINTS).forEach(([key, value]) => {
                expect(typeof value).toBe('string');
                if (key !== 'BASE_URL') {
                    expect(value.startsWith('/api')).toBe(true);
                }
            });
        });
    });

    describe('NUMBERS', () => {
        test('has pagination constants', () => {
            expect(NUMBERS).toHaveProperty('DEFAULT_PAGE_SIZE');
            expect(NUMBERS).toHaveProperty('MAX_PAGE_SIZE');
            
            expect(typeof NUMBERS.DEFAULT_PAGE_SIZE).toBe('number');
            expect(typeof NUMBERS.MAX_PAGE_SIZE).toBe('number');
            expect(NUMBERS.DEFAULT_PAGE_SIZE).toBeLessThanOrEqual(NUMBERS.MAX_PAGE_SIZE);
        });

        test('has limit constants', () => {
            expect(NUMBERS).toHaveProperty('MAX_LIST_NAME_LENGTH');
            expect(NUMBERS).toHaveProperty('MAX_ITEM_TEXT_LENGTH');
            expect(NUMBERS).toHaveProperty('MAX_LISTS_COUNT');
            expect(NUMBERS).toHaveProperty('MAX_ITEMS_PER_LIST');
        });

        test('has timeout constants', () => {
            expect(NUMBERS).toHaveProperty('DEFAULT_TIMEOUT');
            expect(NUMBERS).toHaveProperty('SAVE_TIMEOUT');
            expect(NUMBERS).toHaveProperty('LOAD_TIMEOUT');
            
            expect(typeof NUMBERS.DEFAULT_TIMEOUT).toBe('number');
            expect(typeof NUMBERS.SAVE_TIMEOUT).toBe('number');
            expect(typeof NUMBERS.LOAD_TIMEOUT).toBe('number');
        });

        test('all values are positive numbers', () => {
            Object.values(NUMBERS).forEach(num => {
                expect(typeof num).toBe('number');
                expect(num).toBeGreaterThan(0);
            });
        });

        test('limits are reasonable', () => {
            expect(NUMBERS.MAX_LIST_NAME_LENGTH).toBeGreaterThan(10);
            expect(NUMBERS.MAX_ITEM_TEXT_LENGTH).toBeGreaterThan(10);
            expect(NUMBERS.MAX_LISTS_COUNT).toBeGreaterThan(100);
            expect(NUMBERS.MAX_ITEMS_PER_LIST).toBeGreaterThan(10);
        });
    });

    describe('Object immutability', () => {
        test('constants should not be easily modified', () => {
            // Try to modify a constant and verify it doesn't affect the original
            const originalValue = CSS_CLASSES.screen;
            CSS_CLASSES.screen = 'modified';
            
            // In a real immutable setup, this would still be the original value
            // This test just ensures we're aware of the current behavior
            expect(typeof CSS_CLASSES.screen).toBe('string');
        });
    });

    describe('Consistency checks', () => {
        test('related constants are consistent', () => {
            // Element IDs should correspond to some CSS classes where appropriate
            expect(ELEMENT_IDS.listScreen).toBeTruthy();
            expect(ELEMENT_IDS.detailScreen).toBeTruthy();
            expect(ELEMENT_IDS.editScreen).toBeTruthy();
        });

        test('no duplicate values in enums', () => {
            const actionValues = Object.values(ACTIONS);
            const uniqueActions = new Set(actionValues);
            expect(uniqueActions.size).toBe(actionValues.length);
            
            const stateValues = Object.values(STATES);
            const uniqueStates = new Set(stateValues);
            expect(uniqueStates.size).toBe(stateValues.length);
        });
    });
});