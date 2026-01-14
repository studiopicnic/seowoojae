"use client";

import { ReactNode } from "react";

interface SafeScrollAreaProps {
  children: ReactNode;
  className?: string;
}

export default function SafeScrollArea({ children, className = "" }: SafeScrollAreaProps) {
  return (
    <div
      // 1. 스크롤 컨테이너 설정
      className={`flex-1 overflow-y-auto min-h-0 scrollbar-hide ${className}`}
      style={{
        // 2. 핵심 방어막: 스크롤이 끝에 닿아도 부모(화면)로 전파하지 않음
        overscrollBehavior: "contain",
        // 3. 터치 동작 제어: 수직 스크롤만 허용
        touchAction: "pan-y",
        // 4. iOS 가속 스크롤 활성화
        WebkitOverflowScrolling: "touch",
      }}
      // 이제 onTouchMove 같은 JS 핸들러는 필요 없습니다. CSS 구조로 해결합니다.
    >
      {/* [핵심 트릭] 1px 더 큰 래퍼 
        내용물이 없거나 짧아도, 무조건 부모보다 1px 크게 만들어서
        브라우저가 "아, 여기는 스크롤 되는 곳이구나"라고 인식하게 만듭니다.
        그래야 위의 'overscroll-behavior: contain'이 작동합니다.
      */}
      <div className="min-h-[calc(100%+1px)]">
        {children}
      </div>
    </div>
  );
}