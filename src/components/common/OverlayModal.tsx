"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";
import CommonHeader from "@/components/common/CommonHeader"; // [추가]

interface OverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode; // 메뉴 버튼들이 들어갈 자리
  title?: string;      // 필요시 상단 타이틀
}

export default function OverlayModal({
  isOpen,
  onClose,
  children,
  title
}: OverlayModalProps) {
  if (!isOpen) return null;

  return (
    // 레이아웃 컨테이너 (모바일 규격 제한)
    <div className="fixed inset-0 z-[60] flex flex-col h-[100dvh] max-w-[430px] mx-auto left-0 right-0">
      
      {/* 배경 (블러 처리 및 어두운 배경) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* 컨텐츠 레이어 (페이드 인 애니메이션) */}
      <div className="relative flex flex-col flex-1 z-10 text-white animate-in fade-in duration-200">
        
        {/* [수정 완료] 공통 헤더 적용 (투명 모드) */}
        {/* variant="transparent"를 넣어주면 흰색 글씨/아이콘으로 자동 변환됩니다 */}
        <CommonHeader 
          title={title}
          rightIcon={<X className="w-6 h-6" />}
          onRightClick={onClose}
          variant="transparent"
        />

        {/* 내부 컨텐츠 (여기에 버튼들이 들어옴) */}
        <div className="flex-1 flex flex-col justify-end px-6 pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}