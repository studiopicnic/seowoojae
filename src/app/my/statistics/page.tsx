"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import CommonHeader from "@/components/common/CommonHeader";
import YearMonthSelectModal from "@/components/my/YearMonthSelectModal";

interface Book {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  created_at: string;
  end_date?: string;
  status: string;
  rating?: number;
}

export default function StatisticsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // [수정] ended_at 컬럼 추가 조회
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "finished")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBooks(data);
      }
      setIsLoading(false);
    };

    fetchBooks();
  }, [supabase]);

  // [수정] 필터링 로직 변경 (created_at -> ended_at 우선)
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // 마이페이지 그래프와 동일한 기준 적용
      const targetDateStr = book.end_date || book.created_at;
      const date = new Date(targetDateStr);
      
      return (
        date.getFullYear() === selectedYear &&
        date.getMonth() + 1 === selectedMonth
      );
    });
  }, [books, selectedYear, selectedMonth]);

  const handleDateApply = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <>
      <div className="absolute inset-0 flex flex-col bg-white">
        
        {/* 1. 헤더 */}
        <CommonHeader
          title="통계"
          type="default"
          leftIcon={<ChevronLeft className="w-6 h-6" />}
          onLeftClick={() => router.back()}
          className="shrink-0 border-b border-transparent"
        />

        {/* 2. 서브 헤더 (날짜 선택 트리거) */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-white z-10">
          <button 
            className="flex items-center gap-1 text-[18px] font-bold text-gray-900 active:opacity-60 transition-opacity"
            onClick={() => setIsDateModalOpen(true)}
          >
            {selectedYear}년 {selectedMonth}월
            <ChevronDown className="w-4 h-4 text-gray-900" />
          </button>
          <span className="text-[14px] text-gray-500 font-medium">
            총 {filteredBooks.length}권
          </span>
        </div>

        {/* 3. 리스트 영역 */}
        <main className="flex-1 px-6 pb-12 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="py-20 text-center text-sm text-gray-400">로딩 중...</div>
          ) : filteredBooks.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-400">기록된 책이 없습니다.</div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredBooks.map((book) => (
                <div 
                  key={book.id} 
                  className="flex gap-4 cursor-pointer active:opacity-70 transition-opacity"
                  onClick={() => router.push(`/books/${book.id}`)}
                >
                  <div className="w-[60px] h-[86px] bg-gray-100 rounded overflow-hidden shrink-0 border border-gray-100 relative">
                    {book.thumbnail ? (
                      <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No Img</div>
                    )}
                  </div>
                  <div className="flex flex-col py-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1">{book.title}</h3>
                    <p className="text-[13px] text-gray-500 truncate">{book.authors?.join(", ")}</p>
                    {book.rating && (
                      <p className="text-[12px] text-orange-500 mt-1 font-medium">★ {book.rating}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <YearMonthSelectModal 
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        initialYear={selectedYear}
        initialMonth={selectedMonth}
        onApply={handleDateApply}
      />
    </>
  );
}