import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Extract flow data from request
    const { flow } = await request.json()

    if (!flow) {
      return NextResponse.json({ error: "Flow data is required" }, { status: 400 })
    }

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not found in environment variables")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Construct the analysis prompt
    const prompt = `You are a process analyst and AI consultant.

Your job is to take a structured process flow (usually in JSON format) and analyze it to produce expert-level insights, summary metrics, and AI opportunity recommendations.

Your output must exactly match the schema used for the "Process Analysis" page.

⸻

🧠 You Must:
• Parse the process flow JSON, including:
  • All nodes, edges, roles, tools, durations, tags, position values
  • avgTimeSec and simulatedSources, if present
• Count and compute key metrics:
  • Total number of steps
  • Number of unique roles
  • Number of friction-tagged steps
  • Number of handoffs (when the role changes from one step to the next)
  • Number of automated steps (tagged "automated")
  • Total estimated duration in minutes
  • Total traffic volume (sum of all volume values across all simulated sources)
  • Average error rate (volume-weighted average from all simulatedSources)
• Generate combined lists of:
  • All unique roles involved
  • All unique tools used
• Identify structural patterns such as:
  • Bottlenecks (steps with both long duration and friction tags)
  • Multiple handoffs (especially between more than 2 roles)
  • Low automation (few or no "automated" tags)
  • Tool fragmentation (too many tools used relative to process size)
  • Loops or branches (multiple outgoing edges or cycles)
• Suggest AI opportunities that could meaningfully improve the process
• Factor in both structural and data-derived signals:
  • Use avgTimeSec × volume to estimate effort
  • Treat steps with high errorRate (e.g. >10%) as instability risks
• Make reasonable assumptions if input is vague or incomplete

⸻

📦 Expected Output Format

Your output must be a single JSON object under a top-level "processAnalysis" key:

{
  "processAnalysis": {
    "meta": {
      "processTitle": "string",
      "source": "string",
      "analysisDate": "YYYY-MM-DD"
    },
    "summary": {
      "metrics": {
        "stepCount": "number",
        "roleCount": "number",
        "frictionCount": "number",
        "handoffCount": "number",
        "automatedCount": "number",
        "estimatedDurationMinutes": "number",
        "totalTrafficVolume": "number",
        "avgErrorRate": "number"
      },
      "roles": ["string", "..."],
      "tools": ["string", "..."]
    },
    "insights": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "type": "delay|friction|opportunity|overlap",
        "severity": "high|medium|low",
        "icon": "alert-triangle|shuffle|grid|zap|file-text|mail|..."
      }
    ],
    "aiOpportunities": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "targetStepId": "string",
        "targetStepTitle": "string",
        "category": "automation|generation|summarization|analysis|communication|decision|classification",
        "impact": "high|medium|low",
        "icon": "zap|layers|file-text|mail|clipboard-list|..."
      }
    ]
  }
}

⸻

🧩 How to Handle Vague or Partial Input
• If fields are missing (e.g. no durations or tags), estimate based on common workflows
• If avgTimeSec is missing, infer from duration.value and unit
• If simulatedSources are missing, assume no volume/error rate insights are available
• If no automation or friction tags are given, assume a mostly manual, friction-prone baseline unless the step clearly indicates otherwise

⸻

Return ONLY the JSON response with no markdown formatting, explanations, or additional text.

Input:
${JSON.stringify(flow)}`

    // Make API call to Anthropic
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Anthropic API error:", errorData)
      return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
    }

    // Parse the response
    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      console.error("No content in Anthropic response:", data)
      return NextResponse.json({ error: "No analysis content received" }, { status: 500 })
    }

    // Parse and validate the JSON response
    try {
      const parsedContent = JSON.parse(content)

      if (parsedContent.processAnalysis) {
        console.log("Successfully parsed analysis:", parsedContent.processAnalysis)
        return NextResponse.json(parsedContent)
      } else {
        console.error("No processAnalysis in response:", parsedContent)
        return NextResponse.json({ error: "Invalid response structure" }, { status: 400 })
      }
    } catch (parseError) {
      console.error("Failed to parse Claude response:", parseError)
      console.error("Raw content:", content)
      return NextResponse.json({ error: "Invalid JSON response" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in analyze-process API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
