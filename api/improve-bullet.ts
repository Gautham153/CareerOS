import type { VercelRequest, VercelResponse } from "@vercel/node";
import { optimizeBulletPoint } from "../src/server/geminiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { bulletPoint, jobTitle, industry } = req.body || {};

    if (!bulletPoint) {
      res.status(400).json({ error: "Missing required parameter: bulletPoint is required." });
      return;
    }

    const improvedResult = await optimizeBulletPoint(bulletPoint, jobTitle, industry);
    res.status(200).json(improvedResult);
  } catch (error: any) {
    console.error("Vercel /api/improve-bullet error:", error);
    res.status(500).json({ error: error.message || "An error occurred during bullet point improvement." });
  }
}
