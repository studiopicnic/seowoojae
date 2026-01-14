"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence, PanInfo, useDragControls } from "framer-motion";

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
  
  // [핵심 1] 드래그를 수동으로 제어하기 위한 컨트롤러 생성
  const controls = useDragControls();

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
            
            // 배경 터치 시 화면 밀림 방지 (Scroll Trap)
            style={{ touchAction: "none" }}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
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
            
            // [핵심 2] 모달 전체의 드래그 리스너 비활성화
            // 이제 모달 아무데나 잡고 끈다고 움직이지 않습니다.
            dragListener={false} 
            dragControls={controls} // 수동 컨트롤 연결
            onDragEnd={handleDragEnd}
            
            style={{ 
              maxHeight: "90dvh",
              // 모달 껍데기는 터치 액션을 막아서(none), 실수로 빈 공간 당겼을 때 Body가 밀리는 것 방지
              touchAction: "none" 
            }}
            
            className={`relative w-full max-w-[430px] bg-white rounded-t-[20px] shadow-2xl overflow-hidden flex flex-col ${className}`}
          >
            {/* [핵심 3] 드래그 핸들 (손잡이) 
              오직 이 영역에서만 드래그가 시작됩니다.
            */}
            <div 
              className="w-full flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing touch-none"
              // 마우스/터치를 눌렀을 때 드래그 시작 알림
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* 컨텐츠 영역 */}
            {/* [참고] 자식 컴포넌트(SearchModal 등)의 스크롤 영역에는 
               className="overflow-y-auto ... touch-pan-y" 가 있어야 스크롤이 됩니다.
               이미 SearchModal 코드에 적용되어 있는 것을 확인했습니다.
            */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}