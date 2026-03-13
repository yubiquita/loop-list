# Implementation Plan: Multiple Routine Lists

## Phase 1: Core Data Structure & Migration [checkpoint: 1a92b12]
Implement the new data structure to support multiple lists and handle the initial transition.

- [x] Task: Update type definitions for multiple lists. ea71831
- [x] Task: Create a new storage utility/composable for managing multiple lists. b81d5bb
- [x] Task: Implement "Reset" logic for initial migration (as per spec). b81d5bb
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Data Structure & Migration' (Protocol in workflow.md) 1a92b12

## Phase 2: List Management Logic (CRUD) [checkpoint: 8139352]
Implement the core business logic for managing the collection of lists.

- [x] Task: Implement `createList` functionality with default naming. 24bbe0c
- [x] Task: Implement `deleteList` functionality with active list fallback logic. a894ca8
- [x] Task: Implement `renameList` functionality. c2ccf8d
- [x] Task: Implement `reorderLists` functionality. 3ab2f5b
- [x] Task: Write tests for all list management operations. 3ab2f5b
- [x] Task: Conductor - User Manual Verification 'Phase 2: List Management Logic (CRUD)' (Protocol in workflow.md) 8139352

## Phase 3: UI Implementation - List Switching [checkpoint: 0970bf4]
Build the user interface for viewing and switching between lists.

- [x] Task: Create a Dropdown component (or update header) for list selection. 63439a2
- [x] Task: Integrate the active list state with the main task view. 63439a2
- [x] Task: Implement "Restore Last Active List" logic on app startup. 63439a2
- [x] Task: Conductor - User Manual Verification 'Phase 3: UI Implementation - List Switching' (Protocol in workflow.md) 0970bf4

## Phase 4: UI Implementation - Management Interface
Build the interface for editing the list collection.

- [x] Task: Implement a management modal or inline editing for renaming and deleting lists. b4b46a7
- [x] Task: Add drag-and-drop support for reordering lists in the management view. 16c64a4
- [ ] Task: Ensure mobile-friendly interactions for all list management features.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: UI Implementation - Management Interface' (Protocol in workflow.md)

## Phase 5: Final Integration & Cleanup
Polishing and ensuring everything works together.

- [ ] Task: Final end-to-end testing of the multi-list flow.
- [ ] Task: Ensure CSS styling is consistent with the project's Vanilla CSS approach.
- [ ] Task: Update any existing tests impacted by the state structure change.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Final Integration & Cleanup' (Protocol in workflow.md)
