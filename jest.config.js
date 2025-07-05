/**
 * Jest Configuration for E2E Tests
 * Termux環境でのE2Eテスト用Jest設定
 */

module.exports = {
  // テスト環境設定
  testEnvironment: 'jsdom',
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // テストファイルのパターン
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/e2e/**/*.test.js'
  ],
  
  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.js',
    '!node_modules/**',
    '!tests/**'
  ],
  
  // カバレッジレポート形式
  coverageReporters: [
    'text',
    'html',
    'lcov'
  ],
  
  // カバレッジ出力ディレクトリ
  coverageDirectory: 'coverage',
  
  // テストタイムアウト設定（E2Eテスト用に延長）
  testTimeout: 30000,
  
  // モジュール変換設定
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // テストプロジェクト設定
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: [
        '<rootDir>/tests/*.test.js'
      ],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
    },
    {
      displayName: 'E2E Tests',
      testMatch: [
        '<rootDir>/tests/e2e/**/*.test.js'
      ],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js']
    }
  ],
  
  // グローバル変数設定
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // モジュール解決設定
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // 並列実行設定
  maxWorkers: 2,
  
  // テスト結果の詳細表示
  verbose: true,
  
  // テスト実行時の追加設定
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  
  // ウォッチモード設定
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
};