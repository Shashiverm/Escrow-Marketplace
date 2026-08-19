/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure Stellar SDK and native crypto addons don't trigger dynamic require warnings
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        "sodium-native": false,
        "require-addon": false,
      };
    }

    // Silence known dynamic require warnings from sodium-native / require-addon optional bindings in stellar-base
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules\/require-addon/ },
      { module: /node_modules\/sodium-native/ },
      /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      /Critical dependency: the request of a dependency is an expression/,
    ];

    return config;
  },
};

module.exports = nextConfig;
