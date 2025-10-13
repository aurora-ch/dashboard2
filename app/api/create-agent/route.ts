import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.address) {
      return NextResponse.json(
        { success: false, error: "Name and address are required" },
        { status: 400 }
      );
    }

    // Prepare payload matching your n8n workflow format
    const payload = {
      body: {
        input: `${body.name} - ${body.address}`,
        website: body.website || "",
        name: body.name,
        address: body.address,
        place_id: body.place_id || "",
        phone: body.phone || "",
        types: body.types || ""
      }
    };

    // Call your n8n webhook
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
    
    // Extract agent ID from n8n response
    // Adjust this based on your actual n8n response structure
    const agentId = data.agentId || data.agent_id || data.id;
    
    return NextResponse.json({
      success: true,
      agentId,
      message: "Agent created successfully",
      data
    });

      } catch (error: unknown) {
    console.error("Agent creation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create agent" 
      },
      { status: 500 }
    );
  }
}
