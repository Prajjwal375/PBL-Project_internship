import { getGrantReport } from "@/lib/program-intelligence";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    grantId?: string;
    month?: string;
  };

  const { report } = getGrantReport(body.grantId, body.month);

  if (!report) {
    return Response.json({ error: "No report found for the selected grant and month." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // No key — return deterministic immediately, no Gemini call.
  if (!apiKey) {
    return Response.json({ narrative: report.narrative, source: "deterministic" });
  }

  const factLines = report.sourceFacts.map((f) => `- ${f}`).join("\n");

  const systemPrompt = `You are a professional grant report writer for an education NGO. Write a concise 2-4 sentence grant narrative paragraph in a professional donor-report tone. Use only the facts provided below. Never invent numbers, school names, district names, or outcomes that are not in the fact list.

SOURCE FACTS:
${factLines}

Return ONLY a JSON object in this exact format:
{
  "narrative": "Your 2-4 sentence narrative paragraph here."
}`;

  let response: Response | undefined;
  let retries = 3;
  let lastError = "";

  while (retries > 0) {
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: "Write the grant narrative." }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          }),
        },
      );

      if (response.ok) break;

      lastError = `${response.status} ${response.statusText}`;
      if (response.status === 429 || response.status === 503) {
        retries--;
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
      }
      break;
    } catch (err) {
      lastError = String(err);
      retries--;
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  try {
    if (!response || !response.ok) {
      throw new Error(`Gemini API error: ${lastError}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("Empty response from Gemini");

    const parsed = JSON.parse(resultText) as { narrative?: string };
    if (!parsed.narrative) throw new Error("Missing narrative in response");

    return Response.json({ narrative: parsed.narrative, source: "ai" });
  } catch {
    // Any failure falls back to the deterministic narrative — never expose an error.
    return Response.json({ narrative: report.narrative, source: "deterministic" });
  }
}
