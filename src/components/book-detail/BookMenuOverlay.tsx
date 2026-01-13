// src/components/book-detail/BookMenuOverlay.tsx
"use client";

import { Check, Trash2 } from "lucide-react";
import { BookStatus } from "@/types/book";
import OverlayModal from "@/components/common/OverlayModal"; // 공통 컴포넌트 사용

interface BookMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: BookStatus;
  onStatusChange: (newStatus: BookStatus) => void;
  onDeleteClick: () => void;
}

export default function BookMenuOverlay({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
  onDeleteClick,
}: BookMenuOverlayProps) {
  
  const STATUS_OPTIONS: { label: string; value: BookStatus }[] = [
    { label: "읽고 있는 책", value: "reading" },
    { label: "읽고 싶은 책", value: "wish" },
    { label: "읽은 책", value: "finished" },
  ];

  return (
    <OverlayModal isOpen={isOpen} onClose={onClose}>
      
      {/* 여기서부터는 디자인 변경 없음 (버튼 영역) */}
      <h3 className="text-[14px] text-gray-300 font-medium mb-3 pl-1">상태</h3>
      
      <div className="flex flex-col gap-3">
        {/* 상태 변경 버튼들 */}
        <div className="flex flex-col gap-3">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                if (currentStatus !== option.value) {
                  onStatusChange(option.value);
                }
              }}
              className="w-full h-[56px] flex items-center justify-between px-5 bg-[#333333] rounded-xl active:scale-[0.98] transition-transform"
            >
              <span className={`text-[16px] font-bold ${
                currentStatus === option.value ? "text-white" : "text-gray-300"
              }`}>
                {option.label}
              </span>
              
              {currentStatus === option.value && (
                <Check className="w-5 h-5 text-white" />
              )}
            </button>
          ))}
        </div>

        {/* 구분선 */}
        <div className="w-full h-[1px] bg-white/10 my-1" />

        {/* 삭제 버튼 */}
        <button
          onClick={onDeleteClick}
          className="w-full h-[56px] flex items-center justify-between px-5 bg-[#333333] rounded-xl active:scale-[0.98] transition-transform hover:bg-[#443333]"
        >
          <span className="text-[16px] font-bold text-white">삭제</span>
          <Trash2 className="w-5 h-5 text-white/70" />
        </button>
      </div>

    </OverlayModal>
  );
}