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
  
  const controls = useDragControls();

  // [핵심 수정] 드래그 종료 시 닫기 판단 로직 강화
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // 1. offset.y: 당긴 거리 (기존 100 -> 60으로 완화)
    // 2. velocity.y: 당긴 속도 (빠르게 휙 내리면 거리가 짧아도 닫힘)
    if (info.offset.y > 60 || info.velocity.y > 300) {
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
            
            // 배경 터치 차단 (Scroll Trap)
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
            
            // [애니메이션 튜닝] 
            // damping: 반동 제어 (낮을수록 띠용~ 함. 적당히 25->30으로 단단하게)
            // stiffness: 반응 속도 (높을수록 빠릿함. 300->350으로 상향)
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.05} // 고무줄 저항감 (낮을수록 뻑뻑함)
            
            // 드래그 리스너 비활성화 (핸들로만 제어)
            dragListener={false} 
            dragControls={controls}
            onDragEnd={handleDragEnd}
            
            style={{ 
              maxHeight: "90dvh",
              touchAction: "none" 
            }}
            
            className={`relative w-full max-w-[430px] bg-white rounded-t-[20px] shadow-2xl overflow-hidden flex flex-col ${className}`}
          >
            {/* 드래그 핸들 (터치 영역 확장) */}
            <div 
              className="w-full flex justify-center pt-4 pb-2 shrink-0 cursor-grab active:cursor-grabbing touch-none"
              // [팁] 핸들 영역을 조금 더 넓게 잡기 위해 pt/pb 조정
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* 컨텐츠 영역 */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}