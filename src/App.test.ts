import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
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
  })

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

  describe('Parent-Child Logic', () => {
    it('checks all child tasks when parent task is checked', async () => {
      const wrapper = mount(App)
      const taskItems = wrapper.findAll('.task-item')
      
      // t1 is parent (0), t2 and t3 are children (1)
      const parentCheckbox = taskItems[0].find('.checkbox')
      
      await parentCheckbox.trigger('click')
      
      expect(taskItems[0].classes()).toContain('is-completed') // t1
      expect(taskItems[1].classes()).toContain('is-completed') // t2
      expect(taskItems[2].classes()).toContain('is-completed') // t3
      
      // Uncheck parent
      await parentCheckbox.trigger('click')
      expect(taskItems[0].classes()).not.toContain('is-completed')
      expect(taskItems[1].classes()).not.toContain('is-completed')
      expect(taskItems[2].classes()).not.toContain('is-completed')
    })

    it('checks parent task when all child tasks are checked', async () => {
      const wrapper = mount(App)
      const taskItems = wrapper.findAll('.task-item')
      
      // t2 and t3 are children of t1
      const child1Checkbox = taskItems[1].find('.checkbox')
      const child2Checkbox = taskItems[2].find('.checkbox')
      
      await child1Checkbox.trigger('click')
      expect(taskItems[0].classes()).not.toContain('is-completed') // parent still unchecked
      
      await child2Checkbox.trigger('click')
      expect(taskItems[0].classes()).toContain('is-completed') // parent now checked
    })

    it('unchecks parent task when a child task is unchecked', async () => {
      const wrapper = mount(App)
      const taskItems = wrapper.findAll('.task-item')
      
      // Initial: check parent (and thus children)
      await taskItems[0].find('.checkbox').trigger('click')
      expect(taskItems[0].classes()).toContain('is-completed')
      
      // Uncheck one child
      await taskItems[1].find('.checkbox').trigger('click')
      expect(taskItems[1].classes()).not.toContain('is-completed')
      expect(taskItems[0].classes()).not.toContain('is-completed') // parent should be unchecked
    })
  })

  describe('Add Task', () => {
    it('shows add task form when FAB is clicked', async () => {
      const wrapper = mount(App)
      const fab = wrapper.find('.fab')
      
      expect(wrapper.find('.add-task-form').exists()).toBe(false)
      
      await fab.trigger('click')
      expect(wrapper.find('.add-task-form').exists()).toBe(true)
    })

    it('adds a new task when form is submitted', async () => {
      const wrapper = mount(App)
      await wrapper.find('.fab').trigger('click')
      
      const input = wrapper.find('.add-task-input')
      await input.setValue('New Task')
      await wrapper.find('.add-task-form').trigger('submit')
      
      const taskItems = wrapper.findAll('.task-item')
      expect(taskItems[taskItems.length - 1].text()).toContain('New Task')
      expect(wrapper.find('.add-task-form').exists()).toBe(false) // closed after add
    })
  })

  describe('Delete Task', () => {
    it('deletes a task when delete button is clicked', async () => {
      const wrapper = mount(App)
      const initialTaskCount = wrapper.findAll('.task-item').length
      
      const deleteButton = wrapper.find('.delete-button')
      await deleteButton.trigger('click')
      
      const newTaskCount = wrapper.findAll('.task-item').length
      expect(newTaskCount).toBe(initialTaskCount - 1)
    })
  })

  describe('Persistence', () => {
    it('saves tasks to localStorage when a task is toggled', async () => {
      const setItemSpy = vi.spyOn(localStorageMock, 'setItem')
      const wrapper = mount(App)
      
      await wrapper.find('.checkbox').trigger('click')
      
      expect(setItemSpy).toHaveBeenCalledWith('loop-list-tasks', expect.any(String))
      setItemSpy.mockRestore()
    })

    it('loads tasks from localStorage on initialization', async () => {
      const mockTasks = [
        { id: 'm1', text: 'Mock Task', completed: true, indent: 0 }
      ]
      vi.spyOn(localStorageMock, 'getItem').mockReturnValue(JSON.stringify(mockTasks))
      
      const wrapper = mount(App)
      const taskItems = wrapper.findAll('.task-item')
      
      expect(taskItems.length).toBe(1)
      expect(taskItems[0].text()).toContain('Mock Task')
      expect(taskItems[0].classes()).toContain('is-completed')
      
      vi.restoreAllMocks()
    })
  })
})
