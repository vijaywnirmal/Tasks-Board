"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ClientBadge } from "@/components/client-badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Calendar } from "lucide-react"
import { format, parseISO, isBefore, addDays } from "date-fns"
import type { Client, Task } from "@/lib/db"

interface TaskCardProps {
  task: Task
  client: Client | null
  onReviewChange: (taskId: string, reviewed: "yes" | "no" | null) => void
  columnTitle: string
  onEdit: () => void
  onDelete: () => void
}

export function TaskCard({ task, client, onReviewChange, columnTitle, onEdit, onDelete }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId)
  }

  // Only allow dragging if not in completed column
  const isDraggable = task.status !== "completed"
  const isCompleted = columnTitle === "Completed"

  // Due date status
  const getDueDateStatus = () => {
    if (!task.dueDate) return null

    const dueDate = parseISO(task.dueDate)
    const today = new Date()
    const tomorrow = addDays(today, 1)

    if (isBefore(dueDate, today)) {
      return "overdue"
    } else if (isBefore(dueDate, tomorrow)) {
      return "due-today"
    } else if (isBefore(dueDate, addDays(today, 3))) {
      return "due-soon"
    }
    return "upcoming"
  }

  const dueDateStatus = getDueDateStatus()

  const getDueDateColor = () => {
    switch (dueDateStatus) {
      case "overdue":
        return "text-red-500"
      case "due-today":
        return "text-orange-500"
      case "due-soon":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Card
      className={`${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && handleDragStart(e, task.id)}
    >
      <CardHeader className="p-3 pb-1 flex flex-row items-start justify-between">
        <div>
          <CardTitle className={`text-base ${isCompleted ? "line-through" : ""}`}>{task.title}</CardTitle>
          {client && (
            <ClientBadge
              client={client}
              allTasksCompleted={false} // This is handled at the KanbanBoard level
              onEdit={() => {}} // These are handled at the KanbanBoard level
              onDelete={() => {}}
            />
          )}
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">Edit task</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete task</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <CardDescription>{task.description}</CardDescription>

        {task.dueDate && (
          <div className={`flex items-center mt-2 text-xs ${getDueDateColor()}`}>
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              Due: {format(parseISO(task.dueDate), "MMM d, yyyy")}
              {dueDateStatus === "overdue" && " (Overdue)"}
              {dueDateStatus === "due-today" && " (Today)"}
            </span>
          </div>
        )}
      </CardContent>

      {/* Show review options only for In Progress tasks */}
      {columnTitle === "In Progress" && (
        <CardFooter className="p-3 pt-0 flex-col items-start">
          <div className="w-full">
            <p className="text-sm font-medium mb-1">Reviewed:</p>
            <RadioGroup
              value={task.reviewed || ""}
              onValueChange={(value) => onReviewChange(task.id, value as "yes" | "no" | null)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="yes" id={`${task.id}-yes`} />
                <Label htmlFor={`${task.id}-yes`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="no" id={`${task.id}-no`} />
                <Label htmlFor={`${task.id}-no`}>No</Label>
              </div>
            </RadioGroup>
          </div>
        </CardFooter>
      )}

      {/* Show review status for Completed tasks */}
      {columnTitle === "Completed" && task.reviewed === "yes" && (
        <CardFooter className="p-3 pt-0">
          <span className="text-sm text-green-600 font-medium">✓ Reviewed</span>
        </CardFooter>
      )}
    </Card>
  )
}
