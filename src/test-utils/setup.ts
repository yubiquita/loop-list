// テストセットアップファイル
import { vi, beforeEach } from 'vitest'

// localStorage 実装（実際のストレージ動作を模倣）
const storage: Record<string, string> = {}

const localStorageMock = {
  getItem: vi.fn((key: string) => storage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete storage[key]
  }),
  clear: vi.fn(() => {
    Object.keys(storage).forEach(key => delete storage[key])
  }),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// SortableJS のモック
vi.mock('sortablejs', () => ({
  default: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    option: vi.fn(),
    toArray: vi.fn(() => []),
  })),
}))

// beforeEach でlocalStorageをクリア
beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})