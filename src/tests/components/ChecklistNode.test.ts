import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChecklistNode from '../../components/ChecklistNode.vue'
import type { ChecklistItem } from '../../types'
import { useChecklistStore } from '../../stores'

describe('ChecklistNode.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockItem: ChecklistItem = {
    id: '1',
    text: 'Test Item',
    checked: false,
    indent: 0
  }

  it('renders item text correctly', () => {
    const wrapper = mount(ChecklistNode, {
      props: {
        item: mockItem,
        listId: 'list-1'
      }
    })

    expect(wrapper.text()).toContain('Test Item')
  })

  it('reflects checked state correctly', () => {
    const checkedItem = { ...mockItem, checked: true }
    const wrapper = mount(ChecklistNode, {
      props: {
        item: checkedItem,
        listId: 'list-1'
      }
    })

    const checkbox = wrapper.find('.custom-checkbox')
    expect(checkbox.classes()).toContain('checked')
    expect(wrapper.find('.check-item').classes()).toContain('checked')
  })

  it('applies indentation margin correctly', () => {
    const indentedItem = { ...mockItem, indent: 1 }
    const wrapper = mount(ChecklistNode, {
      props: {
        item: indentedItem,
        listId: 'list-1'
      }
    })

    const container = wrapper.find('.node-container')
    expect((container.element as HTMLElement).style.marginLeft).toBe('24px')
  })

  describe('swipe interaction', () => {
    it('handles right swipe to indent a top-level item', async () => {
      const store = useChecklistStore()
      // リストを作成しておく必要がある
      store.createList('Test List')
      const listId = store.lists[0].id
      store.addItem(listId, 'Header Item') // index 0
      const item = store.addItem(listId, 'Test Item')! // index 1
      
      const wrapper = mount(ChecklistNode, {
        props: {
          item: store.lists[0].items[1],
          listId: listId
        }
      })

      const checkItem = wrapper.find('.check-item')

      // Touch Start
      await checkItem.trigger('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      })

      // Touch Move (Right Swipe)
      await checkItem.trigger('touchmove', {
        touches: [{ clientX: 200, clientY: 100 }]
      })

      // Touch End
      await checkItem.trigger('touchend')

      // ストアのインデントが更新されているか
      expect(store.lists[0].items[1].indent).toBe(1)
    })

    it('handles left swipe to outdent a sub-item', async () => {
      const store = useChecklistStore()
      store.createList('Test List')
      const listId = store.lists[0].id
      const item1 = store.addItem(listId, 'Parent')!
      const item2 = store.addItem(listId, 'Child')!
      store.toggleIndentation(listId, item2.id) // 最初からインデントさせておく
      
      const wrapper = mount(ChecklistNode, {
        props: {
          item: store.lists[0].items[1],
          listId: listId
        }
      })

      const checkItem = wrapper.find('.check-item')

      // Touch Start
      await checkItem.trigger('touchstart', {
        touches: [{ clientX: 200, clientY: 100 }]
      })

      // Touch Move (Left Swipe)
      await checkItem.trigger('touchmove', {
        touches: [{ clientX: 100, clientY: 100 }]
      })

      // Touch End
      await checkItem.trigger('touchend')

      // ストアのインデントが更新されているか
      expect(store.lists[0].items[1].indent).toBe(0)
    })

    it('shows visual feedback during swipe', async () => {
      const wrapper = mount(ChecklistNode, {
        props: {
          item: mockItem,
          listId: 'list-1'
        }
      })

      const checkItem = wrapper.find('.check-item')

      // Touch Start
      await checkItem.trigger('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      })

      // Touch Move (Right Swipe)
      await checkItem.trigger('touchmove', {
        touches: [{ clientX: 150, clientY: 100 }]
      })

      // 背景フィードバックが表示されているか確認
      const feedback = wrapper.find('.bg-indigo-50')
      expect(feedback.classes()).toContain('opacity-100')
      
      // translateX が適用されているか
      expect((checkItem.element as HTMLElement).style.transform).toBe('translateX(50px)')
    })
  })
})
