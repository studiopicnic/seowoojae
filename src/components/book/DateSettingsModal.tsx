"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import FullScreenModal from "@/components/common/FullScreenModal";

interface DateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startDate: Date, endDate: Date | null) => void;
  initialStartDate?: string;
  initialEndDate?: string;
  isFinished: boolean;
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
  
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [activeTab, setActiveTab] = useState<ActiveTab>("start");

  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStartDate ? new Date(initialStartDate) : new Date());
      setEndDate(initialEndDate ? new Date(initialEndDate) : new Date());
      setActiveTab("start"); 
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(date, "yyyy년 M월 d일", { locale: ko });
  };

  const handleConfirm = () => {
    onConfirm(startDate, isFinished ? endDate : null);
    onClose();
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="독서 날짜">
      <div className="p-6 h-full flex flex-col">
        {/* 컨텐츠 영역 */}
        <div className="flex-1">
          {/* [A] 시작 날짜 섹션 */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[14px] text-gray-500 font-medium">시작 날짜</span>
            </div>
            <button 
              onClick={() => setActiveTab(activeTab === "start" ? null : "start")}
              className={`w-full flex justify-between items-center px-4 py-3 border rounded-lg bg-white transition-colors ${
                activeTab === "start" ? "border-black ring-1 ring-black" : "border-gray-200"
              }`}
            >
              <span className="text-[16px] font-bold text-gray-900">{formatDate(startDate)}</span>
              {activeTab === "start" ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
            </button>
            <AnimatePresence>
              {activeTab === "start" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-6 pb-2">
                    <Calendar 
                      onChange={(val) => {
                        setStartDate(val as Date);
                        // 시작 날짜 선택 후, 완료 상태라면 종료 날짜 탭으로 자동 이동
                        if (isFinished) setActiveTab("end");
                        else setActiveTab(null);
                      }}
                      value={startDate}
                      formatDay={(locale, date) => format(date, "d")}
                      next2Label={null} prev2Label={null} calendarType="gregory"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* [B] 종료 날짜 섹션 */}
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
                <span className="text-[16px] font-bold text-gray-900">{formatDate(endDate)}</span>
                {activeTab === "end" ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
              </button>
              <AnimatePresence>
                {activeTab === "end" && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pt-6 pb-2">
                      <Calendar 
                        onChange={(val) => { 
                          const newEndDate = val as Date;
                          setEndDate(newEndDate);
                          
                          // [수정] 종료 날짜가 시작 날짜보다 이전이면, 시작 날짜를 종료 날짜와 같게 보정
                          if (newEndDate < startDate) {
                            setStartDate(newEndDate);
                          }
                          
                          setActiveTab(null); 
                        }}
                        value={endDate}
                        formatDay={(locale, date) => format(date, "d")}
                        next2Label={null} prev2Label={null} calendarType="gregory"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-auto pb-4">
          <button onClick={handleConfirm} className="w-full h-[52px] bg-black text-white text-[16px] font-bold rounded-xl active:scale-[0.98] transition-transform">
            확인
          </button>
        </div>
      </div>
    </FullScreenModal>
  );
}