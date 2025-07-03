const { CONFIG, getConfig, setConfig, validateConfig } = require('../src/config.js');

describe('Config', () => {
    describe('CONFIG object', () => {
        test('CONFIG has required top-level properties', () => {
            expect(CONFIG).toHaveProperty('storage');
            expect(CONFIG).toHaveProperty('ui');
            expect(CONFIG).toHaveProperty('validation');
            expect(CONFIG).toHaveProperty('features');
            expect(CONFIG).toHaveProperty('debug');
            expect(CONFIG).toHaveProperty('performance');
        });

        test('storage config has correct structure', () => {
            expect(CONFIG.storage).toHaveProperty('key', 'checklists');
            expect(CONFIG.storage).toHaveProperty('version', '1.0');
            expect(CONFIG.storage).toHaveProperty('available');
        });

        test('ui config has correct structure', () => {
            expect(CONFIG.ui).toHaveProperty('transitionDuration');
            expect(CONFIG.ui).toHaveProperty('progressAnimationDuration');
            expect(CONFIG.ui).toHaveProperty('maxDisplayLists');
            expect(CONFIG.ui).toHaveProperty('maxDisplayItems');
            expect(CONFIG.ui).toHaveProperty('debounceTime');
            
            expect(typeof CONFIG.ui.transitionDuration).toBe('number');
            expect(typeof CONFIG.ui.progressAnimationDuration).toBe('number');
            expect(typeof CONFIG.ui.maxDisplayLists).toBe('number');
            expect(typeof CONFIG.ui.maxDisplayItems).toBe('number');
            expect(typeof CONFIG.ui.debounceTime).toBe('number');
        });

        test('validation config has correct structure', () => {
            expect(CONFIG.validation).toHaveProperty('maxListNameLength');
            expect(CONFIG.validation).toHaveProperty('maxItemTextLength');
            expect(CONFIG.validation).toHaveProperty('maxItemsPerList');
            
            expect(typeof CONFIG.validation.maxListNameLength).toBe('number');
            expect(typeof CONFIG.validation.maxItemTextLength).toBe('number');
            expect(typeof CONFIG.validation.maxItemsPerList).toBe('number');
        });

        test('features config has correct structure', () => {
            expect(CONFIG.features).toHaveProperty('autoSave');
            expect(CONFIG.features).toHaveProperty('autoSaveDelay');
            expect(CONFIG.features).toHaveProperty('confirmDialogs');
            expect(CONFIG.features).toHaveProperty('showProgress');
            expect(CONFIG.features).toHaveProperty('showStatistics');
            expect(CONFIG.features).toHaveProperty('enableSearch');
            expect(CONFIG.features).toHaveProperty('enableSort');
            
            expect(typeof CONFIG.features.autoSave).toBe('boolean');
            expect(typeof CONFIG.features.confirmDialogs).toBe('boolean');
            expect(typeof CONFIG.features.showProgress).toBe('boolean');
        });

        test('debug config has correct structure', () => {
            expect(CONFIG.debug).toHaveProperty('enabled');
            expect(CONFIG.debug).toHaveProperty('consoleLog');
            expect(CONFIG.debug).toHaveProperty('verboseErrors');
            
            expect(typeof CONFIG.debug.enabled).toBe('boolean');
            expect(typeof CONFIG.debug.consoleLog).toBe('boolean');
            expect(typeof CONFIG.debug.verboseErrors).toBe('boolean');
        });
    });

    describe('getConfig function', () => {
        test('getConfig returns correct values for top-level properties', () => {
            expect(getConfig('storage.key')).toBe('checklists');
            expect(getConfig('ui.transitionDuration')).toBe(300);
            expect(getConfig('features.autoSave')).toBe(true);
        });

        test('getConfig returns undefined for non-existent properties', () => {
            expect(getConfig('nonexistent')).toBeUndefined();
            expect(getConfig('storage.nonexistent')).toBeUndefined();
            expect(getConfig('nonexistent.property')).toBeUndefined();
        });

        test('getConfig works with deep nested properties', () => {
            expect(getConfig('validation.maxListNameLength')).toBe(100);
            expect(getConfig('performance.memoryLimit')).toBe(50);
        });

        test('getConfig handles edge cases', () => {
            expect(getConfig('')).toBeUndefined();
            expect(getConfig('.')).toBeUndefined();
            expect(getConfig('...')).toBeUndefined();
        });
    });

    describe('setConfig function', () => {
        let originalConfig;

        beforeEach(() => {
            // 元の設定値を保存
            originalConfig = JSON.parse(JSON.stringify(CONFIG));
        });

        afterEach(() => {
            // 設定値を復元
            Object.assign(CONFIG, originalConfig);
        });

        test('setConfig updates existing properties', () => {
            setConfig('ui.transitionDuration', 500);
            expect(CONFIG.ui.transitionDuration).toBe(500);
            
            setConfig('features.autoSave', false);
            expect(CONFIG.features.autoSave).toBe(false);
        });

        test('setConfig creates new properties', () => {
            setConfig('ui.newProperty', 'test');
            expect(CONFIG.ui.newProperty).toBe('test');
            
            setConfig('newSection.newProperty', 42);
            expect(CONFIG.newSection.newProperty).toBe(42);
        });

        test('setConfig works with deep nested paths', () => {
            setConfig('validation.maxListNameLength', 150);
            expect(CONFIG.validation.maxListNameLength).toBe(150);
        });

        test('setConfig handles edge cases', () => {
            // 空のパスは何もしない
            expect(() => setConfig('', 'value')).not.toThrow();
            
            // 単一のキー
            setConfig('testKey', 'testValue');
            expect(CONFIG.testKey).toBe('testValue');
        });
    });

    describe('validateConfig function', () => {
        let originalConfig;

        beforeEach(() => {
            originalConfig = JSON.parse(JSON.stringify(CONFIG));
        });

        afterEach(() => {
            Object.assign(CONFIG, originalConfig);
        });

        test('validateConfig returns empty array for valid config', () => {
            const errors = validateConfig();
            expect(Array.isArray(errors)).toBe(true);
            expect(errors).toHaveLength(0);
        });

        test('validateConfig detects invalid maxListNameLength', () => {
            CONFIG.validation.maxListNameLength = -1;
            const errors = validateConfig();
            expect(errors).toContain('maxListNameLength must be positive');
            
            CONFIG.validation.maxListNameLength = 0;
            const errors2 = validateConfig();
            expect(errors2).toContain('maxListNameLength must be positive');
        });

        test('validateConfig detects invalid maxItemTextLength', () => {
            CONFIG.validation.maxItemTextLength = -5;
            const errors = validateConfig();
            expect(errors).toContain('maxItemTextLength must be positive');
        });

        test('validateConfig detects invalid transitionDuration', () => {
            CONFIG.ui.transitionDuration = -100;
            const errors = validateConfig();
            expect(errors).toContain('transitionDuration must be non-negative');
        });

        test('validateConfig detects multiple errors', () => {
            CONFIG.validation.maxListNameLength = -1;
            CONFIG.validation.maxItemTextLength = -1;
            CONFIG.ui.transitionDuration = -1;
            
            const errors = validateConfig();
            expect(errors).toHaveLength(3);
            expect(errors).toContain('maxListNameLength must be positive');
            expect(errors).toContain('maxItemTextLength must be positive');
            expect(errors).toContain('transitionDuration must be non-negative');
        });
    });

    describe('Environment-specific configuration', () => {
        test('Environment settings are properly configured', () => {
            // テスト環境ではJSDOMが使用されているため、storageが利用可能
            expect(typeof CONFIG.storage.available).toBe('boolean');
            expect(typeof CONFIG.debug.enabled).toBe('boolean');
        });

        test('Configuration values are reasonable', () => {
            expect(CONFIG.ui.transitionDuration).toBeGreaterThan(0);
            expect(CONFIG.ui.maxDisplayLists).toBeGreaterThan(0);
            expect(CONFIG.validation.maxListNameLength).toBeGreaterThan(0);
            expect(CONFIG.validation.maxItemTextLength).toBeGreaterThan(0);
        });
    });

    describe('Type safety', () => {
        test('All expected properties have correct types', () => {
            expect(typeof CONFIG.storage.key).toBe('string');
            expect(typeof CONFIG.storage.version).toBe('string');
            expect(typeof CONFIG.ui.transitionDuration).toBe('number');
            expect(typeof CONFIG.features.autoSave).toBe('boolean');
            expect(typeof CONFIG.debug.enabled).toBe('boolean');
        });

        test('Numeric values are within reasonable ranges', () => {
            expect(CONFIG.ui.transitionDuration).toBeLessThan(10000);
            expect(CONFIG.ui.maxDisplayLists).toBeLessThan(100000);
            expect(CONFIG.validation.maxListNameLength).toBeLessThan(1000);
            expect(CONFIG.validation.maxItemTextLength).toBeLessThan(10000);
        });
    });
});