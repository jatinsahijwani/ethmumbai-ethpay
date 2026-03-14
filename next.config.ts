import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'bitgo',
    'better-sqlite3',
    '@prisma/adapter-better-sqlite3',
    '@noble/hashes',
    '@noble/curves',
  ],
  turbopack: {},
}

export default nextConfig