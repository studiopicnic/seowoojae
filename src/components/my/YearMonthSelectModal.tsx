"use client";

import { useState, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import BottomSheet from "@/components/common/BottomSheet";
import CommonHeader from "@/components/common/CommonHeader";
import SafeScrollArea from "@/components/common/SafeScrollArea";

interface YearMonthSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialYear: number;
  initialMonth: number;
  onApply: (year: number, month: number) => void;
}

export default function YearMonthSelectModal({
  isOpen,
  onClose,
  initialYear,
  initialMonth,
  onApply,
}: YearMonthSelectModalProps) {
  // 내부 상태 관리
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  // 모달 열릴 때 초기값 동기화
  useEffect(() => {
    if (isOpen) {
      setYear(initialYear);
      setMonth(initialMonth);
    }
  }, [isOpen, initialYear, initialMonth]);

  const handleSave = () => {
    onApply(year, month);
    onClose();
  };

  const handlePrevYear = () => setYear((prev) => prev - 1);
  const handleNextYear = () => setYear((prev) => prev + 1);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-[480px]">
        {/* 1. 헤더 */}
        <CommonHeader
          title="날짜 선택"
          type="default"
          rightIcon={<Check className="w-6 h-6" />}
          onRightClick={handleSave}
          className="shrink-0"
        />

        <SafeScrollArea className="px-6 pb-8">
          {/* 2. 연도 선택 (네비게이션) */}
          <div className="flex items-center justify-center gap-8 py-6 mb-2">
            <button 
              onClick={handlePrevYear}
              className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <span className="text-[20px] font-bold text-gray-900 select-none">
              {year}
            </span>

            <button 
              onClick={handleNextYear}
              className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* 3. 월 선택 (그리드 3열) */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 px-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const isSelected = m === month;
              return (
                <button
                  key={m}
                  onClick={() => setMonth(m)}
                  className={`py-3 rounded-lg text-[16px] transition-all duration-200 ${
                    isSelected
                      ? "font-bold text-gray-900 border border-gray-900 bg-white" // 선택됨: 테두리 박스
                      : "font-medium text-gray-400 hover:text-gray-600 border border-transparent" // 미선택
                  }`}
                >
                  {m}월
                </button>
              );
            })}
          </div>
        </SafeScrollArea>
      </div>
    </BottomSheet>
  );
}