import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskItem from './TaskItem.vue'

describe('TaskItem Swipe Logic', () => {
  const task = { id: 't1', text: 'Task 1', completed: false, indent: 0 }

  it('emits indent event when swiped right on level 0 task', async () => {
    const wrapper = mount(TaskItem, {
      props: { task }
    })

    const item = wrapper.find('.task-item')

    // Simulate swipe right
    await item.trigger('touchstart', {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    await item.trigger('touchmove', {
      touches: [{ clientX: 100, clientY: 0 }]
    })
    await item.trigger('touchend')

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('indent')).toBeTruthy()
    expect(wrapper.emitted('indent')![0]).toEqual(['t1', 1])
  })

  it('emits indent event when swiped left on level 1 task', async () => {
    const subtask = { id: 't2', text: 'Subtask', completed: false, indent: 1 }
    const wrapper = mount(TaskItem, {
      props: { task: subtask }
    })

    const item = wrapper.find('.task-item')

    // Simulate swipe left
    await item.trigger('touchstart', {
      touches: [{ clientX: 100, clientY: 0 }]
    })
    await item.trigger('touchmove', {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    await item.trigger('touchend')

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('indent')).toBeTruthy()
    expect(wrapper.emitted('indent')![0]).toEqual(['t2', 0])
  })

  it('does NOT emit indent event when swiped left on level 0 task (current behavior)', async () => {
    const wrapper = mount(TaskItem, {
      props: { task }
    })

    const item = wrapper.find('.task-item')

    // Simulate swipe left
    await item.trigger('touchstart', {
      touches: [{ clientX: 100, clientY: 0 }]
    })
    await item.trigger('touchmove', {
      touches: [{ clientX: 0, clientY: 0 }]
    })
    await item.trigger('touchend')

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('indent')).toBeFalsy()
  })
})
