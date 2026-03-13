import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App', () => {
  it('renders the title', () => {
    const wrapper = mount(App)
    expect(wrapper.find('.title').text()).toBe('Routine')
  })

  it('renders initial tasks', () => {
    const wrapper = mount(App)
    const tasks = wrapper.findAll('.task-item')
    expect(tasks.length).toBeGreaterThan(0)
  })

  it('toggles task completion', async () => {
    const wrapper = mount(App)
    const checkbox = wrapper.find('.checkbox')
    const taskItem = wrapper.find('.task-item')
    
    expect(taskItem.classes()).not.toContain('is-completed')
    
    await checkbox.trigger('click')
    expect(taskItem.classes()).toContain('is-completed')
  })

  it('unchecks all tasks when reset button is clicked', async () => {
    const wrapper = mount(App)
    const checkbox = wrapper.find('.checkbox')
    const resetButton = wrapper.find('.reset-button')
    
    // Check one task
    await checkbox.trigger('click')
    expect(wrapper.find('.task-item').classes()).toContain('is-completed')
    
    // Reset
    await resetButton.trigger('click')
    expect(wrapper.find('.task-item').classes()).not.toContain('is-completed')
  })
})
