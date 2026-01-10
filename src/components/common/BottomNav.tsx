// src/components/common/BottomNav.tsx
"use client";

import { Home, PenSquare, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname(); // 현재 주소를 알아내서 아이콘 색상을 바꿀 예정

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] z-20 h-[60px] bg-white border-t border-gray-100 flex items-center justify-between px-10 pb-2">
      <button 
        onClick={() => router.push("/home")}
        className={`p-2 transition-colors cursor-pointer ${
          pathname === "/home" ? "text-gray-900" : "text-gray-300 hover:text-gray-500"
        }`}
      >
        <Home className="w-6 h-6 fill-current" />
      </button>

      {/* 추후 기능 연결 예정 */}
      <button className="p-2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
        <PenSquare className="w-6 h-6" />
      </button>

      <button className="p-2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
        <User className="w-6 h-6" />
      </button>
    </nav>
  );
}