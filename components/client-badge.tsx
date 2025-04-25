import type { Client } from "@/components/kanban-board"
import { Badge } from "@/components/ui/badge"

interface ClientBadgeProps {
  client: Client
}

export function ClientBadge({ client }: ClientBadgeProps) {
  return (
    <Badge
      style={{
        backgroundColor: client.color,
        color: isLightColor(client.color) ? "#000" : "#fff",
      }}
      className="font-normal"
    >
      {client.name}
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
