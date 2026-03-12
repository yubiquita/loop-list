import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChecklistNode from '../../components/ChecklistNode.vue'
import type { ChecklistItem } from '../../types'

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

    const checkbox = wrapper.find('input[type="checkbox"]')
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)
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
})
