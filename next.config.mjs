/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias.canvas = false;
    }
    return config;
  },
  serverExternalPackages: ['pdfkit'],
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig;
