/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 自動返信メールに添付する事業説明資料PDFをAPI関数のバンドルに含める
  outputFileTracingIncludes: {
    "/api/submit": ["./assets/**/*"],
  },
}

export default nextConfig
