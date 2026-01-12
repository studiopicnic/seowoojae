"use client";

import { Book } from "@/types/book";

interface BookHeroSectionProps {
  book: Book;
  percentage: number;
  onDateClick: () => void;
  onRatingClick: () => void;
}

export default function BookHeroSection({ 
  book, 
  percentage, 
  onDateClick, 
  onRatingClick 
}: BookHeroSectionProps) {
  
  const isReading = book.status === "reading";
  const isFinished = book.status === "finished";

  // 날짜 포맷 함수 (내부 사용)
  const getYYMMDD = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-gray-900 leading-snug mb-1">
          {book.title}
        </h2>
        
        {/* 날짜 표시 */}
        {isReading && (
          <button 
            onClick={onDateClick}
            className="text-[13px] text-gray-500 underline decoration-gray-300 underline-offset-4 cursor-pointer"
          >
            {getYYMMDD(book.start_date || book.created_at || new Date().toISOString())} -
          </button>
        )}
        {isFinished && (
           <button 
              onClick={onDateClick}
              className="text-[13px] text-gray-500 underline decoration-gray-300 underline-offset-4 cursor-pointer"
           >
            {getYYMMDD(book.start_date || book.created_at)} - {getYYMMDD(book.end_date || new Date().toISOString())}
          </button>
        )}
      </div>

      <div className="flex justify-between items-end mb-8 relative">
        {/* 표지 이미지 */}
        <div className="w-[140px] shadow-md relative z-10">
          {book.thumbnail ? (
            <img src={book.thumbnail} alt={book.title} className="w-full h-auto object-cover" />
          ) : (
            <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center text-gray-400">No Img</div>
          )}
        </div>

        {/* 퍼센트(Reading) */}
        {isReading && (
          <div className="text-[32px] font-bold text-gray-900 mb-[-4px]">
            {percentage}%
          </div>
        )}

        {/* 평점(Finished) */}
        {isFinished && (
          <div className="flex items-end gap-1 mb-[-4px]">
            <button 
              onClick={onRatingClick}
              className="text-[32px] font-bold text-gray-900 active:text-gray-600 transition-colors"
            >
              {book.rating !== null && book.rating !== undefined ? book.rating : "-"}
            </button>
            <span className="text-[20px] font-medium text-gray-400 mb-[6px]">/ 5</span>
          </div>
        )}
      </div>
    </>
  );
}