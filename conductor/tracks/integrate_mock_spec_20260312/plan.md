# Implementation Plan: Integrate Mock-up Features

## Phase 1: Data Migration & Cascade Check (TDD)
- [ ] Task: Update checklist store to support flat structure and `indent` property.
- [ ] Task: Implement Cascade Check logic in the store (recursive update of children and parent).
- [ ] Task: Create tests for Cascade Check (parent toggle checks children, children toggle affects parent).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Data & Logic' (Protocol in workflow.md)

## Phase 2: Swipe Indent with Visual Feedback
- [ ] Task: Update `ChecklistNode.vue` to handle touch swipe events.
- [ ] Task: Add background icons and labels for swipe feedback (Indent/Outdent).
- [ ] Task: Implement indentation change logic triggered by swipe.
- [ ] Task: Write component tests for swipe interaction (mocking touch events).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Swipe Interaction' (Protocol in workflow.md)

## Phase 3: Smart Reordering (Block Move)
- [ ] Task: Implement logic to identify "blocks" (parent + its children) during drag.
- [ ] Task: Update `vuedraggable` configuration to handle block-level movement.
- [ ] Task: Ensure that reordering doesn't break the logical indentation (e.g., first item cannot be indented).
- [ ] Task: Write tests for block-level reordering.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Smart Reordering' (Protocol in workflow.md)

## Phase 4: Add Task UI & Mobile UX Polish
- [ ] Task: Improve `ListScreen.vue` and task entry form UI to match the mock's aesthetics.
- [ ] Task: Implement animations for adding/removing tasks.
- [ ] Task: Ensure smooth continuous task addition (Enter key focus management).
- [ ] Task: Final cross-browser/mobile testing and quality gates.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: UI/UX & Final' (Protocol in workflow.md)
