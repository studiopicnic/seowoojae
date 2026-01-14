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

  // [핵심 로직] Body Scroll Lock (iOS 완벽 대응)
  useEffect(() => {
    if (isOpen) {
      // 1. 현재 스크롤 위치 저장
      const scrollY = window.scrollY;

      // 2. Body를 그 자리에 강제로 고정 (얼리기)
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden"; // 추가 안전장치
    } else {
      // 닫힐 때는 원래대로 복구하지 않음 (Clean-up 함수에서 처리)
      // *isOpen이 false로 변할 때도 아래 cleanup 함수가 실행되므로 여기선 비워둡니다.
    }

    // 3. Clean-up: 모달이 닫히거나 컴포넌트가 사라질 때 원상복구
    return () => {
      // 얼려놨던 스크롤 위치 가져오기
      const scrollY = document.body.style.top;
      
      // 스타일 초기화 (녹이기)
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      // 원래 스크롤 위치로 순간이동 (사용자는 모름)
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
            
            // 높이 설정:
            // max-height: 90dvh (화면의 90%까지만 사용)
            // h-auto: 내용물 크기만큼만 (메뉴 모달 등)
            // *키보드가 올라오면 -> Body가 고정되어 있으므로 화면이 밀리지 않고, 
            //  브라우저가 뷰포트를 줄이면서(layout.tsx 설정 덕분) 모달 하단이 키보드 위에 안착합니다.
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