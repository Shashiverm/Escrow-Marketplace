import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "StellarEscrow — Freelance Marketplace on Stellar",
  description:
    "Decentralized freelance escrow marketplace with milestone-based payments, built on Stellar Soroban smart contracts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="page-wrapper">
          <Header />
          <main className="page-content">{children}</main>
          <footer className="footer">
            <div className="container">
              <p>
                Built on{" "}
                <a
                  href="https://stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stellar
                </a>{" "}
                &middot; Powered by{" "}
                <a
                  href="https://developers.stellar.org/docs/build/smart-contracts/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Soroban Smart Contracts
                </a>{" "}
                &middot;{" "}
                <a
                  href="https://github.com/Shashiverm/Escrow-Marketplace"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Repository
                </a>{" "}
                &middot; MIT License
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
