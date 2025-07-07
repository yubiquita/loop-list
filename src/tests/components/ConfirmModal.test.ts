// ConfirmModal.vue コンポーネントテスト
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmModal from '../../components/ConfirmModal.vue'

describe('ConfirmModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('正しくマウントされる', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        show: true,
        message: 'テストメッセージ'
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('モーダルオーバーレイが表示される', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        message: 'テストメッセージ'
      }
    })

    const modalOverlay = wrapper.find('.modal-overlay')
    expect(modalOverlay.exists()).toBe(true)
    expect(modalOverlay.isVisible()).toBe(true)
  })

  it('モーダルコンテンツが表示される', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        message: 'テストメッセージ'
      }
    })

    const modalContent = wrapper.find('.modal-content')
    expect(modalContent.exists()).toBe(true)
  })

  it('メッセージが正しく表示される', () => {
    const testMessage = '削除してもよろしいですか？'
    const wrapper = mount(ConfirmModal, {
      props: {
        show: true,
        message: testMessage
      }
    })

    expect(wrapper.text()).toContain(testMessage)
  })

  it('確認ボタンクリックでconfirmイベントが発火される', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        message: 'テストメッセージ'
      }
    })

    await wrapper.find('.confirm-yes').trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('キャンセルボタンクリックでcancelイベントが発火される', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        message: 'テストメッセージ'
      }
    })

    await wrapper.find('.confirm-no').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('オーバーレイクリックでcancelイベントが発火される', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        message: 'テストメッセージ'
      }
    })

    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('ボタンのテキストが正しく表示される', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        message: 'テストメッセージ'
      }
    })

    const yesButton = wrapper.find('.confirm-yes')
    const noButton = wrapper.find('.confirm-no')
    
    expect(yesButton.text()).toBe('はい')
    expect(noButton.text()).toBe('いいえ')
  })
})