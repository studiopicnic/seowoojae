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
  
  // [수정] 초기값을 100%로 설정 (dvh 대신 %가 호환성이 더 좋을 수 있음)
  const [realHeight, setRealHeight] = useState<string | number>("100%");

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.visualViewport) {
        // 현재 보이는 화면 높이를 가져옴
        setRealHeight(window.visualViewport.height);
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("scroll", handleResize);
    
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
        <div className="fixed inset-0 z-[60] flex justify-center items-end">
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.05}
            onDragEnd={handleDragEnd}
            
            // [핵심 수정] height가 아니라 maxHeight를 제어합니다.
            style={{ 
              maxHeight: realHeight // 키보드가 올라오면 이 값이 줄어들어 모달을 누릅니다.
            }}
            
            // className에 h-auto 등을 주면 내용만큼만, h-[90dvh]를 주면 90%만큼 찹니다.
            // 하지만 키보드가 올라와서 maxHeight가 줄어들면 그에 맞춰 자동으로 줄어듭니다.
            className={`relative w-full max-w-[430px] bg-white rounded-t-[20px] shadow-2xl overflow-hidden flex flex-col ${className}`}
          >
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}