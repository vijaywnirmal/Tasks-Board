"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientBadge } from "@/components/client-badge"
import type { Client, Task } from "@/components/kanban-board"

interface TaskCardProps {
  task: Task
  client: Client | null
}

export function TaskCard({ task, client }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId)
  }

  return (
    <Card className="cursor-grab active:cursor-grabbing" draggable onDragStart={(e) => handleDragStart(e, task.id)}>
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-base">{task.title}</CardTitle>
        {client && <ClientBadge client={client} />}
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <CardDescription>{task.description}</CardDescription>
      </CardContent>
    </Card>
  )
}
