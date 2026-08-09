/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface CareerOSLogoProps {
  className?: string;
}

export function CareerOSLogo({ className = "w-5 h-5 text-[#7C5CFF]" }: CareerOSLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 3 clean nested geometric pillars representing layers of CareerOS and upward/forward career trajectory */}
      <rect
        x="3"
        y="14"
        width="4.5"
        height="6"
        rx="1"
        fill="currentColor"
        className="opacity-40"
      />
      <rect
        x="9.75"
        y="9"
        width="4.5"
        height="11"
        rx="1"
        fill="currentColor"
        className="opacity-75"
      />
      <rect
        x="16.5"
        y="4"
        width="4.5"
        height="16"
        rx="1"
        fill="currentColor"
      />
    </svg>
  );
}
