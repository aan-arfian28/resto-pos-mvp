import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // PWA configuration — enable with next-pwa when ready for production:
  // import withPWA from 'next-pwa';
  // export default withPWA({ dest: 'public', register: true, skipWaiting: true })(nextConfig);
};

export default nextConfig;
