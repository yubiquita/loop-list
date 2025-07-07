// useDebounce Composable のテスト

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useDebounce } from '../../composables/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('指定した遅延時間後に関数を実行する', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 300)

    debouncedFn('test')
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledWith('test')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('複数回呼び出された場合、最後の呼び出しのみ実行される', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 300)

    debouncedFn('first')
    debouncedFn('second')
    debouncedFn('third')

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('third')
  })

  it('遅延時間内に再度呼び出すとタイマーがリセットされる', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 300)

    debouncedFn('test1')
    vi.advanceTimersByTime(100)

    debouncedFn('test2')
    vi.advanceTimersByTime(200)
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledWith('test2')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('デフォルトの遅延時間は300ms', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn)

    debouncedFn('test')
    vi.advanceTimersByTime(299)
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(mockFn).toHaveBeenCalledWith('test')
  })

  it('cancel関数で実行をキャンセルできる', () => {
    const mockFn = vi.fn()
    const { debouncedFn, cancel } = useDebounce(mockFn, 300)

    debouncedFn('test')
    cancel()

    vi.advanceTimersByTime(300)
    expect(mockFn).not.toHaveBeenCalled()
  })

  it('複数の引数を正しく渡す', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 300)

    debouncedFn('arg1', 'arg2', 'arg3')
    vi.advanceTimersByTime(300)

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
  })

  it('異なる遅延時間で複数のdebounce関数を作成できる', () => {
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()
    const { debouncedFn: debounced1 } = useDebounce(mockFn1, 100)
    const { debouncedFn: debounced2 } = useDebounce(mockFn2, 200)

    debounced1('test1')
    debounced2('test2')

    vi.advanceTimersByTime(100)
    expect(mockFn1).toHaveBeenCalledWith('test1')
    expect(mockFn2).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn2).toHaveBeenCalledWith('test2')
  })

  it('キャンセル後に再度実行できる', () => {
    const mockFn = vi.fn()
    const { debouncedFn, cancel } = useDebounce(mockFn, 300)

    debouncedFn('test1')
    cancel()

    debouncedFn('test2')
    vi.advanceTimersByTime(300)

    expect(mockFn).toHaveBeenCalledWith('test2')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('0ms遅延でも正常に動作する', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 0)

    debouncedFn('test')
    vi.advanceTimersByTime(0)

    expect(mockFn).toHaveBeenCalledWith('test')
  })
})