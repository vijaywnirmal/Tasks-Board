"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ClientBadge } from "@/components/client-badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react"
import type { Client, Task, Priority } from "@/lib/db"

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

  // Priority display
  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "high":
        return <AlertOctagon className="h-4 w-4 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "low":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case "high":
        return <span className="text-red-500 font-medium">High</span>
      case "medium":
        return <span className="text-amber-500 font-medium">Medium</span>
      case "low":
        return <span className="text-blue-500 font-medium">Low</span>
      default:
        return null
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

        {task.priority && (
          <div className="flex items-center mt-2 text-xs gap-1">
            {getPriorityIcon(task.priority)}
            <span>Priority: {getPriorityText(task.priority)}</span>
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
