"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskColumn } from "@/components/task-column"
import { TaskForm } from "@/components/task-form"
import { ClientForm } from "@/components/client-form"
import { ClientBadge } from "@/components/client-badge"

export type Client = {
  id: string
  name: string
  color: string
}

// Update the Task type to include reviewed property
export type Task = {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed"
  clientId: string | null
  reviewed: "yes" | "no" | null
}

// Update the initial tasks to include the reviewed property
export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Design homepage",
      description: "Create wireframes for the new homepage",
      status: "todo",
      clientId: "1",
      reviewed: null,
    },
    {
      id: "2",
      title: "Implement authentication",
      description: "Add login and signup functionality",
      status: "in-progress",
      clientId: "2",
      reviewed: null,
    },
    {
      id: "3",
      title: "Write documentation",
      description: "Document the API endpoints",
      status: "completed",
      clientId: "1",
      reviewed: "yes",
    },
  ])

  const [clients, setClients] = useState<Client[]>([
    { id: "1", name: "Acme Inc", color: "#f97316" },
    { id: "2", name: "Globex Corp", color: "#8b5cf6" },
    { id: "3", name: "Stark Industries", color: "#06b6d4" },
  ])

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)

  const addTask = (task: Omit<Task, "id">) => {
    const newTask = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
    }
    setTasks([...tasks, newTask])
    setShowTaskForm(false)
  }

  const addClient = (client: Omit<Client, "id">) => {
    const newClient = {
      ...client,
      id: Math.random().toString(36).substring(2, 9),
    }
    setClients([...clients, newClient])
    setShowClientForm(false)
  }

  // Add a function to update task review status
  const updateTaskReviewStatus = (taskId: string, reviewed: "yes" | "no" | null) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, reviewed } : task)))
  }

  // Modify the updateTaskStatus function to check if a task can be moved to completed
  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    const task = tasks.find((t) => t.id === taskId)

    // If trying to move to completed, check if reviewed
    if (newStatus === "completed" && (!task?.reviewed || task.reviewed === "no")) {
      alert("Task must be reviewed and marked as 'Yes' before moving to Completed")
      return
    }

    // If task is already completed, don't allow moving back
    if (task?.status === "completed") {
      alert("Completed tasks cannot be moved back to earlier stages")
      return
    }

    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const getClientById = (clientId: string | null) => {
    if (!clientId) return null
    return clients.find((client) => client.id === clientId) || null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <h2 className="text-lg font-medium">Clients:</h2>
          {clients.map((client) => (
            <ClientBadge key={client.id} client={client} />
          ))}
          <Button variant="outline" size="sm" onClick={() => setShowClientForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Client
          </Button>
        </div>
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn
          title="To Do"
          tasks={getTasksByStatus("todo")}
          clients={clients}
          getClientById={getClientById}
          onStatusChange={updateTaskStatus}
          onReviewChange={updateTaskReviewStatus}
        />
        <TaskColumn
          title="In Progress"
          tasks={getTasksByStatus("in-progress")}
          clients={clients}
          getClientById={getClientById}
          onStatusChange={updateTaskStatus}
          onReviewChange={updateTaskReviewStatus}
        />
        <TaskColumn
          title="Completed"
          tasks={getTasksByStatus("completed")}
          clients={clients}
          getClientById={getClientById}
          onStatusChange={updateTaskStatus}
          onReviewChange={updateTaskReviewStatus}
        />
      </div>

      {showTaskForm && <TaskForm clients={clients} onSubmit={addTask} onCancel={() => setShowTaskForm(false)} />}

      {showClientForm && <ClientForm onSubmit={addClient} onCancel={() => setShowClientForm(false)} />}
    </div>
  )
}
