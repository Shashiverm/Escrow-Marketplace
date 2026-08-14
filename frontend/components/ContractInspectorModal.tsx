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
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div
        className="wallet-modal-card"
        style={{ maxWidth: "680px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="wallet-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="wallet-modal-header">
          <span className="category-tag">Soroban Smart Contract Inspector</span>
          <h2 className="wallet-modal-title" style={{ marginTop: "6px" }}>
            Contract #{jobId} Diagnostic State
          </h2>
          <p className="wallet-modal-desc">
            On-chain ledger parameters, WASM hash, and Soroban storage footprints.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="filter-tabs" style={{ marginBottom: "20px" }}>
          <button
            className={`filter-tab ${activeInspectorTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveInspectorTab("overview")}
          >
            Protocol Overview
          </button>
          <button
            className={`filter-tab ${activeInspectorTab === "storage" ? "active" : ""}`}
            onClick={() => setActiveInspectorTab("storage")}
          >
            Ledger Storage Footprint
          </button>
          <button
            className={`filter-tab ${activeInspectorTab === "xdr" ? "active" : ""}`}
            onClick={() => setActiveInspectorTab("xdr")}
          >
            Raw XDR Payload
          </button>
        </div>

        {activeInspectorTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="inspector-field">
              <span className="inspector-label">Soroban Contract ID</span>
              <div className="inspector-value font-mono">
                <code>{contractId}</code>
              </div>
            </div>

            <div className="inspector-field">
              <span className="inspector-label">WASM Code Hash</span>
              <div className="inspector-value font-mono">
                <code>{simulatedWasmHash}</code>
              </div>
            </div>

            <div className="grid-2" style={{ gap: "12px" }}>
              <div className="inspector-field">
                <span className="inspector-label">Contract Status</span>
                <span className="badge badge-open" style={{ textTransform: "uppercase" }}>
                  {status}
                </span>
              </div>
              <div className="inspector-field">
                <span className="inspector-label">Total Escrow Budget</span>
                <strong style={{ color: "var(--cyan-light)" }}>{budget.toLocaleString()} XLM</strong>
              </div>
            </div>

            <div className="inspector-field">
              <span className="inspector-label">Client Address (Job Creator)</span>
              <div className="inspector-value font-mono">{client}</div>
            </div>

            {freelancer && (
              <div className="inspector-field">
                <span className="inspector-label">Freelancer Address (Assigned)</span>
                <div className="inspector-value font-mono">{freelancer}</div>
              </div>
            )}
          </div>
        )}

        {activeInspectorTab === "storage" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="inspector-field">
              <span className="inspector-label">Ledger Sequence Number</span>
              <span className="font-mono">Ledger #{simulatedLedgerSeq}</span>
            </div>

            <div className="inspector-field">
              <span className="inspector-label">Storage Entry Type</span>
              <code>ContractData (Persistent Storage)</code>
            </div>

            <div className="inspector-field">
              <span className="inspector-label">TTL (Time to Live) Expiration</span>
              <span className="font-mono" style={{ color: "var(--success)" }}>
                500,000 Ledgers Remaining (~35 days)
              </span>
            </div>

            <div className="inspector-field">
              <span className="inspector-label">Authorized Soroban Signers</span>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                1. Client Key (Deposit & Approval Authorization)<br />
                2. Contract Address (Escrow Lock Hold)
              </div>
            </div>
          </div>
        )}

        {activeInspectorTab === "xdr" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="inspector-label">Base64 Transaction Envelope XDR</span>
              <button className="btn btn-secondary btn-sm" onClick={handleCopyXdr}>
                {copiedXdr ? "✓ Copied XDR" : "📋 Copy XDR"}
              </button>
            </div>
            <pre
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                padding: "14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)",
                fontSize: "0.78rem",
                fontFamily: "var(--font-mono)",
                color: "var(--cyan-light)",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {mockXdr}
            </pre>
          </div>
        )}

        <div className="wallet-modal-footer" style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            🌐 Open on StellarExpert Explorer ↗
          </a>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
