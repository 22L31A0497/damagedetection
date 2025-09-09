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

    console.log("Forwarding file to Django backend...");

    // Prepare form data for Django backend
    const backendForm = new FormData();
    backendForm.append("file", file, file.name);

    // Call Django backend API
    const response = await fetch("http://127.0.0.1:8000/api/analyze/", {
      method: "POST",
      body: backendForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    // Get JSON response from Django (should contain damagePercentage + confidence)
    const result = await response.json();
    console.log("Received response from Django backend:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze file" },
      { status: 500 }
    );
  }
}
