"use client";

import { useEffect } from "react"; // useEffect 추가
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Book } from "@/types/book";

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onAdd: (book: Book) => void;
  isAdded: boolean;
}

export default function BookDetailModal({ book, onClose, onAdd, isAdded }: BookDetailModalProps) {
  
  // [수정 포인트] 상세 모달 열림 -> Body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative w-full max-w-[430px] h-full bg-white flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="px-6 pt-12 pb-4 flex justify-end">
          <button onClick={onClose} className="p-2 -mr-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
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
          <div className="absolute bottom-8 left-0 w-full flex justify-center">
            <button
              onClick={() => onAdd(book)}
              className="w-[60px] h-[44px] bg-black text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}