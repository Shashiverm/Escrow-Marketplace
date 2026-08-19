import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stellarescrow.market";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "StellarEscrow — Trustless Freelance Escrow Marketplace on Soroban",
    template: "%s | StellarEscrow Marketplace",
  },
  description:
    "Decentralized freelance escrow marketplace on Stellar Soroban smart contracts. Milestone-based non-custodial payments, instant XLM settlement, tamper-proof on-chain reputation, and dispute resolution.",
  keywords: [
    "Stellar",
    "Soroban",
    "Smart Contracts",
    "Freelance Marketplace",
    "Crypto Escrow",
    "XLM Payments",
    "Web3 Freelancing",
    "Non-Custodial Escrow",
    "On-Chain Reputation",
    "Stellar DeFi",
    "Blockchain Freelance",
    "Decentralized Escrow",
  ],
  authors: [{ name: "StellarEscrow Protocol Team" }],
  creator: "StellarEscrow Protocol",
  publisher: "StellarEscrow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "StellarEscrow Marketplace",
    title: "StellarEscrow — Trustless Freelance Escrow Marketplace",
    description:
      "Lock funds in verifiable milestone escrows, hire pre-vetted Soroban developers, and settle payments instantly on Stellar.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StellarEscrow Marketplace — Soroban Powered Escrows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StellarEscrow — Trustless Freelance Escrow Marketplace",
    description:
      "Decentralized milestone escrow on Stellar Soroban smart contracts. 100% non-custodial, sub-5-second finality, on-chain reputation.",
    images: ["/og-image.png"],
    creator: "@StellarEscrow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "StellarEscrow Protocol",
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description:
        "Decentralized freelance escrow marketplace powered by Stellar Soroban smart contracts.",
      sameAs: ["https://twitter.com/StellarEscrow", "https://github.com/stellar/soroban-examples"],
    },
    {
      "@type": "WebApplication",
      "@id": `${baseUrl}/#webapp`,
      name: "StellarEscrow Marketplace",
      url: baseUrl,
      applicationCategory: "BusinessApplication, FinancialApplication",
      operatingSystem: "All Web Browsers",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Milestone-based non-custodial smart contract escrow",
        "Instant settlement on Stellar Network (< 5s)",
        "On-chain immutable reputation scoring",
        "Dispute arbitration engine with custom payouts",
        "Pre-vetted Soroban talent leaderboard",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <div className="page-wrapper">
          <Header />
          <main className="page-content">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
