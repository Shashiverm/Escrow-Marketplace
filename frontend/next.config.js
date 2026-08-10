/** @type {import('next').NextConfig} */
const nextConfig = {
  // Stellar SDK uses WASM internally; allow it
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

module.exports = nextConfig;
