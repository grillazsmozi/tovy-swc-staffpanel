/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: {
	domains: ['tr.rbxcdn.com']
  },
  dev: {
    port: 3000,
  },
}

module.exports = nextConfig
