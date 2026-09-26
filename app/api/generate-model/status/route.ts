import { NextRequest, NextResponse } from "next/server";
import { getTask } from "@/lib/ai/taskManager";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId parameter" }, { status: 400 });
    }

    const meshyApiKey = process.env.MESHY_API_KEY;

    // Check if task is managed by external Meshy provider
    if (meshyApiKey && !taskId.startsWith("task_")) {
      const response = await fetch(
        `https://api.meshy.ai/openapi/v1/image-to-3d/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${meshyApiKey}`,
          },
        }
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to fetch task from Meshy" },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({
        taskId: data.id,
        status: data.status,
        progress: data.progress || 0,
        modelUrl: data.model_urls?.glb,
        thumbnailUrl: data.thumbnail_url,
      });
    }

    // In-memory task query
    const task = getTask(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      taskId: task.taskId,
      status: task.status,
      progress: task.progress,
      modelUrl: task.modelUrl,
      promptHint: task.promptHint,
    });
  } catch (error) {
    console.error("Task status error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve task status" },
      { status: 500 }
    );
  }
}
