/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ETHEREUM_PROVIDER_URL: process.env.NEXT_PUBLIC_ETHEREUM_PROVIDER_URL,
    NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS,
    NEXT_PUBLIC_USDT_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS,
  },
}

module.exports = nextConfig
