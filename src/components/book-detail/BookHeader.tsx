"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal, Trash2 } from "lucide-react";

interface BookHeaderProps {
  onDelete: () => void;
}

export default function BookHeader({ onDelete }: BookHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex-none flex items-center justify-between px-4 py-3 bg-white z-10 relative">
      <button 
        onClick={() => router.back()} 
        className="p-2 -ml-2 text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <div className="relative">
        <button 
          className="p-2 -mr-2 text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>

        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-[140px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete();
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-left text-[14px] text-red-500 hover:bg-red-50 font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                책 삭제하기
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}