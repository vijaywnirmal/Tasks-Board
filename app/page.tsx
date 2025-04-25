import { KanbanBoard } from "@/components/kanban-board"

export default function Home() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Task Management Board</h1>
      <KanbanBoard />
    </div>
  )
}
