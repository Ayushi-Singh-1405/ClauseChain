export const TASK_STATUSES = ['todo', 'in-progress', 'in-review', 'done'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface TaskColumn {
  status: TaskStatus
  label: string
  color: string
}

export const TASK_COLUMNS: TaskColumn[] = [
  { status: 'todo', label: 'To Do', color: 'bg-gray-100 dark:bg-gray-800/50' },
  { status: 'in-progress', label: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { status: 'in-review', label: 'In Review', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { status: 'done', label: 'Done', color: 'bg-green-50 dark:bg-green-900/20' },
]
