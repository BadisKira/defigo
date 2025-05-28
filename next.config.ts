import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://images.pexels.com/photos/3228833/pexels-photo-3228833.jpeg')],
  },
};

export default nextConfig;
