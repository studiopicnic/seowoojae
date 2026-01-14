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

  // 1. Body Scroll Lock (기본 문서 스크롤 방지)
useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      
      // 1. Body 고정 (기존 로직)
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      
      // [추가] 2. 오버스크롤(고무줄 효과) 원천 차단
      // html과 body 모두에 적용해야 완벽합니다.
      document.body.style.overscrollBehavior = "none";
      document.documentElement.style.overscrollBehavior = "none"; // html 태그
      
    }

    return () => {
      const scrollY = document.body.style.top;
      
      // 스타일 복구
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      
      // [해제] 오버스크롤 복구
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overscrollBehavior = "";

      window.scrollTo(0, parseInt(scrollY || "0") * -1);
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
          
          {/* 배경 (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            
            // [핵심 추가] 배경 터치 시 화면 이동(Pan) 원천 차단
            // iOS Safari에서 키보드가 올라왔을 때 배경을 끌면 화면이 날아가는 것을 막습니다.
            onTouchMove={(e) => {
              e.preventDefault(); // "움직이지 마"
              e.stopPropagation(); // "부모에게 알리지 마"
            }}
            
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
            
            // 모달 본체는 터치 이벤트를 막지 않았으므로(위의 onTouchMove는 형제 요소인 배경에만 적용됨),
            // 내부 텍스트 입력이나 스크롤은 정상 작동합니다.
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