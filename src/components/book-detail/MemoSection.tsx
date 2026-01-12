"use client";

import { Memo } from "@/types/book";
import { ChevronRight } from "lucide-react";

interface MemoSectionProps {
  memos: Memo[];
  onAddMemo: () => void;
  isReadingOrFinished: boolean; // 메모 섹션을 보여줄지 여부
}

export default function MemoSection({ memos, onAddMemo, isReadingOrFinished }: MemoSectionProps) {
  
  // 날짜 포맷 함수
  const getYYMMDD = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
  };

  if (!isReadingOrFinished) return null;

  return (
    <div className="border-t border-gray-100 pt-6 pb-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[16px] font-bold text-gray-900">메모</h3>
        <button 
          onClick={onAddMemo}
          className="text-[13px] text-gray-500 flex items-center gap-1 active:text-black"
        >
          추가하기 <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {memos.length === 0 ? (
        <div className="py-6 bg-gray-50 rounded-lg text-center">
          <p className="text-[13px] text-gray-400 leading-relaxed">
            책을 읽고 좋았던 부분이나<br/>느낀 감정을 적어보세요.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {memos.map((memo) => (
            <div key={memo.id} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-[12px] text-gray-400 mb-2">
                {getYYMMDD(memo.created_at)}
              </p>
              <p className="text-[14px] text-gray-900 leading-relaxed whitespace-pre-wrap">
                {memo.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}