import { useCallback } from 'react'
import { Task } from '@/lib/db'

interface TaskColumnProps {
  title: string
  tasks: Task[]
  clients: Client[]
  getClientById: (id: string) => Client | undefined
  onStatusChange: (taskId: string, newStatus: Task['status']) => void
  onReviewChange: (taskId: string, newReview: Task['reviewed']) => void
  onEditTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

export function TaskColumn({
  title,
  tasks,
  clients,
  getClientById,
  onStatusChange,
  onReviewChange,
  onEditTask,
  onDeleteTask,
}: TaskColumnProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, status: Task["status"]) => {
      e.preventDefault()
      const taskId = e.dataTransfer.getData("taskId")
      onStatusChange(taskId, status)
    },
    [onStatusChange]
  )

  return (
    <div className="task-column">
      <h2>{title}</h2>
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, title as Task["status"])}
        className="task-list"
      >
        {tasks.map((task) => {
          const client = getClientById(task.clientId)
          return (
            <div key={task.id} className="task-item">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>{client?.name}</p>
              <button onClick={() => onEditTask(task.id)}>Edit</button>
              <button onClick={() => onDeleteTask(task.id)}>Delete</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
