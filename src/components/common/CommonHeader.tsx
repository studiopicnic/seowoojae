"use client";

import { ReactNode } from "react";

interface CommonHeaderProps {
  title?: string;
  
  // 아이콘 및 클릭 이벤트
  leftIcon?: ReactNode;
  onLeftClick?: () => void;
  rightIcon?: ReactNode;
  onRightClick?: () => void;
  
  // [레이아웃 타입] default: 모달용(중앙) / tab: 메인탭용(좌측, 24px)
  type?: "default" | "tab";
  
  // [색상 테마] default: 흰배경+검은글씨 / transparent: 투명배경+흰글씨 (오버레이용)
  variant?: "default" | "transparent"; 
  
  className?: string;
}

export default function CommonHeader({
  title,
  leftIcon,
  onLeftClick,
  rightIcon,
  onRightClick,
  type = "default",      // 기본 레이아웃: 모달형
  variant = "default",   // 기본 테마: 흰 배경
  className = "",
}: CommonHeaderProps) {
  
  const isTab = type === "tab";
  const isTransparent = variant === "transparent";

  // 색상 클래스 결정
  const baseTextColor = isTransparent ? "text-white" : "text-gray-900";
  const bgColor = isTransparent ? "bg-transparent" : "bg-white";
  const iconHoverBg = isTransparent ? "active:bg-white/20" : "active:bg-gray-100";

  return (
    <header
      className={`relative flex items-center justify-between px-4 py-3 shrink-0 z-10 transition-colors ${bgColor} ${className}`}
    >
      {/* 1. 좌측 영역 */}
      {(type === "default" || leftIcon) && (
        <div className={`flex justify-start ${isTab ? "mr-2" : "w-10"}`}>
          {leftIcon && (
            <button
              onClick={onLeftClick}
              className={`p-1 -ml-1 rounded-full transition-colors ${baseTextColor} ${iconHoverBg}`}
            >
              {leftIcon}
            </button>
          )}
        </div>
      )}

      {/* 2. 타이틀 영역 */}
      <h1
        className={`font-bold truncate ${baseTextColor} ${
          isTab 
            ? "flex-1 text-left text-[24px]" // Tab: 24px, 좌측
            : "text-center text-[17px] absolute left-1/2 -translate-x-1/2 max-w-[60%]" // Default: 17px, 중앙
        }`}
      >
        {title}
      </h1>

      {/* 3. 우측 영역 */}
      <div className={`flex justify-end ${isTab ? "" : "w-10"}`}>
        {rightIcon && (
          <button
            onClick={onRightClick}
            className={`p-1 -mr-1 rounded-full transition-colors ${baseTextColor} ${iconHoverBg}`}
          >
            {rightIcon}
          </button>
        )}
      </div>
    </header>
  );
}