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
  
  // 화면의 높이와 위치 정보를 저장할 state
  const [viewportStyle, setViewportStyle] = useState({
    height: "100%", // 기본값
    top: 0,         // 기본값
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      // VisualViewport API 지원 브라우저 (대부분의 모바일)
      if (window.visualViewport) {
        setViewportStyle({
          // 1. 높이: 키보드를 뺀 실제 보이는 높이 (px)
          height: `${window.visualViewport.height}px`,
          // 2. 위치: 화면이 스크롤되어 밀려난 만큼 보정 (px)
          // 이게 없으면 모달이 화면 위로 날아갑니다.
          top: window.visualViewport.offsetTop, 
        });
      }
    };

    // 키보드가 올라오거나 스크롤될 때마다 위치/크기 재계산
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
          className="fixed left-0 w-full z-[60] flex justify-center items-end"
          // [핵심] 높이와 Top 위치를 자바스크립트가 픽셀 단위로 통제합니다.
          // 결과적으로 이 div는 항상 "눈에 보이는 화면 전체"와 일치하게 됩니다.
          style={{ 
            height: viewportStyle.height,
            top: viewportStyle.top 
          }}
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
            
            // 모달 본체: 
            // 부모(보이는 화면)가 줄어들면, 얘도 같이 줄어듭니다.
            // max-h-full을 줘서 키보드 공간을 제외한 영역을 넘치지 않게 합니다.
            className={`relative w-full max-w-[430px] max-h-full bg-white rounded-t-[20px] shadow-2xl overflow-hidden flex flex-col ${className}`}
          >
            {/* 드래그 핸들 */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* 컨텐츠 영역 */}
            {/* 내용이 많으면 이 내부에서 스크롤이 생기도록 flex 구조를 잡아야 합니다 */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}