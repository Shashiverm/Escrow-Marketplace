"use client";

import React, { useState } from "react";

interface ContractInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  contractId?: string;
  client: string;
  freelancer?: string;
  budget: number;
  status: string;
  milestoneCount: number;
}

export function ContractInspectorModal({
  isOpen,
  onClose,
  jobId,
  contractId = "CC5QW6M35N5N36D2GVP5Y4H6W8L2K9J0X1Z...",
  client,
  freelancer,
  budget,
  status,
  milestoneCount,
}: ContractInspectorModalProps) {
  const [copiedXdr, setCopiedXdr] = useState(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"overview" | "xdr" | "storage">("overview");

  if (!isOpen) return null;

  const simulatedWasmHash = "3a8f9c1b72e50d4a982136e0bf145d29a00e84c7b209d13f";
  const simulatedLedgerSeq = 4829142;

  const mockXdr = `AAAAAG4vW1R/N4X7Z9+kQ9381k7J1vR9xP0L6W3d8s7k=
AAAAAQAAAAAAAAAAAAAAACAAAAAAAAAAAQAAAAAAAAAAAAA=
AAAAB3Nvcm9iYW4AAAAMaW5pdGlhbGl6ZQAAAAAAAAAAAA==`;

  function handleCopyXdr() {
    navigator.clipboard.writeText(mockXdr);
    setCopiedXdr(true);
    setTimeout(() => setCopiedXdr(false), 2000);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: "680px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div style={{ marginBottom: "18px" }}>
          <span className="category-pill" style={{ marginBottom: "6px" }}>
            Soroban Smart Contract Inspector
          </span>
          <h2 style={{ fontSize: "1.4rem", marginTop: "4px" }}>
            Escrow #{jobId} On-Chain State
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Ledger state footprints, WASM code hash, and contract data storage.
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "18px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveInspectorTab("overview")}
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              borderColor: activeInspectorTab === "overview" ? "var(--gold)" : "transparent",
              background: activeInspectorTab === "overview" ? "var(--gold-subtle)" : "transparent",
              color: activeInspectorTab === "overview" ? "var(--gold-light)" : "var(--text-secondary)",
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveInspectorTab("storage")}
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              borderColor: activeInspectorTab === "storage" ? "var(--gold)" : "transparent",
              background: activeInspectorTab === "storage" ? "var(--gold-subtle)" : "transparent",
              color: activeInspectorTab === "storage" ? "var(--gold-light)" : "var(--text-secondary)",
            }}
          >
            Ledger Footprint
          </button>
          <button
            onClick={() => setActiveInspectorTab("xdr")}
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              borderColor: activeInspectorTab === "xdr" ? "var(--gold)" : "transparent",
              background: activeInspectorTab === "xdr" ? "var(--gold-subtle)" : "transparent",
              color: activeInspectorTab === "xdr" ? "var(--gold-light)" : "var(--text-secondary)",
            }}
          >
            Raw XDR Payload
          </button>
        </div>

        {activeInspectorTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ background: "var(--bg-tertiary)", padding: "10px 12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Soroban Contract ID
              </span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--gold-light)", wordBreak: "break-all", marginTop: "2px" }}>
                {contractId}
              </div>
            </div>

            <div style={{ background: "var(--bg-tertiary)", padding: "10px 12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                WASM Code Hash
              </span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-primary)", wordBreak: "break-all", marginTop: "2px" }}>
                {simulatedWasmHash}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: "var(--bg-tertiary)", padding: "10px 12px", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Contract Status
                </span>
                <div style={{ fontWeight: 800, color: "var(--emerald-light)", textTransform: "uppercase", fontSize: "0.88rem", marginTop: "2px" }}>
                  {status}
                </div>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "10px 12px", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Total Escrow Budget
                </span>
                <div style={{ fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--gold-light)", fontSize: "0.88rem", marginTop: "2px" }}>
                  {budget.toLocaleString()} XLM
                </div>
              </div>
            </div>

            <div style={{ background: "var(--bg-tertiary)", padding: "10px 12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Client Address (Job Creator)
              </span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", wordBreak: "break-all", marginTop: "2px" }}>
                {client}
              </div>
            </div>

            {freelancer && (
              <div style={{ background: "var(--bg-tertiary)", padding: "10px 12px", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Assigned Developer Address
                </span>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--emerald-light)", wordBreak: "break-all", marginTop: "2px" }}>
                  {freelancer}
                </div>
              </div>
            )}
          </div>
        )}

        {activeInspectorTab === "storage" && (
          <div style={{ background: "var(--bg-tertiary)", padding: "14px", borderRadius: "var(--radius-md)", fontSize: "0.82rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: "1px solid var(--border-light)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>Storage Key</span>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>Type &amp; Value</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontFamily: "var(--font-mono)" }}>
              <span>Symbol(&quot;state&quot;)</span>
              <span style={{ color: "var(--emerald-light)" }}>U32({status === "progress" ? "1" : "0"})</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontFamily: "var(--font-mono)" }}>
              <span>Symbol(&quot;budget&quot;)</span>
              <span style={{ color: "var(--gold-light)" }}>I128({budget}0000000)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontFamily: "var(--font-mono)" }}>
              <span>Symbol(&quot;milestones&quot;)</span>
              <span>Vec({milestoneCount} items)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontFamily: "var(--font-mono)" }}>
              <span>Symbol(&quot;ledger_seq&quot;)</span>
              <span style={{ color: "var(--text-muted)" }}>{simulatedLedgerSeq}</span>
            </div>
          </div>
        )}

        {activeInspectorTab === "xdr" && (
          <div>
            <div
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "12px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                color: "var(--gold-light)",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                marginBottom: "12px",
              }}
            >
              {mockXdr}
            </div>

            <button
              onClick={handleCopyXdr}
              className="btn btn-secondary btn-sm"
              style={{ width: "100%" }}
            >
              {copiedXdr ? "✓ Copied Raw XDR to Clipboard" : "Copy XDR"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
