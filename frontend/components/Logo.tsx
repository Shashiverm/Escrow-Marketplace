"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  clickable?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 26, font: "1.05rem", gap: "8px" },
  md: { icon: 34, font: "1.25rem", gap: "10px" },
  lg: { icon: 44, font: "1.5rem", gap: "12px" },
  xl: { icon: 56, font: "2rem", gap: "14px" },
};

export function Logo({
  size = "md",
  showText = true,
  clickable = true,
  className = "",
}: LogoProps) {
  const dimensions = SIZE_MAP[size] || SIZE_MAP.md;

  const logoMark = (
    <div
      className={`logo-mark-wrapper ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: dimensions.gap,
        userSelect: "none",
      }}
    >
      <div
        className="logo-icon-svg"
        style={{
          width: dimensions.icon,
          height: dimensions.icon,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: "drop-shadow(0 2px 8px rgba(245, 158, 11, 0.35))",
          flexShrink: 0,
        }}
      >
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="stellar-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <linearGradient id="stellar-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>

          {/* Shield Outline */}
          <path
            d="M50 10 L82 24 V50 C82 70 68 86 50 92 C32 86 18 70 18 50 V24 L50 10 Z"
            fill="rgba(245, 158, 11, 0.12)"
            stroke="url(#stellar-shield-grad)"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Inner Geometric Shield Accent */}
          <path
            d="M50 22 L72 32 V48 C72 63 62 76 50 81 C38 76 28 63 28 48 V32 L50 22 Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Precision 4-Point Star Core */}
          <path
            d="M50 32 Q50 50 68 50 Q50 50 50 68 Q50 50 32 50 Q50 50 50 32 Z"
            fill="url(#stellar-star-grad)"
          />

          {/* Core Center Dot */}
          <circle cx="50" cy="50" r="3.5" fill="#090b10" />
        </svg>
      </div>

      {showText && (
        <span
          className="logo-text"
          style={{
            fontSize: dimensions.font,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "var(--text-primary, #f8fafc)",
          }}
        >
          Stellar<span style={{ color: "var(--gold-light)" }}>Escrow</span>
        </span>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
        {logoMark}
      </Link>
    );
  }

  return logoMark;
}
