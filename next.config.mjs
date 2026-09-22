/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/fancareer',
  assetPrefix: '/fancareer/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
