import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // [수정] experimental 안에 있던 allowedDevOrigins 삭제
  // Next.js 16+ 에서는 개발 모드(-H 0.0.0.0)로 실행하면 자동으로 외부 접속이 허용되는 경우가 많습니다.
  // 만약 특정 호스트 제한을 풀어야 한다면 아래 설정을 사용합니다.
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // 이미지 등 외부 리소스를 쓸 때 필요할 수 있어서 미리 넣어둡니다. (나중에 책 표지 때문에 필요함)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;