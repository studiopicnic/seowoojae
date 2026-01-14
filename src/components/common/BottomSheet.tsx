"use client";

import { ReactNode } from "react";
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

  // [중요] 기존의 Body Scroll Lock (useEffect) 코드를 모두 제거했습니다.
  // layout.tsx의 interactive-widget 설정과 충돌하기 때문입니다.

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-center items-end">
          
          {/* 1. 배경 (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            
            // [핵심 1] 배경 터치 원천 봉쇄
            // CSS: 터치 액션 자체를 끔
            style={{ touchAction: "none" }}
            // JS: 혹시라도 발생하는 터치 이동 이벤트를 무효화
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* 2. 바텀시트 프레임 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.05}
            onDragEnd={handleDragEnd}
            
            // [핵심 2] 모달 껍데기 고정
            // 모달 내부의 스크롤 영역(children)을 제외한 
            // 헤더나 빈 공간을 당겼을 때 화면이 움직이는 것을 방지합니다.
            style={{ 
              maxHeight: "90dvh",
              touchAction: "none" 
            }}
            
            className={`relative w-full max-w-[430px] bg-white rounded-t-[20px] shadow-2xl overflow-hidden flex flex-col ${className}`}
          >
            {/* 드래그 핸들 */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* 컨텐츠 영역 */}
            {/* 내용물 스크롤은 여기서 처리하지 않고, 
              SearchModal 등 자식 컴포넌트 내부의 'overflow-y-auto' 영역에서 
              'overscroll-behavior: contain'과 함께 처리됩니다. (이미 적용되어 있음)
            */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}