"use client"

import { useState, useReducer, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Client, Task } from "@/lib/db"

interface TaskFormProps {
  clients: Client[]
  onSubmit: (task: Omit<Task, "id">) => void
  onCancel: () => void
}

// Initial state and reducer for the form state management
const initialState = {
  title: '',
  description: '',
  clientId: null,
  dueDate: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    default:
      return state
  }
}

export function TaskForm({ clients, onSubmit, onCancel }: TaskFormProps) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [open, setOpen] = useState(false)

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!state.title.trim()) return

    onSubmit({
      title: state.title,
      description: state.description,
      status: "todo",
      clientId: state.clientId,
      reviewed: null,
      dueDate: state.dueDate ? state.dueDate.toISOString() : null,
    })
  }, [state, onSubmit])

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={state.title}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'title', value: e.target.value })}
                placeholder="Task title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={state.description}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
                placeholder="Task description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Select onValueChange={(value) => dispatch({ type: 'SET_FIELD', field: 'clientId', value: value === 'no-client' ? null : value })}>
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
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="dueDate"
                    type="button"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !state.dueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {state.dueDate ? format(state.dueDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={state.dueDate}
                    onSelect={(date) => {
                      dispatch({ type: 'SET_FIELD', field: 'dueDate', value: date })
                      setOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {state.dueDate && (
                <Button type="button" variant="ghost" size="sm" onClick={() => dispatch({ type: 'SET_FIELD', field: 'dueDate', value: null })} className="w-fit">
                  Clear date
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
