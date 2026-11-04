/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@xenova/transformers", "pg", "onnxruntime-node"],
  },
};

export default nextConfig;
