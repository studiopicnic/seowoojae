"use client";

import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";

interface BottomSheetProps {
  isOpen: boolean;        // 열림 상태
  onClose: () => void;    // 닫기 함수
  children: ReactNode;    // 내부 컨텐츠
  className?: string;     // 높이 등을 커스텀하고 싶을 때 (예: h-[70vh])
}

// [공통 설정] 물리 엔진 값 (여기만 바꾸면 앱 전체 적용)
const SPRING_CONFIG = { type: "spring", stiffness: 260, damping: 30 } as const;

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  className = "h-[85vh]", // 기본 높이는 85%
}: BottomSheetProps) {

  // 드래그로 닫기 로직
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  // 모달 열렸을 때 뒷배경 스크롤 막기 (안전장치)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. 배경 (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* 2. 바텀 시트 본체 */}
          <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SPRING_CONFIG}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.05}
              onDragEnd={handleDragEnd}
              // pointer-events-auto: 배경 클릭은 통과시키되 모달 클릭은 잡기 위해
              className={`pointer-events-auto w-full max-w-[430px] mx-auto bg-white rounded-t-[20px] shadow-2xl overflow-hidden flex flex-col ${className}`}
            >
              {/* 핸들바 (드래그 손잡이) */}
              <div className="w-full flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing touch-none">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* 실제 컨텐츠가 들어갈 자리 */}
              <div className="flex-1 flex flex-col min-h-0">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}