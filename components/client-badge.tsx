"use client"

import { Edit2, Trash2 } from "lucide-react"
import type { Client } from "@/components/kanban-board"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ClientBadgeProps {
  client: Client
  allTasksCompleted: boolean
  onEdit: () => void
  onDelete: () => void
}

export function ClientBadge({ client, allTasksCompleted, onEdit, onDelete }: ClientBadgeProps) {
  return (
    <Badge
      style={{
        backgroundColor: client.color,
        color: isLightColor(client.color) ? "#000" : "#fff",
      }}
      className="font-normal flex items-center gap-1 pl-2 h-7"
    >
      <span className={allTasksCompleted ? "line-through" : ""}>{client.name}</span>
      <div className="flex items-center ml-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 hover:bg-black/10 rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          <Edit2 className="h-3 w-3" />
          <span className="sr-only">Edit client</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 hover:bg-black/10 rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-3 w-3" />
          <span className="sr-only">Delete client</span>
        </Button>
      </div>
    </Badge>
  )
}

// Helper function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  // Convert hex to RGB
  const hex = color.replace("#", "")
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)

  // Calculate brightness (HSP formula)
  const brightness = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

  // Return true if color is light
  return brightness > 127.5
}
