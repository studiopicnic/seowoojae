"use client";

import { Book } from "@/types/book";

interface ReadingControllerProps {
  book: Book;
  currentPage: number;
  totalPage: number;
  percentage: number;
  
  onSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCurrentPageClick: () => void;
  onTotalPageClick: () => void;
  onStartReading: () => void;
  onFinishReading: () => void;
}

export default function ReadingController({
  book,
  currentPage,
  totalPage,
  percentage,
  onSliderChange,
  onCurrentPageClick,
  onTotalPageClick,
  onStartReading,
  onFinishReading
}: ReadingControllerProps) {

  const isReading = book.status === "reading";
  const isFinished = book.status === "finished";

  return (
    <>
      {/* 게이지 바 영역 (Reading 상태일 때만) */}
      {isReading && (
        <div className="mb-10 pt-2">
          <div className="relative w-full h-6 flex items-center mb-2">
            <input
              type="range"
              min="0"
              max={totalPage || 1} 
              value={currentPage}
              onChange={onSliderChange}
              disabled={totalPage === 0} 
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-black z-20"
              style={{
                background: `linear-gradient(to right, black ${percentage}%, #e5e7eb ${percentage}%)`
              }}
            />
            
            {totalPage > 0 && (
              <button 
                onClick={onCurrentPageClick}
                className="absolute top-8 transform -translate-x-1/2 bg-white border border-gray-300 px-2 py-1 rounded text-[12px] font-medium text-gray-900 shadow-sm z-30 active:scale-95 transition-transform"
                style={{ left: `${percentage}%` }}
              >
                {currentPage}p
              </button>
            )}
          </div>

          <div className="flex justify-between text-[12px] text-gray-400 px-1">
            <span>0</span>
            <button 
              onClick={onTotalPageClick}
              className="underline cursor-pointer decoration-gray-300 active:text-gray-900"
            >
              {totalPage > 0 ? totalPage : "직접입력"}
            </button>
          </div>
        </div>
      )}

      {/* 작가 및 책 정보 */}
      <div className={`flex gap-8 border-t border-gray-100 pt-6 ${isFinished ? 'mt-8 mb-8' : 'mt-6 mb-8'}`}>
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

      <div className="text-[15px] text-gray-600 leading-relaxed border-t border-gray-100 pt-6 mb-12">
        {book.contents ? book.contents : "책 소개가 없습니다."}
      </div>
      
      {/* 하단 액션 버튼 */}
      {!isFinished && (
        isReading ? (
          <button
            onClick={onFinishReading}
            className="w-full py-4 bg-black text-white text-[16px] font-bold rounded-xl active:scale-[0.98] transition-transform mb-10"
          >
            독서 완료
          </button>
        ) : (
          <button
            onClick={onStartReading}
            className="w-full py-4 bg-black text-white text-[16px] font-bold rounded-xl active:scale-[0.98] transition-transform"
          >
            독서 시작
          </button>
        )
      )}
    </>
  );
}