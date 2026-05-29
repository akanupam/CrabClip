/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:otp([A-Za-z0-9]{4})',
        destination: '/',
      },
    ]
  },
}

module.exports = nextConfig
