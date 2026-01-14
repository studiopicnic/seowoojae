"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Edit, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // 현재 경로가 해당 탭인지 확인하는 함수
  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-gray-100 flex justify-around items-center h-[88px] z-50">
      {/* 1. 홈 탭 */}
      <Link href="/home" className="p-4 active:scale-95 transition-transform">
        <Home 
          className={`w-6 h-6 transition-colors ${
            isActive("/home") ? "text-black fill-black" : "text-gray-300"
          }`} 
        />
      </Link>

      {/* 2. 노트(기록) 탭 - 여기를 눌러야 이동합니다! */}
      <Link href="/note" className="p-4 active:scale-95 transition-transform">
        <Edit 
          className={`w-6 h-6 transition-colors ${
            isActive("/note") ? "text-black fill-black" : "text-gray-300"
          }`} 
        />
      </Link>

      {/* 3. 마이페이지 탭 (아직 없다면 링크만 걸어둠) */}
      <Link href="/my" className="p-4 active:scale-95 transition-transform">
        <User 
          className={`w-6 h-6 transition-colors ${
            isActive("/my") ? "text-black fill-black" : "text-gray-300"
          }`} 
        />
      </Link>
    </nav>
  );
}