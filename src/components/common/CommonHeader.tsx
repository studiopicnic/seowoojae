"use client";

import { ReactNode } from "react";

interface CommonHeaderProps {
  title?: string;
  leftIcon?: ReactNode;
  onLeftClick?: () => void;
  rightIcon?: ReactNode;
  onRightClick?: () => void;
  variant?: "default" | "transparent";
  align?: "center" | "left"; // [추가] 정렬 옵션 (기본값: center)
  className?: string;
}

export default function CommonHeader({
  title,
  leftIcon,
  onLeftClick,
  rightIcon,
  onRightClick,
  variant = "default",
  align = "center", // 기본값은 중앙 정렬
  className = "",
}: CommonHeaderProps) {
  const isTransparent = variant === "transparent";
  const baseTextColor = isTransparent ? "text-white" : "text-gray-900";
  const hoverBgColor = isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100";

  // 정렬 모드에 따른 텍스트 클래스 설정
  // left 모드일 때는 폰트를 조금 더 키워줍니다 (20px). center는 17px 유지.
  const titleClass = align === "left" 
    ? "text-left text-[20px] pl-2" 
    : "text-center text-[17px]";

  return (
    <header 
      className={`flex-none flex items-center justify-between px-4 py-3 z-10 relative transition-colors ${className} ${
        !isTransparent ? 'bg-white border-b border-transparent' : ''
      }`}
    >
      {/* [수정 핵심] 
        align이 'center'일 때는 좌측 아이콘이 없어도 밸런스를 위해 빈 공간(w-10)을 유지하지만,
        align이 'left'이고 아이콘이 없을 때는 빈 공간을 아예 없애서 텍스트를 앞으로 당깁니다.
      */}
      {(align === "center" || leftIcon) && (
        <div className="w-10 flex justify-start">
          {leftIcon && (
            <button
              onClick={onLeftClick}
              className={`p-2 -ml-2 rounded-full transition-colors ${baseTextColor} ${hoverBgColor}`}
            >
              {leftIcon}
            </button>
          )}
        </div>
      )}

      {/* 중앙(혹은 좌측) 타이틀 */}
      <h1 className={`flex-1 font-bold truncate ${baseTextColor} ${titleClass}`}>
        {title || ""}
      </h1>

      {/* 우측 영역 (40px 공간 확보) */}
      <div className="w-10 flex justify-end">
        {rightIcon && (
          <button
            onClick={onRightClick}
            className={`p-2 -mr-2 rounded-full transition-colors ${baseTextColor} ${hoverBgColor}`}
          >
            {rightIcon}
          </button>
        )}
      </div>
    </header>
  );
}