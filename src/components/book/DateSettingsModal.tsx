"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

// react-calendar CSS는 globals.css에서 커스텀 처리함

interface DateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startDate: Date, endDate: Date | null) => void;
  initialStartDate?: string;
  initialEndDate?: string;
  isFinished: boolean; // 읽은 책인지 여부
}

type ActiveTab = "start" | "end" | null;

export default function DateSettingsModal({
  isOpen,
  onClose,
  onConfirm,
  initialStartDate,
  initialEndDate,
  isFinished,
}: DateSettingsModalProps) {
  
  // [상태] 날짜값
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  // [상태] 어떤 달력이 열려있는지 (Accordion)
  const [activeTab, setActiveTab] = useState<ActiveTab>("start");

  // 모달 열릴 때 초기값 세팅
  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStartDate ? new Date(initialStartDate) : new Date());
      setEndDate(initialEndDate ? new Date(initialEndDate) : new Date());
      // 처음엔 시작 날짜를 열어둠
      setActiveTab("start"); 
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  // 날짜 포맷 함수 (2025년 8월 8일)
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(date, "yyyy년 M월 d일", { locale: ko });
  };

  const handleConfirm = () => {
    onConfirm(startDate, isFinished ? endDate : null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white max-w-[430px] mx-auto h-[100dvh]">
      
      {/* 1. 헤더 */}
      <header className="flex-none flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
        <div className="w-6" /> {/* 좌측 여백용 */}
        <h2 className="text-[17px] font-bold text-gray-900">독서 날짜</h2>
        <button onClick={onClose} className="p-1 -mr-1 text-gray-900">
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* 2. 바디 (스크롤 가능) */}
      <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        
        {/* [A] 시작 날짜 섹션 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[14px] text-gray-500 font-medium">시작 날짜</span>
          </div>
          
          {/* 날짜 박스 (클릭 시 토글) */}
          <button 
            onClick={() => setActiveTab(activeTab === "start" ? null : "start")}
            className={`w-full flex justify-between items-center px-4 py-3 border rounded-lg bg-white transition-colors ${
              activeTab === "start" ? "border-black ring-1 ring-black" : "border-gray-200"
            }`}
          >
            <span className="text-[16px] font-bold text-gray-900">
              {formatDate(startDate)}
            </span>
            {/* 접힘/펼침 아이콘 (선택 사항) */}
            {activeTab === "start" ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
          </button>

          {/* 달력 (아코디언 애니메이션) */}
          <AnimatePresence>
            {activeTab === "start" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-2">
                  <Calendar 
                    onChange={(val) => {
                      setStartDate(val as Date);
                      // 시작 날짜 선택 후, 만약 '읽은 책'이면 종료 날짜로 자동 넘어감 (UX 옵션)
                      if (isFinished) setActiveTab("end");
                      else setActiveTab(null); // 아니면 그냥 닫음
                    }}
                    value={startDate}
                    formatDay={(locale, date) => format(date, "d")} // '1일' -> '1'로 숫자만 표시
                    next2Label={null} // 년도 이동 버튼 숨김 (심플하게)
                    prev2Label={null}
                    calendarType="gregory" // 일요일 부터 시작
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* [B] 종료 날짜 섹션 (읽은 책일 때만 표시) */}
        {isFinished && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[14px] text-gray-500 font-medium">종료 날짜</span>
            </div>
            
            <button 
              onClick={() => setActiveTab(activeTab === "end" ? null : "end")}
              className={`w-full flex justify-between items-center px-4 py-3 border rounded-lg bg-white transition-colors ${
                activeTab === "end" ? "border-black ring-1 ring-black" : "border-gray-200"
              }`}
            >
              <span className="text-[16px] font-bold text-gray-900">
                {formatDate(endDate)}
              </span>
              {activeTab === "end" ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
            </button>

            <AnimatePresence>
              {activeTab === "end" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 pb-2">
                    <Calendar 
                      onChange={(val) => {
                        setEndDate(val as Date);
                        setActiveTab(null); // 선택 후 닫기
                      }}
                      value={endDate}
                      formatDay={(locale, date) => format(date, "d")}
                      next2Label={null}
                      prev2Label={null}
                      calendarType="gregory"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </main>

      {/* 3. 푸터 (확인 버튼) */}
      <footer className="flex-none p-6 bg-white border-t border-gray-50 pb-8">
        <button
          onClick={handleConfirm}
          className="w-full h-[52px] bg-black text-white text-[16px] font-bold rounded-xl active:scale-[0.98] transition-transform"
        >
          확인
        </button>
      </footer>

    </div>
  );
}