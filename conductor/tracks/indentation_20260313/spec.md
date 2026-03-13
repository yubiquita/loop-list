# Specification: Indentation Feature (Swipe to Indent)

## Overview
Implement a hierarchical list structure where users can indent items to create a parent-child relationship. This feature is based on the logic and UI found in `ref/loop-list-mock.jsx` and will be implemented using Vue 3.

## Functional Requirements
- **Hierarchical Structure:**
  - Support for two levels: Level 0 (Parent) and Level 1 (Child/Subtask).
  - The first item in the list must always be Level 0.
- **Indentation via Swipe:**
  - **Right Swipe:** Indent a Level 0 item to Level 1.
  - **Left Swipe:** Outdent a Level 1 item to Level 0.
  - Visual feedback during swipe (e.g., icons and background color changes).
- **Cascade Check Logic:**
  - Checking a parent (Level 0) automatically checks all its subsequent children (Level 1 items until the next Level 0).
  - If all children of a parent are checked, the parent is automatically checked.
  - If at least one child is unchecked, the parent is unchecked.
- **Persistence:**
  - The indentation state (`indent` level) must be saved in LocalStorage along with other task data.

## Non-Functional Requirements
- **Mobile Friendly:** Swipe interactions must be smooth and prevent accidental vertical scrolling.
- **Visual Consistency:** Use simple left padding (e.g., 2.5rem) to represent indentation, as per the mock.

## Acceptance Criteria
- Users can change an item's indentation level by swiping horizontally.
- Checking/unchecking a parent item correctly updates its children.
- The indentation state persists after a page reload.
- The UI reflects the hierarchy correctly with padding.

## Out of Scope
- Multi-level nesting beyond level 1.
- Keyboard shortcuts for indentation (Tab key).
- Drag-and-drop indentation (vertical sorting remains, but horizontal dragging for indentation is handled via swipe).
