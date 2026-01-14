import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "서우재",
  description: "나만의 작은 서재",
};

// [Step 1 핵심] viewport 설정 추가!
// interactiveWidget: 'resizes-content' -> "키보드 올라오면 화면(Viewport) 크기 자체를 줄여라"
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "overlays-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* 폰트 관련 클래스 제거됨 (globals.css에서 처리) */}
      <body>
        <div className="flex justify-center min-h-screen bg-[#f4f4f5]">
          <main className="w-full max-w-[430px] min-h-screen bg-white shadow-xl relative overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}