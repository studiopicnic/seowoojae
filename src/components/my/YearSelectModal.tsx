"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Check } from "lucide-react";

import BottomSheet from "@/components/common/BottomSheet";
import CommonHeader from "@/components/common/CommonHeader";

interface YearSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentYear: number;
  onSelectYear: (year: number) => void;
}

const ITEM_HEIGHT = 50; 
const VISIBLE_COUNT = 5; 
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT; 

export default function YearSelectModal({ 
  isOpen, 
  onClose, 
  currentYear, 
  onSelectYear 
}: YearSelectModalProps) {
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 연도 데이터 (현재 ~ 과거 50년)
  const years = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const startYear = thisYear - 50;
    return Array.from({ length: 51 }, (_, i) => startYear + i);
  }, []);

  // [초기화] 모달 열릴 때 현재 연도 위치로 자동 스크롤
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const index = years.indexOf(currentYear);
      if (index !== -1) {
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = index * ITEM_HEIGHT;
          }
        }, 0);
      }
      setSelectedYear(currentYear);
    }
  }, [isOpen, currentYear, years]);

  // 스크롤 감지 로직 (중앙값 계산)
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    
    if (index >= 0 && index < years.length) {
      const targetYear = years[index];
      if (selectedYear !== targetYear) {
        setSelectedYear(targetYear);
      }
    }
  };

  // [추가] 클릭 시 해당 연도로 스크롤 이동
  const handleYearClick = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: "smooth", // 부드럽게 이동
      });
    }
  };

  const handleSave = () => {
    onSelectYear(selectedYear);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col pb-safe">
        
        <CommonHeader
          title="연도 선택"
          type="default"
          rightIcon={<Check className="w-6 h-6" />}
          onRightClick={handleSave}
          className="shrink-0 border-b border-gray-100"
        />

        <div className="relative w-full overflow-hidden" style={{ height: CONTAINER_HEIGHT }}>
          
          {/* 중앙 선택 영역 표시 (회색 바) */}
          <div 
            className="absolute left-0 right-0 bg-gray-50 pointer-events-none z-0"
            style={{
              top: (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2,
              height: ITEM_HEIGHT,
            }}
          />

          {/* 스크롤 컨테이너 */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="absolute inset-0 overflow-y-auto scrollbar-hide snap-y snap-mandatory z-10 py-[100px]" 
          >
            {years.map((year, index) => {
              const isSelected = selectedYear === year;
              return (
                <div
                  key={year}
                  // [수정] 클릭 이벤트 추가
                  onClick={() => handleYearClick(index)}
                  className="w-full flex items-center justify-center snap-center cursor-pointer"
                  style={{ height: ITEM_HEIGHT }}
                >
                  <span
                    className={`transition-all duration-200 ${
                      isSelected
                        ? "text-[20px] font-bold text-gray-900 scale-110" 
                        : "text-[18px] font-medium text-gray-300 scale-100 hover:text-gray-400"
                    }`}
                  >
                    {year}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* 그라데이션 오버레이 */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
          
        </div>
      </div>
    </BottomSheet>
  );
}