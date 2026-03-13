export interface Task {
  id: string
  text: string
  completed: boolean
  indent: number
}

export interface RoutineList {
  id: string
  name: string
  tasks: Task[]
}

export interface AppState {
  lists: RoutineList[]
  activeListId: string
}
