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

// 휠 피커 상수 설정
const ITEM_HEIGHT = 50; // 각 연도 아이템의 높이 (px)
const VISIBLE_COUNT = 5; // 화면에 보여질 개수 (홀수 추천)
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT; // 전체 컨테이너 높이

export default function YearSelectModal({ 
  isOpen, 
  onClose, 
  currentYear, 
  onSelectYear 
}: YearSelectModalProps) {
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false); // 스크롤 중복 방지

  // 연도 데이터 (현재 ~ 과거 50년)
  // 순서를 [과거 -> 현재]로 정렬해야 스크롤 로직이 자연스럽습니다.
  // 예: 1975, 1976 ... 2025
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
        // setTimeout을 줘야 모달 애니메이션 후 정확히 이동함
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = index * ITEM_HEIGHT;
          }
        }, 0);
      }
      setSelectedYear(currentYear);
    }
  }, [isOpen, currentYear, years]);

  // [핵심 로직] 스크롤 이벤트 핸들러
  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const scrollTop = scrollRef.current.scrollTop;
    // 현재 스크롤 위치를 아이템 높이로 나누어 인덱스 계산 (반올림)
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    
    // 범위 안전 장치
    if (index >= 0 && index < years.length) {
      const targetYear = years[index];
      // 상태 변경 최적화 (값이 다를 때만 업데이트)
      if (selectedYear !== targetYear) {
        setSelectedYear(targetYear);
      }
    }
  };

  const handleSave = () => {
    onSelectYear(selectedYear);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col pb-safe">
        
        {/* 헤더 */}
        <CommonHeader
          title="연도 선택"
          type="default"
          rightIcon={<Check className="w-6 h-6" />}
          onRightClick={handleSave}
          className="shrink-0 border-b border-gray-100"
        />

        {/* 휠 피커 영역 */}
        <div className="relative w-full overflow-hidden" style={{ height: CONTAINER_HEIGHT }}>
          
          {/* [시각적 요소] 중앙 선택 영역 표시 (회색 바) */}
          <div 
            className="absolute left-0 right-0 bg-gray-50 pointer-events-none z-0"
            style={{
              top: (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2, // 정중앙 배치
              height: ITEM_HEIGHT,
            }}
          />

          {/* 스크롤 컨테이너 */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="absolute inset-0 overflow-y-auto scrollbar-hide snap-y snap-mandatory z-10 py-[100px]" 
            // py-[100px]은 (CONTAINER_HEIGHT / 2) - (ITEM_HEIGHT / 2) 값입니다.
            // 250/2 - 50/2 = 125 - 25 = 100px
            // 이 패딩이 있어야 첫 번째 아이템과 마지막 아이템이 중앙에 올 수 있습니다.
          >
            {years.map((year) => {
              const isSelected = selectedYear === year;
              return (
                <div
                  key={year}
                  // snap-center: 스크롤이 멈출 때 이 요소가 중앙에 오도록 자석처럼 붙음
                  className="w-full flex items-center justify-center snap-center transition-all duration-200 ease-out"
                  style={{ height: ITEM_HEIGHT }}
                >
                  <span
                    className={`transition-all duration-200 ${
                      isSelected
                        ? "text-[20px] font-bold text-gray-900 scale-110" // 선택됨: 큼, 진함
                        : "text-[18px] font-medium text-gray-300 scale-100" // 선택안됨: 흐림, 작음
                    }`}
                  >
                    {year}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* [시각적 요소] 위아래 그라데이션 (입체감) */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
          
        </div>
      </div>
    </BottomSheet>
  );
}