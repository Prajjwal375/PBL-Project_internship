import { getAssistantResponse, getProgramReview, getGrantReport, getFilterOptions } from "@/lib/program-intelligence";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    prompt?: string;
    month?: string;
    district?: string;
    block?: string;
    grantId?: string;
  };

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(getAssistantResponse(body));
  }

  try {
    const review = getProgramReview({
      month: body.month,
      district: body.district,
      block: body.block,
    });

    const grant = body.grantId ? getGrantReport(body.grantId, body.month) : null;
    getFilterOptions(); // keep unused call to maintain logic if expected

    const topDistricts = review.districts.top.slice(0, 5)
      .map(d => `${d.name} (${d.attendanceRate}% - ${d.riskStatus})`)
      .join("\n");
    
    const bottomDistricts = review.districts.bottom.slice(0, 5)
      .map(d => `${d.name} (${d.attendanceRate}% - ${d.riskStatus})`)
      .join("\n");

    const topSchools = review.schools.top.slice(0, 5)
      .map(s => `${s.school} in ${s.district} (${s.attendanceRate}%)`)
      .join("\n");

    const atRiskSchools = review.schools.bottom.slice(0, 5)
      .map(s => `${s.school} in ${s.district} (${s.attendanceRate}% - ${s.riskStatus})`)
      .join("\n");

    const grantDataStr = grant 
      ? `Narrative: ${grant.narrative}\nFacts: ${grant.sourceFacts.join(", ")}`
      : "No grant data selected.";

    const systemPrompt = `You are PBL Intelligence Assistant for Mantra4Change, an educational NGO. You analyze Project-Based Learning (PBL) program data from schools across India.

You have access to real program data from CSV files:
- 3 months of data: July 2025, August 2025, September 2025
- 2300+ school records per month
- Risk classification: On Track (>=75%), Behind (>=60%), At Risk (>=35%), Critical (<35%)

CURRENT PROGRAM DATA:
- Total Schools: ${review.metrics.totalSchools}
- Participating Schools: ${review.metrics.participatingSchools}
- Participation Rate: ${review.metrics.participationRate}%
- Evidence Submitted: ${review.metrics.evidenceSubmitted}
- Evidence Rate: ${review.metrics.evidenceRate}%
- Attendance Rate: ${review.metrics.attendanceRate}%
- Risk Status: ${review.metrics.riskStatus}
- Latest Month: ${review.latestMonth}

TOP DISTRICTS:
${topDistricts || "None"}

BOTTOM DISTRICTS (need attention):
${bottomDistricts || "None"}

TOP SCHOOLS:
${topSchools || "None"}

AT RISK SCHOOLS:
${atRiskSchools || "None"}

PROGRAM SUMMARY:
Achievements: ${review.summary.achievements.join(" ")}
Risks: ${review.summary.risks.join(" ")}
Discussion Points: ${review.summary.discussionPoints.join(" ")}

GRANT DATA (if available):
${grantDataStr}

RULES:
- Only answer based on the data provided above
- Never invent school names, numbers, or districts not in the data
- Always cite specific numbers from the data in your answers
- Keep answers concise and actionable (3-5 sentences max)
- If asked about something not in the data, say so clearly

You must return ONLY a JSON object with this exact format:
{
  "answer": "Your detailed response text here",
  "facts": ["Fact 1", "Fact 2"],
  "references": ["District A", "School B"]
}`;

    let response;
    let retries = 3;
    let lastError = "";

    while (retries > 0) {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: body.prompt || "Hello" }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        }),
      });

      if (response.ok) {
        break;
      }

      lastError = `${response.status} ${response.statusText}`;
      if (response.status === 503 || response.status === 429) {
        retries--;
        if (retries > 0) {
          // Wait 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
      break;
    }

    if (!response || !response.ok) {
      throw new Error(`Gemini API error: ${lastError}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (resultText) {
      return Response.json(JSON.parse(resultText));
    }

    throw new Error("Invalid response structure from Gemini");
  } catch (error) {
    console.error("AI Error:", error);
    return Response.json(getAssistantResponse(body));
  }
}
