import { supabase } from "./supabase"

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
  dueDate: string | null // ISO string format
}

// Client CRUD operations
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase.from("clients").select("*").order("name")

  if (error) {
    console.error("Error fetching clients:", error)
    return []
  }

  return data.map((client) => ({
    id: client.id,
    name: client.name,
    color: client.color,
  }))
}

export async function createClient(client: Omit<Client, "id">): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .insert([
      {
        name: client.name,
        color: client.color,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating client:", error)
    return null
  }

  return {
    id: data[0].id,
    name: data[0].name,
    color: data[0].color,
  }
}

export async function updateClient(client: Client): Promise<boolean> {
  const { error } = await supabase
    .from("clients")
    .update({
      name: client.name,
      color: client.color,
    })
    .eq("id", client.id)

  if (error) {
    console.error("Error updating client:", error)
    return false
  }

  return true
}

export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase.from("clients").delete().eq("id", id)

  if (error) {
    console.error("Error deleting client:", error)
    return false
  }

  return true
}

// Task CRUD operations
export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from("tasks").select("*")

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return data.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.status as Task["status"],
    clientId: task.client_id,
    reviewed: task.reviewed as Task["reviewed"],
    dueDate: task.due_date,
  }))
}

export async function createTask(task: Omit<Task, "id">): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        title: task.title,
        description: task.description,
        status: task.status,
        client_id: task.clientId,
        reviewed: task.reviewed,
        due_date: task.dueDate,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating task:", error)
    return null
  }

  return {
    id: data[0].id,
    title: data[0].title,
    description: data[0].description || "",
    status: data[0].status,
    clientId: data[0].client_id,
    reviewed: data[0].reviewed,
    dueDate: data[0].due_date,
  }
}

export async function updateTask(task: Task): Promise<boolean> {
  const { error } = await supabase
    .from("tasks")
    .update({
      title: task.title,
      description: task.description,
      status: task.status,
      client_id: task.clientId,
      reviewed: task.reviewed,
      due_date: task.dueDate,
    })
    .eq("id", task.id)

  if (error) {
    console.error("Error updating task:", error)
    return false
  }

  return true
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    console.error("Error deleting task:", error)
    return false
  }

  return true
}

// Generate a random distinct color
export function generateRandomColor(existingColors: string[] = []): string {
  const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
  const saturation = 65 // Fixed saturation
  const lightness = 55 // Fixed lightness

  // Filter out hues that are too close to existing colors
  const usedHues = existingColors.map((color) => {
    const hex = color.replace("#", "")
    const r = Number.parseInt(hex.substr(0, 2), 16) / 255
    const g = Number.parseInt(hex.substr(2, 2), 16) / 255
    const b = Number.parseInt(hex.substr(4, 2), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)

    let h = 0

    if (max === min) {
      h = 0
    } else if (max === r) {
      h = 60 * ((g - b) / (max - min)) + (g < b ? 360 : 0)
    } else if (max === g) {
      h = 60 * ((b - r) / (max - min)) + 120
    } else {
      h = 60 * ((r - g) / (max - min)) + 240
    }

    return Math.round(h)
  })

  // Find available hues
  const availableHues = hues.filter((hue) => {
    return !usedHues.some((usedHue) => Math.abs(usedHue - hue) < 30 || Math.abs(usedHue - hue) > 330)
  })

  // If no available hues, just pick a random one
  const hue =
    availableHues.length > 0
      ? availableHues[Math.floor(Math.random() * availableHues.length)]
      : hues[Math.floor(Math.random() * hues.length)]

  // Convert HSL to HEX
  const h = hue / 360
  const s = saturation / 100
  const l = lightness / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
