import type { NextConfig } from "next";

const securityHeaders = [
  // Forces HTTPS for 2 years — prevents MITM downgrade attacks
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Blocks your page being loaded in an iframe (clickjacking)
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevents MIME-type sniffing attacks
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // No referrer info leaked to external sites
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Disable browser features you don't use
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")',
  },
  // Content Security Policy — whitelist what can load on your pages
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.stripe.com https://*.neon.tech",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; '),
  },
  // Prevents XSS reflected attacks in older browsers
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
