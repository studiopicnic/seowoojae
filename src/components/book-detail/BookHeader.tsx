"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal } from "lucide-react";

interface BookHeaderProps {
  onMenuClick: () => void; // 메뉴 버튼 클릭 시 실행할 함수
}

export default function BookHeader({ onMenuClick }: BookHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex-none flex items-center justify-between px-4 py-3 bg-white z-10 relative">
      <button 
        onClick={() => router.back()} 
        className="p-2 -ml-2 text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button 
        className="p-2 -mr-2 text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        onClick={onMenuClick} // 부모가 준 함수 실행
      >
        <MoreHorizontal className="w-6 h-6" />
      </button>
    </header>
  );
}