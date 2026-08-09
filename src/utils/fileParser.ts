/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Resolve standard PDFJS worker locally via same-origin Vite URL to bypass iframe Sandbox restrictions
// @ts-ignore
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts raw text from a PDF file.
 */
export async function parsePdfToText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.str || "")
        .join(" ");
      fullText += pageText + " ";
    }

    const cleanText = fullText.trim();
    if (cleanText.length === 0) {
      throw new Error("SCANNED_PDF");
    }

    return cleanText;
  } catch (error: any) {
    console.error("PDF client-side parsing failed:", error);
    if (error?.message === "SCANNED_PDF") {
      throw new Error("This PDF appears to contain scanned images rather than selectable text. Please upload a DOCX file or a text-based PDF.");
    }
    throw new Error(`Unable to parse PDF content: ${error?.message || "File might be corrupted or password-protected"}`);
  }
}

/**
 * Extracts raw text from a Word Document (.docx) file.
 */
export async function parseDocxToText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    const cleanText = result.value.trim();
    if (cleanText.length === 0) {
      throw new Error("The DOCX file is empty.");
    }
    return cleanText;
  } catch (error: any) {
    console.error("DOCX client-side parsing failed:", error);
    throw new Error(`Unable to parse DOCX document: ${error?.message || "Format might be standard but corrupted"}. Ensure the file format is standard Word (.docx).`);
  }
}

/**
 * Generic file parse dispatch handler.
 */
export async function extractTextFromFile(file: File): Promise<{ text: string; wordCount: number }> {
  // Enforce pre-flight validation on size
  if (file.size === 0) {
    throw new Error("The uploaded file is empty.");
  }

  const arrayBuffer = await file.arrayBuffer();
  let text = "";

  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
  const isDocx =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx");
  const isTxt = file.type === "text/plain" || file.name.endsWith(".txt");

  if (isPdf) {
    text = await parsePdfToText(arrayBuffer);
  } else if (isDocx) {
    text = await parseDocxToText(arrayBuffer);
  } else if (isTxt) {
    text = await file.text();
  } else {
    throw new Error("Unsupported file type. Please upload a standard PDF, Word (.docx), or TXT document.");
  }

  // Calculate clean word count
  const words = text.trim().split(/\s+/).filter(Boolean);
  
  return {
    text,
    wordCount: words.length,
  };
}
