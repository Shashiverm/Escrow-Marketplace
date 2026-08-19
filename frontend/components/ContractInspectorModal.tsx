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
  contractId = "CC5QW6M35N5N36D2GVP5Y4H6W...",
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
        style={{ maxWidth: "700px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: "20px" }}>
          <span className="category-pill" style={{ marginBottom: "8px" }}>
            Soroban Smart Contract Inspector
          </span>
          <h2 style={{ fontSize: "1.6rem", marginTop: "6px" }}>
            Contract #{jobId} Diagnostic State
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            On-chain ledger footprints, WASM code hash, and contract data storage.
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
          <button
            onClick={() => setActiveInspectorTab("overview")}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              borderColor: activeInspectorTab === "overview" ? "var(--gold)" : "transparent",
              background: activeInspectorTab === "overview" ? "var(--gold-subtle)" : "transparent",
              color: activeInspectorTab === "overview" ? "var(--gold-light)" : "var(--text-secondary)",
            }}
          >
            Protocol Overview
          </button>
          <button
            onClick={() => setActiveInspectorTab("storage")}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
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
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
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
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Soroban Contract ID
              </span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--gold-light)", wordBreak: "break-all" }}>
                {contractId}
              </div>
            </div>

            <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                WASM Code Hash
              </span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--violet-light)", wordBreak: "break-all" }}>
                {simulatedWasmHash}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Contract Status
                </span>
                <div style={{ fontWeight: 800, color: "var(--emerald-light)", textTransform: "uppercase" }}>
                  {status}
                </div>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Total Escrow Budget
                </span>
                <div style={{ fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--gold-light)" }}>
                  {budget.toLocaleString()} XLM
                </div>
              </div>
            </div>

            <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Client Address (Job Creator)
              </span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", wordBreak: "break-all" }}>
                {client}
              </div>
            </div>

            {freelancer && (
              <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Freelancer Address (Assigned)
                </span>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", wordBreak: "break-all" }}>
                  {freelancer}
                </div>
              </div>
            )}
          </div>
        )}

        {activeInspectorTab === "storage" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Ledger Sequence Number
              </span>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                Ledger #{simulatedLedgerSeq}
              </div>
            </div>

            <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Storage Entry Type
              </span>
              <div style={{ fontFamily: "var(--font-mono)", color: "var(--gold-light)" }}>
                ContractData (Persistent Storage)
              </div>
            </div>

            <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                TTL (Time to Live) Expiration
              </span>
              <div style={{ fontFamily: "var(--font-mono)", color: "var(--emerald-light)" }}>
                500,000 Ledgers Remaining (~35 days)
              </div>
            </div>
          </div>
        )}

        {activeInspectorTab === "xdr" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Base64 Envelope XDR</span>
              <button className="btn btn-secondary" style={{ padding: "4px 12px", fontSize: "0.75rem" }} onClick={handleCopyXdr}>
                {copiedXdr ? "✓ Copied XDR" : "📋 Copy XDR"}
              </button>
            </div>
            <pre
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                padding: "14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                fontSize: "0.78rem",
                fontFamily: "var(--font-mono)",
                color: "var(--gold-light)",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {mockXdr}
            </pre>
          </div>
        )}

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: "0.82rem" }}
          >
            🌐 Open on StellarExpert &rarr;
          </a>
          <button className="btn btn-primary" style={{ fontSize: "0.82rem" }} onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
