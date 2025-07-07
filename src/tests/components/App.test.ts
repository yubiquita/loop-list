// App.vue コンポーネントテスト
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../../App.vue'

describe('App.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    vi.clearAllMocks()
  })

  it('正しくマウントされる', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('メインアプリケーション要素が存在する', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    const appElement = wrapper.find('#app')
    expect(appElement.exists()).toBe(true)
  })

  it('必要なコンポーネントが含まれている', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    // リスト画面が存在することを確認
    expect(wrapper.find('.screen').exists()).toBe(true)
  })

  it('CSSクラスが正しく適用されている', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    const appElement = wrapper.find('#app')
    expect(appElement.classes()).toContain('app')
  })

  it('ヘッダーが正しく表示される', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    const header = wrapper.find('.header')
    expect(header.exists()).toBe(true)
    expect(header.find('h1').exists()).toBe(true)
  })
})