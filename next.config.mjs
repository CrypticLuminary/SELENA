/** @type {import('next').NextConfig} */

const rawBackendOrigin =
  process.env.SELENA_BACKEND_ORIGIN?.trim() ?? "http://127.0.0.1:8000";
const backendUrl = new URL(rawBackendOrigin);

if (!["http:", "https:"].includes(backendUrl.protocol)) {
  throw new Error("SELENA_BACKEND_ORIGIN must use http or https.");
}
if (backendUrl.pathname !== "/" || backendUrl.search || backendUrl.hash) {
  throw new Error("SELENA_BACKEND_ORIGIN must be an origin without a path.");
}
const backendOrigin = backendUrl.origin;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
