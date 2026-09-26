import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/ai/taskManager";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { imageUrl, promptHint, polycount = 25000 } = body;

    const meshyApiKey = process.env.MESHY_API_KEY;

    // If real Meshy API key is configured, dispatch directly to Meshy
    if (meshyApiKey && imageUrl) {
      const response = await fetch("https://api.meshy.ai/openapi/v1/image-to-3d", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${meshyApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageUrl,
          ai_model: "meshy-t2",
          topology: "triangle",
          target_polycount: polycount,
          should_remesh: true,
          enable_pbr: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.message || "Meshy API dispatch error" },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({
        taskId: data.result,
        estimatedTimeSeconds: 60,
        provider: "meshy",
      });
    }

    // High-performance Mock Engine Fallback (Instant testing without paid API keys)
    const task = createTask(promptHint, imageUrl);

    return NextResponse.json({
      taskId: task.taskId,
      estimatedTimeSeconds: 6,
      provider: "mock",
    });
  } catch (error) {
    console.error("Task dispatch error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch 3D generation task" },
      { status: 500 }
    );
  }
}
