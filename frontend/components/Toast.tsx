"use client";

import React, { useEffect } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  txHash?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const ICONS = {
    success: "✅",
    error: "⚠️",
    info: "ℹ️",
    warning: "⚡",
  };

  return (
    <div className={`toast-item toast-${toast.type}`}>
      <div className="toast-icon">{ICONS[toast.type]}</div>
      <div className="toast-content">
        <strong className="toast-title">{toast.title}</strong>
        {toast.message && <p className="toast-message">{toast.message}</p>}
        {toast.txHash && (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${toast.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="toast-tx-link"
          >
            TX: {toast.txHash.slice(0, 8)}…{toast.txHash.slice(-8)} ↗
          </a>
        )}
      </div>
      <button className="toast-close" onClick={() => onDismiss(toast.id)}>
        ✕
      </button>
    </div>
  );
}
