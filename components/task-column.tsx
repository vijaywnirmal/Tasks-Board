import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "@/components/task-card"
import type { Client, Task } from "@/components/kanban-board"

interface TaskColumnProps {
  title: string
  tasks: Task[]
  clients: Client[]
  getClientById: (clientId: string | null) => Client | null
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void
}

export function TaskColumn({ title, tasks, clients, getClientById, onStatusChange }: TaskColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("taskId")
    onStatusChange(taskId, status)
  }

  const getStatusFromTitle = (title: string): Task["status"] => {
    if (title === "To Do") return "todo"
    if (title === "In Progress") return "in-progress"
    return "completed"
  }

  return (
    <Card className="h-full" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, getStatusFromTitle(title))}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No tasks yet</div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} client={getClientById(task.clientId)} />)
        )}
      </CardContent>
    </Card>
  )
}
