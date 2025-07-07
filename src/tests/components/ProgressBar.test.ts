// ProgressBar.vue コンポーネントテスト
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressBar from '../../components/ProgressBar.vue'
import type { ProgressInfo } from '../../types'

describe('ProgressBar.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createProgress = (total: number, completed: number): ProgressInfo => ({
    total,
    completed,
    percentage: total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0
  })

  it('正しくマウントされる', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        progress: createProgress(10, 5)
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('進捗パーセンテージが正しく計算される', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        progress: createProgress(10, 3),
        showText: true
      }
    })

    // 30%の進捗が表示されることを確認
    expect(wrapper.text()).toContain('30%')
  })

  it('プログレスバーの幅が正しく設定される', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        progress: createProgress(10, 7)
      }
    })

    const progressFill = wrapper.find('.progress-fill')
    expect(progressFill.attributes('style')).toContain('width: 70%')
  })

  it('0で割った場合のエラーを回避する', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        progress: createProgress(0, 0),
        showText: true
      }
    })

    expect(wrapper.text()).toContain('0%')
  })

  it('completed > total の場合は100%として表示', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        progress: createProgress(5, 8),
        showText: true
      }
    })

    expect(wrapper.text()).toContain('100%')
    const progressFill = wrapper.find('.progress-fill')
    expect(progressFill.attributes('style')).toContain('width: 100%')
  })

  it('進捗テキストが正しく表示される', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        progress: createProgress(10, 4),
        showText: true
      }
    })

    expect(wrapper.text()).toContain('4/10')
    expect(wrapper.text()).toContain('40%')
  })

  it('showText=falseの場合テキストが表示されない', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        progress: createProgress(10, 4),
        showText: false
      }
    })

    expect(wrapper.text()).not.toContain('4/10')
  })

  it('プログレスバーの基本構造が正しい', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        progress: createProgress(5, 3)
      }
    })

    expect(wrapper.find('.progress-container').exists()).toBe(true)
    expect(wrapper.find('.progress-bar').exists()).toBe(true)
    expect(wrapper.find('.progress-fill').exists()).toBe(true)
  })
})