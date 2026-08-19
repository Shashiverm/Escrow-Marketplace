"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textGradient?: boolean;
  clickable?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 28, font: "1.1rem", gap: "6px" },
  md: { icon: 38, font: "1.35rem", gap: "10px" },
  lg: { icon: 48, font: "1.65rem", gap: "12px" },
  xl: { icon: 64, font: "2.2rem", gap: "16px" },
};

export function Logo({
  size = "md",
  showText = true,
  textGradient = true,
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
          filter: "drop-shadow(0 0 14px rgba(245, 158, 11, 0.45))",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
            {/* Solar Gold & Emerald & Violet Gradient */}
            <linearGradient
              id="stellar-escrow-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <radialGradient
              id="stellar-core-glow"
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
            </radialGradient>

            <linearGradient
              id="stellar-stroke-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Outer Shield & Frame */}
          <path
            d="M50 8 L85 24 V50 C85 71.5 70 88 50 94 C30 88 15 71.5 15 50 V24 L50 8 Z"
            fill="url(#stellar-escrow-grad)"
            fillOpacity="0.18"
            stroke="url(#stellar-escrow-grad)"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Inner Escrow Lock Ring */}
          <circle
            cx="50"
            cy="50"
            r="24"
            stroke="url(#stellar-stroke-grad)"
            strokeWidth="3"
            strokeDasharray="6 3"
          />

          {/* Central 4-Point Stellar Star */}
          <path
            d="M50 28 Q50 50 72 50 Q50 50 50 72 Q50 50 28 50 Q50 50 50 28 Z"
            fill="url(#stellar-escrow-grad)"
          />

          {/* Core Sparkle */}
          <circle cx="50" cy="50" r="5" fill="#ffffff" />

          {/* Orbital Escrow Nodes */}
          <circle cx="50" cy="18" r="3.5" fill="#fbbf24" />
          <circle cx="82" cy="50" r="3.5" fill="#10b981" />
          <circle cx="50" cy="82" r="3.5" fill="#a855f7" />
          <circle cx="18" cy="50" r="3.5" fill="#fbbf24" />
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
            color: "var(--text-primary, #ffffff)",
          }}
        >
          Stellar
          <span
            style={{
              background: textGradient
                ? "linear-gradient(135deg, #fbbf24 0%, #a855f7 100%)"
                : "none",
              WebkitBackgroundClip: textGradient ? "text" : "unset",
              WebkitTextFillColor: textGradient ? "transparent" : "inherit",
              marginLeft: "3px",
            }}
          >
            Escrow
          </span>
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
