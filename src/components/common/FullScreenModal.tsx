"use client";

import { useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import CommonHeader from "@/components/common/CommonHeader"; // [추가]

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;         // 헤더에 타이틀이 필요하면 넣음
  showCloseButton?: boolean; // X 버튼 보일지 여부 (기본 true)
}

export default function FullScreenModal({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
}: FullScreenModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 스크롤 잠금 로직
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      disableBodyScroll(scrollRef.current, { reserveScrollBarGap: true });
    } else {
      clearAllBodyScrollLocks();
    }
    return () => clearAllBodyScrollLocks();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-center">
          
          {/* 배경 (슬라이드 될 때 뒤에 깔리는 어두운 막) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 모달 본체 (슬라이드 업 애니메이션) */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-[430px] h-[100dvh] bg-white flex flex-col shadow-2xl overflow-hidden"
          >
            {/* [수정 완료] 공통 헤더 적용 */}
            {/* 페이지 헤더와 똑같은 디자인을 공유하게 됩니다 */}
            <CommonHeader 
              title={title}
              rightIcon={showCloseButton ? <X className="w-6 h-6" /> : null}
              onRightClick={showCloseButton ? onClose : undefined}
            />

            {/* 실제 컨텐츠 (스크롤 가능 영역) */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}