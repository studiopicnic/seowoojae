"use client";

import { useEffect, useState, ReactNode } from "react";
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
  
  // [수정] 초기값을 100dvh로 설정
  const [viewportHeight, setViewportHeight] = useState<string | number>("100dvh");

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.visualViewport) {
        // [핵심 로직]
        // 키보드가 올라오면 visualViewport.height가 작아집니다 (예: 800px -> 450px).
        // 이 값을 컨테이너 높이로 설정하면, 컨테이너의 '바닥'이 키보드 바로 위가 됩니다.
        setViewportHeight(window.visualViewport.height);
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("scroll", handleResize);
    
    // 초기 실행
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, [isOpen]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed left-0 top-0 w-full z-[60] flex justify-center items-end"
          // [핵심 수정] 
          // 1. inset-0 대신 top-0, left-0, w-full을 쓰고
          // 2. 높이(height)를 자바스크립트로 강제 제어합니다.
          // -> 결과: 키보드가 올라오면 이 div 자체가 작아지면서, 내부의 모달(items-end)을 위로 끌어올립니다.
          style={{ height: viewportHeight }}
        >
          
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
            
            // 모달 본체는 "부모 높이(줄어든 화면)의 최대 90%"까지만 차지하게 합니다.
            // 이렇게 하면 키보드 공간을 제외한 나머지 영역 내에서 적절히 크기를 잡습니다.
            className={`relative w-full max-w-[430px] max-h-[90%] bg-white rounded-t-[20px] shadow-2xl overflow-hidden flex flex-col ${className}`}
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