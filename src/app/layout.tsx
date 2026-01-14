import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "서우재",
  description: "나만의 작은 서재",
};

// [Step 1] Viewport 설정 (키보드 대응 포함 유지)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {/* [수정 포인트] 배경색 반응형 처리 
          - bg-white: 모바일에서는 흰색 배경 (상단 회색 라인 제거)
          - md:bg-[#f4f4f5]: PC(md 이상)에서는 회색 배경 유지
        */}
        <div className="flex justify-center min-h-screen bg-white md:bg-[#f4f4f5]">
          <main className="w-full max-w-[430px] min-h-screen bg-white shadow-xl relative overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}