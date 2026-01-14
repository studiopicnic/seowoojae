"use client";

import { useEffect, ReactNode } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  className = "",
}: BottomSheetProps) {

  // [복구] 복잡한 높이 계산 로직(visualViewport) 제거함.
  // 이제 브라우저의 기본 동작에 맡깁니다.

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-center items-end">
          
          {/* 배경 (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* 바텀시트 본체 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.05}
            onDragEnd={handleDragEnd}
            
            // [복구] max-height를 90dvh(동적 뷰포트 높이)로 설정
            // 평소에는 화면의 90%까지 찰 수 있음
            style={{ maxHeight: "90dvh" }}
            
            className={`relative w-full max-w-[430px] bg-white rounded-t-[20px] shadow-2xl overflow-hidden flex flex-col ${className}`}
          >
            {/* 드래그 핸들 */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* 컨텐츠 영역 */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}