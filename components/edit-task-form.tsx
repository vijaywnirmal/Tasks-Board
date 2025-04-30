"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react"
import type { Client, Task, Priority } from "@/lib/db"

interface EditTaskFormProps {
  task: Task
  clients: Client[]
  onSubmit: (task: Task) => void
  onCancel: () => void
}

export function EditTaskForm({ task, clients, onSubmit, onCancel }: EditTaskFormProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [clientId, setClientId] = useState<string | null>(task.clientId)
  const [priority, setPriority] = useState<Priority>(task.priority)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      ...task,
      title,
      description,
      clientId,
      priority,
    })
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Select
                value={clientId || "no-client"}
                onValueChange={(value) => setClientId(value === "no-client" ? null : value)}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-client">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority || "null"}
                onValueChange={(value) => setPriority(value === "null" ? null : (value as Priority))}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high" className="text-red-500 font-medium">
                    <div className="flex items-center">
                      <AlertOctagon className="h-4 w-4 mr-2" />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="medium" className="text-amber-500 font-medium">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="low" className="text-blue-500 font-medium">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="null">No priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
