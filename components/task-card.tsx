"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ClientBadge } from "@/components/client-badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { Client, Task } from "@/components/kanban-board"

interface TaskCardProps {
  task: Task
  client: Client | null
  onReviewChange: (taskId: string, reviewed: "yes" | "no" | null) => void
  columnTitle: string
}

export function TaskCard({ task, client, onReviewChange, columnTitle }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId)
  }

  // Only allow dragging if not in completed column
  const isDraggable = task.status !== "completed"

  return (
    <Card
      className={`${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && handleDragStart(e, task.id)}
    >
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-base">{task.title}</CardTitle>
        {client && <ClientBadge client={client} />}
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <CardDescription>{task.description}</CardDescription>
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
