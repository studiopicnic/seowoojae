"use client";

import { Plus } from "lucide-react";
import { Book } from "@/types/book";
import FullScreenModal from "@/components/common/FullScreenModal";

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onAdd: (book: Book) => void;
  isAdded: boolean;
}

export default function BookDetailModal({ book, onClose, onAdd, isAdded }: BookDetailModalProps) {
  // FullScreenModal이 isOpen 제어를 내부적으로 하지 않고, 부모(SearchModal)가 렌더링 여부를 결정하므로
  // 여기서는 isOpen={true}로 넘겨줍니다. (컴포넌트 자체가 조건부 렌더링 되기 때문)
  
  return (
    <FullScreenModal isOpen={true} onClose={onClose} title="">
      
      {/* 기존 디자인 그대로 유지 */}
      <div className="px-6 pb-24 pt-2">
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
        <div className="absolute bottom-8 left-0 w-full flex justify-center pointer-events-none z-20">
          <button
            onClick={() => onAdd(book)}
            className="pointer-events-auto w-[60px] h-[44px] bg-black text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
    </FullScreenModal>
  );
}