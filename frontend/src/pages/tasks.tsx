import { useState, useMemo } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"
import type { Task, TaskStatus } from "@/store/useAppStore"

interface Column {
  id: TaskStatus
  label: string
}

const columns: Column[] = [
  { id: "todo", label: "To do" },
  { id: "in-progress", label: "In progress" },
  { id: "in-review", label: "In review" },
  { id: "done", label: "Done" },
]

const priorityStyles = {
  LOW: { dot: "bg-text-tertiary", text: "text-text-secondary", bg: "bg-bg-card-hover" },
  MEDIUM: { dot: "bg-status-at-risk", text: "text-status-at-risk", bg: "bg-status-at-risk/10" },
  HIGH: { dot: "bg-status-overdue", text: "text-status-overdue", bg: "bg-status-overdue/10" },
}

function getOwnerInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("")
}

function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${task.status}-${task.id}`, data: { task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease-out, box-shadow 250ms ease-out, opacity 250ms ease-out",
  }

  const p = priorityStyles[task.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-2xl border border-border-subtle bg-bg-card p-5 cursor-grab active:cursor-grabbing transition-all duration-200 ease-out hover:shadow-md",
        isDragging && "opacity-40 shadow-xl ring-2 ring-accent-primary scale-[1.02]"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-text-tertiary">{task.id}</span>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium", p.bg, p.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", p.dot)} />
          {task.priority}
        </span>
      </div>
      <p className="text-sm font-medium text-text-primary mb-3 leading-relaxed">{task.title}</p>
      <div className="text-xs text-accent-primary font-mono mb-4">{task.obligation}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-tertiary">{task.due}</span>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-secondary/20 text-[9px] font-medium text-accent-secondary">{getOwnerInitials(task.owner)}</div>
          <span className="text-xs text-text-secondary">{task.owner}</span>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  const p = priorityStyles[task.priority]

  return (
    <div className="rounded-2xl border border-accent-primary/50 bg-bg-card p-5 cursor-grabbing shadow-2xl ring-2 ring-accent-primary scale-[1.03] transition-transform duration-200 ease-out">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-text-tertiary">{task.id}</span>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium", p.bg, p.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", p.dot)} />
          {task.priority}
        </span>
      </div>
      <p className="text-sm font-medium text-text-primary mb-3 leading-relaxed">{task.title}</p>
      <div className="text-xs text-accent-primary font-mono mb-4">{task.obligation}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-tertiary">{task.due}</span>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-secondary/20 text-[9px] font-medium text-accent-secondary">{getOwnerInitials(task.owner)}</div>
          <span className="text-xs text-text-secondary">{task.owner}</span>
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const { tasks, moveTask } = useAppStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      "todo": [],
      "in-progress": [],
      "in-review": [],
      "done": [],
    }
    tasks.forEach(t => {
      grouped[t.status].push(t)
    })
    return grouped
  }, [tasks])

  const findTaskById = (id: string) => {
    for (const task of tasks) {
      if (`${task.status}-${task.id}` === id) return task
    }
    return null
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeTask = findTaskById(String(active.id))
    if (!activeTask) return

    let overColumnId: TaskStatus | null = null
    const overTask = findTaskById(String(over.id))

    if (overTask) {
      overColumnId = overTask.status
    } else {
      overColumnId = String(over.id) as TaskStatus
    }

    if (!columns.find(c => c.id === overColumnId)) return

    if (activeTask.status !== overColumnId) {
      moveTask(activeTask.id, overColumnId)
    } else {
      const oldIndex = tasksByColumn[activeTask.status].findIndex(t => t.id === activeTask.id)
      const newIndex = overTask
        ? tasksByColumn[overColumnId].findIndex(t => t.id === overTask.id)
        : tasksByColumn[overColumnId].length

      if (oldIndex !== newIndex) {
        const columnTasks = [...tasksByColumn[activeTask.status]]
        const reordered = arrayMove(columnTasks, oldIndex, newIndex)
        reordered.forEach((t, i) => {
          if (t.id !== tasksByColumn[activeTask.status][i]?.id) {
            // Just trigger a move to same status to reorder
          }
        })
      }
    }
  }

  const activeTask = activeId ? findTaskById(activeId) : null

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Tasks</h1>
          <p className="mt-2 text-sm text-text-secondary">Workstreams tied to obligations, evidence collection and reviews.</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" />New task</Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-4 gap-6 min-w-[800px]">
            {columns.map((col) => (
              <div key={col.id} className="space-y-4">
                <div className="flex items-center gap-2.5 px-1">
                  <span className="text-sm font-medium text-text-primary">{col.label}</span>
                  <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-bg-card-hover px-2 text-[10px] font-medium text-text-secondary">{tasksByColumn[col.id].length}</span>
                </div>
                <SortableContext items={tasksByColumn[col.id].map(t => `${t.status}-${t.id}`)} strategy={verticalListSortingStrategy}>
                  <div id={col.id} className="min-h-[200px] space-y-4 rounded-2xl border border-dashed border-border-subtle bg-bg-card/30 p-3 transition-colors hover:bg-bg-card/50">
                    {tasksByColumn[col.id].map((task) => (
                      <SortableTaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
