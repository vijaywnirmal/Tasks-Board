import { KanbanBoard } from "@/components/kanban-board"

export default function Home() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">TASK MANAGEMENT BOARD</h1>
      <KanbanBoard />
    </div>
  )
}
