/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from "react";
import { useAnalysis } from "./useAnalysis";

interface UseFileParserResult {
  isDragActive: boolean;
  fileError: string | null;
  handleDragOver: (e: React.DragEvent<HTMLElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLElement>) => Promise<void>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  validateAndProcessFile: (file: File) => Promise<void>;
  resetParserState: () => void;
}

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB Limit matches reference mockup image

export function useFileParser(): UseFileParserResult {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const { analyzeResume } = useAnalysis();

  const resetParserState = useCallback(() => {
    setFileError(null);
    setIsDragActive(false);
  }, []);

  const validateAndProcessFile = useCallback(
    async (file: File) => {
      setFileError(null);

      // Validate file size (2MB max)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError("File exceeds the 2MB size limit. Please upload a compressed or smaller resume.");
        return;
      }

      // Validate file extension / mime type
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const isDocx =
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx");

      if (!isPdf && !isDocx) {
        setFileError("Invalid file type. Only standard PDF and Word (.docx) documents are supported.");
        return;
      }

      try {
        await analyzeResume(file);
      } catch (err: any) {
        setFileError(err.message || "Extraction failed. Ensure the document contains readable text layers.");
      }
    },
    [analyzeResume]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        await validateAndProcessFile(file);
      }
    },
    [validateAndProcessFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        await validateAndProcessFile(file);
      }
    },
    [validateAndProcessFile]
  );

  return {
    isDragActive,
    fileError,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    validateAndProcessFile,
    resetParserState,
  };
}
