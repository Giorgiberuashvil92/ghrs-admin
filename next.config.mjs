/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep development servers on different ports from overwriting each other.
  distDir: process.env.NODE_ENV === "development"
    ? `.next-dev-${process.env.PORT || "default"}`
    : ".next",
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
