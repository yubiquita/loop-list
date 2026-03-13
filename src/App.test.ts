import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from './App.vue'

// LocalStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
    removeItem: (key: string) => { delete store[key] }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('App', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders the title (active list name)', () => {
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
    
    expect(wrapper.find('.task-item').classes()).not.toContain('is-completed')
    
    await checkbox.trigger('click')
    await nextTick()
    
    expect(wrapper.find('.task-item').classes()).toContain('is-completed')
  })

  it('unchecks all tasks when reset button is clicked', async () => {
    const wrapper = mount(App)
    const checkbox = wrapper.find('.checkbox')
    const resetButton = wrapper.find('.reset-button')
    
    // Check one task
    await checkbox.trigger('click')
    await nextTick()
    expect(wrapper.find('.task-item').classes()).toContain('is-completed')
    
    // Reset
    await resetButton.trigger('click')
    await nextTick()
    expect(wrapper.find('.task-item').classes()).not.toContain('is-completed')
  })

  describe('Parent-Child Logic', () => {
    it('checks all child tasks when parent task is checked', async () => {
      const wrapper = mount(App)
      const parentCheckbox = wrapper.findAll('.checkbox')[0]
      
      await parentCheckbox.trigger('click')
      await nextTick()
      
      const items = wrapper.findAll('.task-item')
      expect(items[0].classes()).toContain('is-completed')
      expect(items[1].classes()).toContain('is-completed')
      expect(items[2].classes()).toContain('is-completed')
    })

    it('checks parent task when all child tasks are checked', async () => {
      const wrapper = mount(App)
      
      const checkboxes = wrapper.findAll('.checkbox')
      await checkboxes[1].trigger('click') // child 1
      await nextTick()
      expect(wrapper.findAll('.task-item')[0].classes()).not.toContain('is-completed')
      
      await checkboxes[2].trigger('click') // child 2
      await nextTick()
      expect(wrapper.findAll('.task-item')[0].classes()).toContain('is-completed')
    })
  })

  describe('Add Task', () => {
    it('shows add task form when FAB is clicked', async () => {
      const wrapper = mount(App)
      const fab = wrapper.find('.fab')
      
      expect(wrapper.find('.add-task-form').exists()).toBe(false)
      
      await fab.trigger('click')
      await nextTick()
      expect(wrapper.find('.add-task-form').exists()).toBe(true)
    })

    it('adds a new task when form is submitted', async () => {
      const wrapper = mount(App)
      await wrapper.find('.fab').trigger('click')
      await nextTick()
      
      const input = wrapper.find('.add-task-input')
      await input.setValue('New Task')
      await wrapper.find('.add-task-form').trigger('submit')
      await nextTick()
      
      const taskItems = wrapper.findAll('.task-item')
      expect(taskItems[taskItems.length - 1].text()).toContain('New Task')
    })
  })

  describe('List Selection', () => {
    it('opens list selector when header is clicked', async () => {
      const wrapper = mount(App)
      expect(wrapper.find('.list-selector-menu').exists()).toBe(false)
      
      await wrapper.find('.header-content').trigger('click')
      await nextTick()
      expect(wrapper.find('.list-selector-menu').exists()).toBe(true)
    })

    it('creates a new list from selector', async () => {
      const wrapper = mount(App)
      await wrapper.find('.header-content').trigger('click')
      await nextTick()
      
      await wrapper.find('.create-list-button').trigger('click')
      await nextTick()
      
      expect(wrapper.find('.title').text()).toBe('新しいリスト')
      expect(wrapper.findAll('.task-item').length).toBe(0)
    })

    it('renames a list through the management UI', async () => {
      const wrapper = mount(App)
      await wrapper.find('.header-content').trigger('click')
      await nextTick()
      
      // Toggle management mode
      await wrapper.find('.manage-toggle-button').trigger('click')
      await nextTick()
      
      // Click edit button
      await wrapper.find('.edit-list-button').trigger('click')
      await nextTick()
      
      const input = wrapper.find('.edit-list-input')
      await input.setValue('Renamed List')
      await input.trigger('blur')
      await nextTick()
      
      expect(wrapper.find('.title').text()).toBe('Renamed List')
    })

    it('deletes a list through the management UI', async () => {
      // Mock confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      
      const wrapper = mount(App)
      // Create a second list so we can delete one without it being the last one (for simpler test)
      await wrapper.find('.header-content').trigger('click')
      await nextTick()
      await wrapper.find('.create-list-button').trigger('click')
      await nextTick()
      
      expect(wrapper.find('.title').text()).toBe('新しいリスト')
      
      await wrapper.find('.header-content').trigger('click')
      await nextTick()
      await wrapper.find('.manage-toggle-button').trigger('click')
      await nextTick()
      
      // Delete the active list (which is the new one)
      const deleteButtons = wrapper.findAll('.delete-list-button')
      await deleteButtons[1].trigger('click')
      await nextTick()
      
      expect(confirmSpy).toHaveBeenCalled()
      expect(wrapper.find('.title').text()).toBe('Routine') // Switched back to first list
      
      confirmSpy.mockRestore()
    })
  })

  describe('Persistence', () => {
    it('saves state to localStorage when a task is toggled', async () => {
      const setItemSpy = vi.spyOn(localStorageMock, 'setItem')
      const wrapper = mount(App)
      
      await wrapper.find('.checkbox').trigger('click')
      await nextTick()
      
      expect(setItemSpy).toHaveBeenCalledWith('loop-list-state', expect.any(String))
      setItemSpy.mockRestore()
    })

    it('loads state from localStorage on initialization', async () => {
      const mockState = {
        lists: [
          { id: 'l1', name: 'Mock List', tasks: [{ id: 'm1', text: 'Mock Task', completed: true, indent: 0 }] }
        ],
        activeListId: 'l1'
      }
      localStorageMock.setItem('loop-list-state', JSON.stringify(mockState))
      
      const wrapper = mount(App)
      await nextTick()
      
      const taskItems = wrapper.findAll('.task-item')
      expect(taskItems.length).toBe(1)
      expect(taskItems[0].text()).toContain('Mock Task')
      expect(taskItems[0].classes()).toContain('is-completed')
      
      vi.restoreAllMocks()
    })
  })
})
