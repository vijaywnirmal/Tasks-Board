"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskColumn } from "@/components/task-column"
import { TaskForm } from "@/components/task-form"
import { ClientForm } from "@/components/client-form"
import { ClientBadge } from "@/components/client-badge"
import { EditClientForm } from "@/components/edit-client-form"
import { EditTaskForm } from "@/components/edit-task-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export type Client = {
  id: string
  name: string
  color: string
}

export type Task = {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed"
  clientId: string | null
  reviewed: "yes" | "no" | null
}

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load tasks from localStorage on initial render
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("kanban-tasks")
      return savedTasks ? JSON.parse(savedTasks) : []
    }
    return []
  })

  const [clients, setClients] = useState<Client[]>(() => {
    // Load clients from localStorage on initial render
    if (typeof window !== "undefined") {
      const savedClients = localStorage.getItem("kanban-clients")
      return savedClients ? JSON.parse(savedClients) : []
    }
    return []
  })

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kanban-tasks", JSON.stringify(tasks))
    }
  }, [tasks])

  // Save clients to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kanban-clients", JSON.stringify(clients))
    }
  }, [clients])

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

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

  const updateTaskReviewStatus = (taskId: string, reviewed: "yes" | "no" | null) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, reviewed } : task)))
  }

  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    const task = tasks.find((t) => t.id === taskId)

    if (newStatus === "completed" && (!task?.reviewed || task.reviewed === "no")) {
      alert("Task must be reviewed and marked as 'Yes' before moving to Completed")
      return
    }

    if (task?.status === "completed") {
      alert("Completed tasks cannot be moved back to earlier stages")
      return
    }

    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  // New function to edit a client
  const editClient = (updatedClient: Client) => {
    setClients(clients.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
    setEditingClient(null)
  }

  // New function to delete a client
  const deleteClient = (clientId: string) => {
    setClients(clients.filter((client) => client.id !== clientId))
    // Update tasks that were assigned to this client
    setTasks(tasks.map((task) => (task.clientId === clientId ? { ...task, clientId: null } : task)))
    setDeletingClient(null)
  }

  // New function to edit a task
  const editTask = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setEditingTask(null)
  }

  // New function to delete a task
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    setDeletingTask(null)
  }

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const getClientById = (clientId: string | null) => {
    if (!clientId) return null
    return clients.find((client) => client.id === clientId) || null
  }

  // Function to check if all tasks for a client are completed
  const areAllClientTasksCompleted = (clientId: string) => {
    const clientTasks = tasks.filter((task) => task.clientId === clientId)
    return clientTasks.length > 0 && clientTasks.every((task) => task.status === "completed")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <h2 className="text-lg font-medium">Clients:</h2>
          {clients.map((client) => (
            <ClientBadge
              key={client.id}
              client={client}
              allTasksCompleted={areAllClientTasksCompleted(client.id)}
              onEdit={() => setEditingClient(client)}
              onDelete={() => setDeletingClient(client)}
            />
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
          onEditTask={setEditingTask}
          onDeleteTask={setDeletingTask}
        />
        <TaskColumn
          title="In Progress"
          tasks={getTasksByStatus("in-progress")}
          clients={clients}
          getClientById={getClientById}
          onStatusChange={updateTaskStatus}
          onReviewChange={updateTaskReviewStatus}
          onEditTask={setEditingTask}
          onDeleteTask={setDeletingTask}
        />
        <TaskColumn
          title="Completed"
          tasks={getTasksByStatus("completed")}
          clients={clients}
          getClientById={getClientById}
          onStatusChange={updateTaskStatus}
          onReviewChange={updateTaskReviewStatus}
          onEditTask={setEditingTask}
          onDeleteTask={setDeletingTask}
        />
      </div>

      {showTaskForm && <TaskForm clients={clients} onSubmit={addTask} onCancel={() => setShowTaskForm(false)} />}

      {showClientForm && <ClientForm onSubmit={addClient} onCancel={() => setShowClientForm(false)} />}

      {editingClient && (
        <EditClientForm client={editingClient} onSubmit={editClient} onCancel={() => setEditingClient(null)} />
      )}

      {editingTask && (
        <EditTaskForm task={editingTask} clients={clients} onSubmit={editTask} onCancel={() => setEditingTask(null)} />
      )}

      {/* Client deletion confirmation dialog */}
      {deletingClient && (
        <AlertDialog open={!!deletingClient} onOpenChange={() => setDeletingClient(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Client</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletingClient.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteClient(deletingClient.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Task deletion confirmation dialog */}
      {deletingTask && (
        <AlertDialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingTask.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteTask(deletingTask.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
