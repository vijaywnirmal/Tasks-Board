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
import { supabase } from "@/lib/supabase"
import {
  type Client,
  type Task,
  getClients,
  getTasks,
  createClient,
  updateClient,
  deleteClient,
  createTask,
  updateTask,
  deleteTask,
  generateRandomColor,
} from "@/lib/db"

export type { Client, Task }

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [clientsData, tasksData] = await Promise.all([getClients(), getTasks()])
      setClients(clientsData)
      setTasks(tasksData)
      setLoading(false)
    }

    loadData()

    // Set up real-time subscriptions
    const clientsSubscription = supabase
      .channel("clients-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "clients",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newClient = {
              id: payload.new.id,
              name: payload.new.name,
              color: payload.new.color,
            }
            setClients((prev) => [...prev, newClient])
          } else if (payload.eventType === "UPDATE") {
            const updatedClient = {
              id: payload.new.id,
              name: payload.new.name,
              color: payload.new.color,
            }
            setClients((prev) => prev.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
          } else if (payload.eventType === "DELETE") {
            setClients((prev) => prev.filter((client) => client.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    const tasksSubscription = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newTask = {
              id: payload.new.id,
              title: payload.new.title,
              description: payload.new.description || "",
              status: payload.new.status,
              clientId: payload.new.client_id,
              reviewed: payload.new.reviewed,
              priority: payload.new.priority,
            }
            setTasks((prev) => [...prev, newTask])
          } else if (payload.eventType === "UPDATE") {
            const updatedTask = {
              id: payload.new.id,
              title: payload.new.title,
              description: payload.new.description || "",
              status: payload.new.status,
              clientId: payload.new.client_id,
              reviewed: payload.new.reviewed,
              priority: payload.new.priority,
            }
            setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((task) => task.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      clientsSubscription.unsubscribe()
      tasksSubscription.unsubscribe()
    }
  }, [])

  const addTask = async (task: Omit<Task, "id">) => {
    const newTask = await createTask(task)
    if (newTask) {
      setTasks([...tasks, newTask])
    }
    setShowTaskForm(false)
  }

  const addClient = async (client: Omit<Client, "id">) => {
    const newClient = await createClient(client)
    if (newClient) {
      setClients([...clients, newClient])
    }
    setShowClientForm(false)
  }

  const updateTaskReviewStatus = async (taskId: string, reviewed: "yes" | "no" | null) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const updatedTask = { ...task, reviewed }
    const success = await updateTask(updatedTask)

    if (success) {
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    if (newStatus === "completed" && (!task.reviewed || task.reviewed === "no")) {
      alert("Task must be reviewed and marked as 'Yes' before moving to Completed")
      return
    }

    if (task.status === "completed") {
      alert("Completed tasks cannot be moved back to earlier stages")
      return
    }

    const updatedTask = { ...task, status: newStatus }
    const success = await updateTask(updatedTask)

    if (success) {
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
    }
  }

  const editClientHandler = async (updatedClient: Client) => {
    const success = await updateClient(updatedClient)
    if (success) {
      setClients(clients.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
    }
    setEditingClient(null)
  }

  const deleteClientHandler = async (clientId: string) => {
    const success = await deleteClient(clientId)
    if (success) {
      setClients(clients.filter((client) => client.id !== clientId))
      // Update tasks that were assigned to this client
      const updatedTasks = tasks
        .filter((task) => task.clientId === clientId)
        .map((task) => ({ ...task, clientId: null }))

      for (const task of updatedTasks) {
        await updateTask(task)
      }
    }
    setDeletingClient(null)
  }

  const editTaskHandler = async (updatedTask: Task) => {
    const success = await updateTask(updatedTask)
    if (success) {
      setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    }
    setEditingTask(null)
  }

  const deleteTaskHandler = async (taskId: string) => {
    const success = await deleteTask(taskId)
    if (success) {
      setTasks(tasks.filter((task) => task.id !== taskId))
    }
    setDeletingTask(null)
  }

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const getClientById = (clientId: string | null) => {
    if (!clientId) return null
    return clients.find((client) => client.id === clientId) || null
  }

  const areAllClientTasksCompleted = (clientId: string) => {
    const clientTasks = tasks.filter((task) => task.clientId === clientId)
    return clientTasks.length > 0 && clientTasks.every((task) => task.status === "completed")
  }

  const handleAddClient = () => {
    // Auto-generate a color for the new client
    const existingColors = clients.map((client) => client.color)
    const randomColor = generateRandomColor(existingColors)

    // Pre-fill the client form with the generated color
    setShowClientForm(true)
    return randomColor
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
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

      {showClientForm && (
        <ClientForm
          initialColor={generateRandomColor(clients.map((c) => c.color))}
          onSubmit={addClient}
          onCancel={() => setShowClientForm(false)}
        />
      )}

      {editingClient && (
        <EditClientForm client={editingClient} onSubmit={editClientHandler} onCancel={() => setEditingClient(null)} />
      )}

      {editingTask && (
        <EditTaskForm
          task={editingTask}
          clients={clients}
          onSubmit={editTaskHandler}
          onCancel={() => setEditingTask(null)}
        />
      )}

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
              <AlertDialogAction onClick={() => deleteClientHandler(deletingClient.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

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
              <AlertDialogAction onClick={() => deleteTaskHandler(deletingTask.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
