import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("Starting file analysis...");
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error("Google AI API key not configured");
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
      );
    }

    console.log("Processing file:", file.name, "Type:", file.type);
    const imageBytes = await file.arrayBuffer();

    // ✅ Fix: Convert ArrayBuffer to base64 without Buffer
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBytes))
    );

    const prompt = `Analyze this image for damage and rate it on a scale of 0-100% considering:
      - Surface damage
      - Structural integrity
      - Visible defects
      - Overall condition

      0-20%: Minor cosmetic damage
      21-40%: Moderate damage
      41-60%: Significant damage
      61-80%: Severe damage
      81-100%: Critical damage

      Return exactly:
      Damage percentage: [0-100]
      Confidence: [0-100]`;

    console.log("Sending request to Google AI...");
    const response = await fetch(
     `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  // ✅ Fix: use inlineData, not inline_data
                  inlineData: {
                    mimeType: file.type,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI API error:", response.status, errorText);
      throw new Error(
        `Failed to analyze image: ${response.status} ${errorText}`
      );
    }

    const result = await response.json();
    console.log("Received response from Google AI:", result);

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.candidates?.[0]?.output || // fallback
      "";

    if (!text) {
      console.error("Unexpected API response format:", result);
      throw new Error("Invalid response format from Google AI");
    }

    console.log("AI Response text:", text);

    const damageMatch = text.match(/damage percentage:?\s*(\d+)/i);
    const confidenceMatch = text.match(/confidence:?\s*(\d+)/i);

    if (!damageMatch || !confidenceMatch) {
      console.error("Failed to extract numbers from response:", text);
      throw new Error("Could not parse damage assessment from AI response");
    }

    const analysis = {
      damagePercentage: Math.min(parseInt(damageMatch[1]), 100),
      confidence: Math.min(parseInt(confidenceMatch[1]), 100),
    };

    console.log("Final analysis:", analysis);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to analyze file",
      },
      { status: 500 }
    );
  }
}
