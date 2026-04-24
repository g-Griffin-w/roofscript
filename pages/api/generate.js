import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { jobType, amount, material, scriptType, tone, notes } = req.body;

  if (!jobType || !material || !scriptType || !tone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prompt = `You are an expert roofing sales coach with 20 years of experience training top-performing roofers. Write a realistic, natural-sounding ${scriptType} sales script.

Job details:
- Job type: ${jobType}
- Estimate amount: ${amount || "not specified"}
- Material: ${material}
- Tone: ${tone}
${notes ? `- Situation notes: ${notes}` : ""}

Rules:
- Write ONLY the script itself. Zero intro, zero label, zero explanation.
- Sound like a real human talking — not corporate, not robotic.
- Use line breaks between speaking parts or sections.
- Keep it tight, punchy, and closeable.
- If it's a text message, keep it under 160 characters.
- If it's an objection handler, address the objection directly then pivot to close.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const script = message.content[0].text;
    return res.status(200).json({ script });
  } catch (error) {
    console.error("Anthropic error:", error);
    return res.status(500).json({ error: "Failed to generate script. Try again." });
  }
}
