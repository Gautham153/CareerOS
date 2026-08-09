import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  res.status(200).json({ status: "ok", service: "ResumeIQ AI Backend (Vercel Serverless)" });
}
