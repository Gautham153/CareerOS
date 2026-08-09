import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rewriteResumeSection } from "../src/server/geminiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { sectionName, currentText, instruction, tone, estimatedScoreBefore } = req.body || {};

    if (!sectionName) {
      res.status(400).json({ error: "Missing required parameter: sectionName is required." });
      return;
    }

    const result = await rewriteResumeSection({
      sectionName,
      currentText: currentText || "",
      instruction: instruction || "Improve general wording",
      tone: tone || "professional",
      estimatedScoreBefore: estimatedScoreBefore || 70
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Vercel /api/rewrite-section error:", error);
    res.status(500).json({ error: error.message || "An error occurred during section rewrite." });
  }
}
