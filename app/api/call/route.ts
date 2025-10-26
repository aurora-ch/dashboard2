import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentId, input } = body;
    
    // If agentId is provided, use it for the call
    // Otherwise fall back to the original input-based approach
    const payload = agentId 
      ? { agentId }
      : { body: { input: input || "" } };

    const webhookUrl = process.env.N8N_WEBHOOK_URL!;
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: "Call initiated successfully"
    });

      } catch (error: unknown) {
        console.error("Call error:", error);
        return NextResponse.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Failed to initiate call"
          },
          { status: 500 }
        );
      }
}


