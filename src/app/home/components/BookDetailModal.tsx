"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Book } from "@/types/book";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onAdd: (book: Book) => void;
  isAdded: boolean;
}

export default function BookDetailModal({ book, onClose, onAdd, isAdded }: BookDetailModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetElement = scrollRef.current;
    if (targetElement) {
      disableBodyScroll(targetElement, { reserveScrollBarGap: true });
    }
    return () => {
      clearAllBodyScrollLocks();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex justify-center">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ touchAction: 'none' }}
        onTouchMove={(e) => e.preventDefault()}
      />

      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative w-full max-w-[430px] h-full bg-white flex flex-col overflow-hidden shadow-2xl"
      >
        {/* [수정] 헤더 패딩값 변경 (상세 페이지와 통일) 
            - 기존: px-6 pt-12 pb-4
            - 변경: px-4 py-3 (높이 64px, 좌우 16px, 상하 12px)
        */}
        <div 
          className="flex items-center justify-end px-4 py-3 shrink-0 bg-white z-10"
          style={{ touchAction: 'none' }}
        >
          <button onClick={onClose} className="p-2 -mr-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 pb-24"
          style={{ 
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
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