# Tech Stack - loop-list

## Core Technologies
- **Language:** TypeScript
- **Frontend Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **State Management:** Pinia
- **Libraries:**
  - `vuedraggable` (Drag-and-drop reordering, Vue 3 compatible)

## Data Architecture
- **Structure:** Nested (Recursive) checklist items.
  - Items can contain a list of `subItems`.
  - Supports hierarchical representation and group operations (e.g., moving a parent moves all children).
  - Migration from flat structure (with `indent` property) to nested structure is handled at the store level.

## Testing & Quality
- **Test Runner:** Vitest
- **Component Testing:** @vue/test-utils
- **Integration Testing:** Vitest (Scenario-based user flow automation)
- **DOM Environment:** happy-dom
- **Type Checking:** vue-tsc

## Data Persistence
- **Storage:** LocalStorage (Browser API)
- **Utility:** Custom storage wrapper with safe JSON parsing

## Future Improvements (Planned)
- UI Component Library integration
- Enhanced data synchronization/backup solutions
