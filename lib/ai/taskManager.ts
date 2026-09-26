import { AIModelTask } from "@/types/scene";

// In-memory task tracker for AI jobs
const tasksMap = new Map<string, AIModelTask>();

export function createTask(promptHint?: string, previewImage?: string): AIModelTask {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const task: AIModelTask = {
    taskId,
    status: "PROCESSING",
    progress: 10,
    promptHint: promptHint || "Contemporary Alpine Retreat",
    previewImage,
    createdAt: Date.now(),
  };

  tasksMap.set(taskId, task);
  return task;
}

export function getTask(taskId: string): AIModelTask | undefined {
  const task = tasksMap.get(taskId);
  if (!task) return undefined;

  // If in mock processing mode, simulate progression over 6 seconds
  if (task.status === "PROCESSING") {
    const elapsedSeconds = (Date.now() - task.createdAt) / 1000;
    if (elapsedSeconds >= 6) {
      task.status = "SUCCEEDED";
      task.progress = 100;
      task.modelUrl = "/models/sample_cabin.glb";
    } else {
      task.progress = Math.min(95, Math.floor(15 + (elapsedSeconds / 6) * 80));
    }
  }

  return task;
}

export function updateTask(taskId: string, updates: Partial<AIModelTask>) {
  const task = tasksMap.get(taskId);
  if (task) {
    Object.assign(task, updates);
  }
}
