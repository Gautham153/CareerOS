import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parseResumeIntoSections } from "../src/server/geminiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { text } = req.body || {};

    if (!text) {
      res.status(400).json({ error: "Missing required parameter: text is required." });
      return;
    }

    const sections = await parseResumeIntoSections(text);
    res.status(200).json(sections);
  } catch (error: any) {
    console.error("Vercel /api/parse-sections error:", error);
    res.status(500).json({ error: error.message || "An error occurred during section parsing." });
  }
}
