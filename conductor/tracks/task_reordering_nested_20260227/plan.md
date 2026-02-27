# Implementation Plan: Task Reordering (Nested Structure)

## Phase 1: Preparation & Infrastructure (TDD Foundation)
- [x] Task: Install `vuedraggable` dependency 75a6797
- [x] Task: Update `tech-stack.md` with new library and architecture change e0cba3f
- [ ] Task: Update `types/index.ts` to reflect nested `ChecklistItem` structure
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Preparation' (Protocol in workflow.md)

## Phase 2: Data Refactoring (Store & Migration)
- [ ] Task: Create data migration utility (Flat to Nested)
- [ ] Task: Write tests for migration utility
- [ ] Task: Update `useChecklistStore` to handle nested items (CRUD operations)
- [ ] Task: Rewrite `checklist.store.test.ts` for nested structure
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Data Refactoring' (Protocol in workflow.md)

## Phase 3: UI Implementation (Nested Components & D&D)
- [ ] Task: Create a recursive `ChecklistNode` component for nested items
- [ ] Task: Integrate `vuedraggable` into `ChecklistNode`
- [ ] Task: Update `DetailScreen.vue` to use the new nested component structure
- [ ] Task: Add reordering handle UI and styling
- [ ] Task: Ensure swipe-to-indent works with nested structure
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Implementation' (Protocol in workflow.md)

## Phase 4: Final Integration & Verification
- [ ] Task: Verify end-to-end flow: Create -> Indent -> Reorder -> Persistent
- [ ] Task: Perform mobile interaction tests (touch responsiveness)
- [ ] Task: Final code cleanup and documentation update
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Integration' (Protocol in workflow.md)
