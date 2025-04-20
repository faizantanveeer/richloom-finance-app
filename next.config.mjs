/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
      // Remove React Refresh overlay
      config.plugins = config.plugins.filter(
        (plugin) => plugin.constructor.name !== "ReactRefreshPlugin"
      );
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

export default nextConfig;
