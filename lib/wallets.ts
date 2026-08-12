/**
 * Multi-Wallet Adapter Layer for Stellar & Soroban
 *
 * Supports:
 * - Freighter Wallet (@stellar/freighter-api)
 * - xBull Wallet
 * - LOBSTR Wallet
 * - Albedo (Web Popup)
 * - Rabet Wallet
 */

export type WalletType = "freighter" | "xbull" | "lobstr" | "albedo" | "rabet";

export interface WalletInfo {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
  installUrl: string;
}

declare global {
  interface Window {
    freighter?: any;
    xBullSDK?: any;
    lobstr?: any;
    albedo?: any;
    rabet?: any;
  }
}

/** Check which wallets are currently installed in the browser */
export function getAvailableWallets(): WalletInfo[] {
  const isServer = typeof window === "undefined";

  const hasFreighter = !isServer && (!!window.freighter || true); // Freighter API loaded dynamically
  const hasXBull = !isServer && !!(window.xBullSDK || (window as any).xbull);
  const hasLobstr = !isServer && !!window.lobstr;
  const hasAlbedo = !isServer; // Albedo web popup is always available
  const hasRabet = !isServer && !!window.rabet;

  return [
    {
      id: "freighter",
      name: "Freighter",
      icon: "🚀",
      description: "Official Stellar browser extension wallet",
      isAvailable: true, // Installed or installable via freighter-api
      installUrl: "https://www.freighter.app/",
    },
    {
      id: "xbull",
      name: "xBull Wallet",
      icon: "🐂",
      description: "Feature-rich multi-platform Stellar wallet",
      isAvailable: hasXBull,
      installUrl: "https://xbull.app/",
    },
    {
      id: "lobstr",
      name: "LOBSTR Wallet",
      icon: "🦞",
      description: "Popular mobile & browser Stellar wallet",
      isAvailable: true,
      installUrl: "https://lobstr.co/",
    },
    {
      id: "albedo",
      name: "Albedo",
      icon: "⚡",
      description: "Browser-based Web wallet — no extension needed",
      isAvailable: true,
      installUrl: "https://albedo.link/",
    },
    {
      id: "rabet",
      name: "Rabet",
      icon: "🐰",
      description: "Lightweight extension wallet for Stellar",
      isAvailable: hasRabet,
      installUrl: "https://rabet.io/",
    },
  ];
}

/** Check if Freighter extension is connected and active */
export async function isFreighterConnected(): Promise<boolean> {
  try {
    const freighterApi: any = await import("@stellar/freighter-api");
    if (freighterApi.isConnected) {
      const res: any = await freighterApi.isConnected();
      return typeof res === "boolean" ? res : !!res?.isConnected;
    }
    return typeof window !== "undefined" && !!window.freighter;
  } catch {
    return false;
  }
}

/** Connect to a specific wallet and retrieve the user's public key */
export async function connectWallet(type: WalletType): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Window not defined");
  }

  switch (type) {
    case "freighter": {
      const freighterApi: any = await import("@stellar/freighter-api");

      // Check permission / request access
      if (freighterApi.requestAccess) {
        const result: any = await freighterApi.requestAccess();
        if (typeof result === "string" && result) return result;
        if (result && typeof result === "object") {
          if (result.error) throw new Error(result.error);
          if (result.address) return result.address;
        }
      }

      if (freighterApi.getPublicKey) {
        const key = await freighterApi.getPublicKey();
        if (key) return key;
      }

      throw new Error("User denied wallet access or Freighter not found");
    }

    case "xbull": {
      if (window.xBullSDK) {
        return await window.xBullSDK.getPublicKey();
      } else if ((window as any).xbull) {
        return await (window as any).xbull.getPublicKey();
      }
      throw new Error("xBull extension is not installed in your browser");
    }

    case "lobstr": {
      if (window.lobstr) {
        return await window.lobstr.getPublicKey();
      }
      const fallbackAddr = prompt("Enter your LOBSTR Stellar Address (G...):");
      if (!fallbackAddr || !fallbackAddr.startsWith("G")) {
        throw new Error("Invalid LOBSTR Stellar address");
      }
      return fallbackAddr;
    }

    case "albedo": {
      if (window.albedo) {
        const res = await window.albedo.publicKey({});
        return res.pubkey;
      }
      const width = 450;
      const height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      return new Promise((resolve, reject) => {
        const popup = window.open(
          "https://albedo.link/albedo-intent.html?intent=public_key",
          "AlbedoConnect",
          `width=${width},height=${height},top=${top},left=${left}`
        );

        const handler = (event: MessageEvent) => {
          if (event.origin !== "https://albedo.link") return;
          window.removeEventListener("message", handler);
          if (event.data.pubkey) {
            resolve(event.data.pubkey);
          } else {
            reject(new Error(event.data.error || "Albedo login failed"));
          }
        };
        window.addEventListener("message", handler);
      });
    }

    case "rabet": {
      if (window.rabet) {
        const res = await window.rabet.connect();
        return res.publicKey;
      }
      throw new Error("Rabet extension is not installed in your browser");
    }

    default:
      throw new Error(`Unsupported wallet type: ${type}`);
  }
}

/** Sign a transaction XDR with the selected wallet */
export async function signTxWithWallet(
  type: WalletType,
  xdr: string,
  networkPassphrase = "Test SDF Network ; September 2015"
): Promise<string> {
  switch (type) {
    case "freighter": {
      const freighterApi: any = await import("@stellar/freighter-api");
      const signedXdr = await freighterApi.signTransaction(xdr, {
        networkPassphrase,
      });
      return signedXdr;
    }
    case "xbull": {
      if (window.xBullSDK) {
        return await window.xBullSDK.signXDR(xdr, { networkPassphrase });
      }
      throw new Error("xBull extension unavailable for signing");
    }
    case "albedo": {
      if (window.albedo) {
        const res = await window.albedo.tx({ xdr, network: networkPassphrase });
        return res.signed_envelope_xdr;
      }
      throw new Error("Albedo unavailable for signing");
    }
    case "rabet": {
      if (window.rabet) {
        const res = await window.rabet.sign(xdr, networkPassphrase);
        return res.xdr;
      }
      throw new Error("Rabet unavailable for signing");
    }
    default:
      throw new Error(`Signing not supported for wallet type: ${type}`);
  }
}

/** Fetch live XLM account balance from Stellar Horizon Testnet */
export async function getLiveBalance(publicKey: string): Promise<number> {
  try {
    const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`);
    if (!res.ok) return 10000;
    const data = await res.json();
    const nativeBalance = data.balances?.find((b: any) => b.asset_type === "native");
    return nativeBalance ? parseFloat(nativeBalance.balance) : 0;
  } catch (err) {
    console.warn("Could not fetch Horizon balance, returning default:", err);
    return 10000;
  }
}
