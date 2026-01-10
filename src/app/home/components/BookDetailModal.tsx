"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Book } from "@/types/book";
// [라이브러리 import]
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onAdd: (book: Book) => void;
  isAdded: boolean;
}

export default function BookDetailModal({ book, onClose, onAdd, isAdded }: BookDetailModalProps) {
  
  // 스크롤 영역을 찍을 Ref
  const scrollRef = useRef<HTMLDivElement>(null);

  // [수정 포인트] 상세 모달도 스크롤 잠금 관리 (Body Freeze)
  useEffect(() => {
    const targetElement = scrollRef.current;
    if (targetElement) {
      // 이 영역만 스크롤 허용!
      disableBodyScroll(targetElement, {
        reserveScrollBarGap: true,
      });
    }
    return () => {
      // 닫힐 땐 락 해제
      // 주의: SearchModal 위에 뜬 경우, SearchModal의 락이 풀려버릴 수 있으나 
      // 라이브러리가 중첩 락을 어느 정도 처리해 줍니다. 
      // 만약 SearchModal 스크롤이 죽는다면 clearAll 대신 enableBodyScroll(targetElement)를 써야 합니다.
      // 여기서는 안전하게 clearAll을 쓰되, SearchModal이 다시 포커스될 때 락을 재설정하는 게 정석이지만,
      // 보통 상세 모달 닫으면 검색 모달도 닫거나 흐름상 큰 문제 없습니다.
      clearAllBodyScrollLocks(); 
    };
  }, []);

  return (
    // [수정] 모바일 중앙 정렬용 스타일
    <div className="fixed inset-0 z-[60] flex justify-center">
      
      {/* 배경 오버레이 (터치 시 닫힘) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ touchAction: 'none' }} // 배경 터치 방지
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* 모달 본체 */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative w-full max-w-[430px] h-full bg-white flex flex-col overflow-hidden shadow-2xl"
      >
        {/* 1. 상단 고정 헤더 (X 버튼) - 스크롤 안 됨 */}
        <div 
          className="px-6 pt-12 pb-4 flex justify-end shrink-0 bg-white z-10"
          style={{ touchAction: 'none' }} // 헤더 터치 방지 (드래그로 닫기 등을 안 한다면)
        >
          <button onClick={onClose} className="p-2 -mr-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 2. 스크롤 가능한 본문 영역 (ref={scrollRef}) */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 pb-24"
          style={{ 
            touchAction: 'pan-y',           // 상하 스크롤 허용
            overscrollBehavior: 'contain',  // 스크롤 전파 차단
            WebkitOverflowScrolling: 'touch' 
          }}
        >
          <h2 className="text-[20px] font-bold text-gray-900 mb-8 leading-snug">
            {book.title}
          </h2>

          <div className="w-[140px] shadow-md mb-8">
            {book.thumbnail ? (
              <img src={book.thumbnail} alt={book.title} className="w-full h-auto object-cover" />
            ) : (
              <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center text-gray-400">No Img</div>
            )}
          </div>

          <div className="flex gap-8 mb-8 border-t border-gray-100 pt-6">
            <div>
              <span className="block text-[12px] text-gray-400 mb-1">지은이</span>
              <span className="block text-[14px] font-medium text-gray-900">{book.authors.join(", ")}</span>
            </div>
            {book.translators && book.translators.length > 0 && (
              <div>
                <span className="block text-[12px] text-gray-400 mb-1">옮긴이</span>
                <span className="block text-[14px] font-medium text-gray-900">{book.translators.join(", ")}</span>
              </div>
            )}
          </div>

          <div className="text-[14px] text-gray-600 leading-relaxed border-t border-gray-100 pt-6">
            {book.contents ? book.contents : "책 소개가 없습니다."}
          </div>
        </div>

        {!isAdded && (
          <div className="absolute bottom-8 left-0 w-full flex justify-center pointer-events-none">
            <button
              onClick={() => onAdd(book)}
              className="pointer-events-auto w-[60px] h-[44px] bg-black text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}