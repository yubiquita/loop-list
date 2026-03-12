import { describe, it, expect } from 'vitest'
import { migrateFlatToNested } from '../../utils/migration'
import type { ChecklistItem } from '../../types'

describe('migration utility', () => {
  describe('migrateFlatToNested', () => {
    it('should return empty array when input is empty', () => {
      const flatItems: ChecklistItem[] = []
      const result = migrateFlatToNested(flatItems)
      expect(result).toEqual([])
    })

    it('should keep top-level items as is', () => {
      const flatItems: ChecklistItem[] = [
        { id: '1', text: 'Item 1', checked: false },
        { id: '2', text: 'Item 2', checked: true }
      ]
      const result = migrateFlatToNested(flatItems)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[0].subItems).toEqual([])
      expect(result[1].id).toBe('2')
      expect(result[1].subItems).toEqual([])
    })

    it('should nest items with indent: true under the previous top-level item', () => {
      const flatItems: ChecklistItem[] = [
        { id: '1', text: 'Parent 1', checked: false },
        { id: '2', text: 'Child 1.1', checked: false, indent: true },
        { id: '3', text: 'Child 1.2', checked: true, indent: true },
        { id: '4', text: 'Parent 2', checked: false }
      ]
      const result = migrateFlatToNested(flatItems)
      
      expect(result).toHaveLength(2)
      
      // Parent 1
      expect(result[0].id).toBe('1')
      expect(result[0].subItems).toHaveLength(2)
      expect(result[0].subItems![0].id).toBe('2')
      expect(result[0].subItems![0].indent).toBeUndefined() // Should be removed
      expect(result[0].subItems![1].id).toBe('3')
      
      // Parent 2
      expect(result[1].id).toBe('4')
      expect(result[1].subItems).toHaveLength(0)
    })

    it('should handle items that are indented but have no parent', () => {
      const flatItems: ChecklistItem[] = [
        { id: '1', text: 'Stray Child', checked: false, indent: true },
        { id: '2', text: 'Parent', checked: false }
      ]
      const result = migrateFlatToNested(flatItems)
      
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[0].indent).toBeUndefined()
      expect(result[1].id).toBe('2')
    })

    it('should correctly migrate even if subItems already exists (idempotency)', () => {
       const flatItems: ChecklistItem[] = [
        { 
          id: '1', 
          text: 'Parent', 
          checked: false, 
          subItems: [
            { id: '2', text: 'Child', checked: false }
          ] 
        }
      ]
      const result = migrateFlatToNested(flatItems)
      expect(result[0].subItems).toHaveLength(1)
      expect(result[0].subItems![0].id).toBe('2')
    })
  })
})
