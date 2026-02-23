import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import App from '../../App.vue'

describe('CRUD Flow Scenario', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('リストの作成から削除までの一連のフローが正常に動作する', async () => {
    const listName = 'テストリスト'
    vi.spyOn(window, 'prompt').mockReturnValue(listName)

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()]
      }
    })

    await nextTick()

    // 1. リストの作成
    await wrapper.find('.add-list-btn').trigger('click')
    await nextTick()
    await nextTick()

    // 2. 項目を追加
    await wrapper.find('.add-item-btn').trigger('click')
    await nextTick()
    await wrapper.find('.item-input').setValue('項目1')
    
    // デバウンス(300ms)を待機
    vi.advanceTimersByTime(300)
    await nextTick()
    
    // 保存して詳細画面へ
    await wrapper.find('.save-btn').trigger('click')
    await nextTick()
    await nextTick()

    // 3. 詳細画面でチェックを入れる
    const detailScreen = wrapper.findComponent({ name: 'DetailScreen' })
    const checkbox = detailScreen.find('input[type="checkbox"]')
    expect(checkbox.exists()).toBe(true)
    // setValue または setChecked の代わりに直接イベントをトリガー
    await checkbox.trigger('click')
    await nextTick()
    
    // 4. 一覧に戻る
    await detailScreen.find('.back-btn').trigger('click')
    await nextTick()
    await nextTick()

    // 一覧画面の表示確認
    const listScreen = wrapper.findComponent({ name: 'ListScreen' })
    expect(listScreen.text()).toContain('1/1 (100%)')

    // 5. データの永続化確認 (再マウント)
    const wrapper2 = mount(App, {
      global: {
        plugins: [createPinia()]
      }
    })
    await nextTick()
    await nextTick()
    const listScreen2 = wrapper2.findComponent({ name: 'ListScreen' })
    expect(listScreen2.text()).toContain(listName)
    expect(listScreen2.text()).toContain('1/1 (100%)')
    
    // 6. 削除
    await listScreen2.find('.delete-btn').trigger('click')
    await nextTick()
    await nextTick()
    
    // 確認モーダル
    const confirmModal = wrapper2.findComponent({ name: 'ConfirmModal' })
    await confirmModal.find('.confirm-yes').trigger('click')
    await nextTick()
    await nextTick()
    
    expect(listScreen2.text()).not.toContain(listName)
  })
})
