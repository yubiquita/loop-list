# Implementation Plan: Multiple Routine Lists

## Phase 1: Core Data Structure & Migration [checkpoint: 1a92b12]
Implement the new data structure to support multiple lists and handle the initial transition.

- [x] Task: Update type definitions for multiple lists. ea71831
- [x] Task: Create a new storage utility/composable for managing multiple lists. b81d5bb
- [x] Task: Implement "Reset" logic for initial migration (as per spec). b81d5bb
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Data Structure & Migration' (Protocol in workflow.md) 1a92b12

## Phase 2: List Management Logic (CRUD)
Implement the core business logic for managing the collection of lists.

- [x] Task: Implement `createList` functionality with default naming. 24bbe0c
- [ ] Task: Implement `deleteList` functionality with active list fallback logic.
- [ ] Task: Implement `renameList` functionality.
- [ ] Task: Implement `reorderLists` functionality.
- [ ] Task: Write tests for all list management operations.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: List Management Logic (CRUD)' (Protocol in workflow.md)

## Phase 3: UI Implementation - List Switching
Build the user interface for viewing and switching between lists.

- [ ] Task: Create a Dropdown component (or update header) for list selection.
- [ ] Task: Integrate the active list state with the main task view.
- [ ] Task: Implement "Restore Last Active List" logic on app startup.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Implementation - List Switching' (Protocol in workflow.md)

## Phase 4: UI Implementation - Management Interface
Build the interface for editing the list collection.

- [ ] Task: Implement a management modal or inline editing for renaming and deleting lists.
- [ ] Task: Add drag-and-drop support for reordering lists in the management view.
- [ ] Task: Ensure mobile-friendly interactions for all list management features.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: UI Implementation - Management Interface' (Protocol in workflow.md)

## Phase 5: Final Integration & Cleanup
Polishing and ensuring everything works together.

- [ ] Task: Final end-to-end testing of the multi-list flow.
- [ ] Task: Ensure CSS styling is consistent with the project's Vanilla CSS approach.
- [ ] Task: Update any existing tests impacted by the state structure change.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Final Integration & Cleanup' (Protocol in workflow.md)
