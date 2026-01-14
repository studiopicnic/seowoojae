"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import BottomNav from "@/components/common/BottomNav";
import CommonHeader from "@/components/common/CommonHeader";
import YearSelectModal from "@/components/my/YearSelectModal";
import ConfirmModal from "@/components/common/ConfirmModal"; // [추가]

interface Book {
  id: string;
  status: string;
  created_at: string;
}

export default function MyPage() {
  const supabase = createClient();
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // 모달 상태 관리
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // [추가] 로그아웃 모달 상태

  // 1. 페이지 로드 시 저장된 연도 불러오기
  useEffect(() => {
    const savedYear = localStorage.getItem("my_selected_year");
    if (savedYear) {
      setCurrentYear(Number(savedYear));
    }
  }, []);

  // 2. 연도 변경 핸들러
  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    localStorage.setItem("my_selected_year", String(year));
  };

  // 데이터 로드
  useEffect(() => {
    const fetchBooks = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("books")
        .select("id, status, created_at")
        .eq("user_id", user.id)
        .eq("status", "finished");

      if (!error && data) {
        setBooks(data);
      }
      setLoading(false);
    };

    fetchBooks();
  }, [supabase, router]);

  // 통계 데이터 계산
  const stats = useMemo(() => {
    const monthlyCounts = Array(12).fill(0);
    books.forEach((book) => {
      const date = new Date(book.created_at);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        monthlyCounts[month] += 1;
      }
    });
    const totalCount = monthlyCounts.reduce((a, b) => a + b, 0);
    const maxCount = Math.max(...monthlyCounts);
    return { monthlyCounts, totalCount, maxCount };
  }, [books, currentYear]);

  // [변경] 로그아웃 버튼 클릭 핸들러 (모달 열기)
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  // [신규] 실제 로그아웃 처리 (모달 확인 클릭 시)
  const handleLogoutConfirm = async () => {
    localStorage.removeItem("my_selected_year");
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <>
      {/* [수정] fixed inset-0으로 전체 화면 고정 (헤더 고정 효과) */}
      <div className="fixed inset-0 flex flex-col bg-white">
        
        {/* 1. 헤더 (고정) */}
        <CommonHeader 
          title="마이" 
          type="tab"
          className="shrink-0"
        />

        {/* 2. 메인 컨텐츠 (스크롤 영역) */}
        <main className="flex-1 px-6 space-y-8 pt-4 overflow-y-auto scrollbar-hide pb-24">
          {/* 통계 섹션 */}
          <section>
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer active:opacity-60 transition-opacity"
              onClick={() => router.push("/my/statistics")}
            >
              <h2 className="text-[16px] font-bold text-gray-500">통계</h2>
              <button className="p-1 -mr-2 text-gray-400 hover:text-gray-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-end justify-between mb-8">
              <button 
                className="flex items-center gap-1 text-[18px] font-bold text-gray-900 active:opacity-70 transition-opacity"
                onClick={() => setIsYearModalOpen(true)}
              >
                {currentYear}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <span className="text-[14px] font-medium text-gray-900">
                {stats.totalCount}권
              </span>
            </div>

            {/* 그래프 */}
            <div className="w-full h-[180px] flex items-end justify-between gap-2">
              {stats.monthlyCounts.map((count, index) => {
                let heightPercent = 0;
                if (stats.maxCount > 0) {
                  heightPercent = (count / stats.maxCount) * 100;
                }
                const isZero = count === 0;
                const barStyle = isZero 
                  ? { height: "6px" } 
                  : { height: `${Math.max(heightPercent, 10)}%` };

                return (
                  <div key={index} className="flex flex-col items-center justify-end w-full h-full gap-2 group">
                    <span className={`text-[11px] font-medium mb-1 transition-colors ${
                      isZero ? "text-gray-300" : "text-gray-600 font-bold"
                    }`}>
                      {count}
                    </span>
                    <div 
                      className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500 ease-out ${
                        isZero ? "bg-gray-100" : "bg-gray-800"
                      }`}
                      style={barStyle}
                    />
                    <span className="text-[11px] text-gray-400 font-medium">
                      {index + 1}월
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 메뉴 리스트 */}
          <section className="space-y-1">
            <button 
              onClick={() => router.push("/my/library")}
              className="flex items-center justify-between w-full py-4 bg-white active:bg-gray-50 transition-colors"
            >
              <span className="text-[16px] font-medium text-gray-900">내 서재</span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            <hr className="border-gray-50" />

            <button className="flex items-center justify-between w-full py-4 bg-white active:bg-gray-50 transition-colors">
              <span className="text-[16px] font-medium text-gray-900">문의하기</span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            <hr className="border-gray-50" />

            {/* [변경] 로그아웃 버튼 클릭 시 모달 오픈 */}
            <button 
              onClick={handleLogoutClick}
              className="flex items-center justify-between w-full py-4 bg-white active:bg-gray-50 transition-colors"
            >
              <span className="text-[16px] font-medium text-gray-900">로그아웃</span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </section>
        </main>
      </div>

      <BottomNav />

      {/* 연도 선택 모달 */}
      <YearSelectModal 
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        currentYear={currentYear}
        onSelectYear={handleYearChange} 
      />

      {/* [추가] 로그아웃 확인 모달 */}
      <ConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="로그아웃하시겠습니까?"
        message=" " // 공백을 주어 레이아웃 유지
        confirmText="확인"
        cancelText="취소"
        isDanger={false} // 파란색(혹은 기본) 버튼 스타일
      />
    </>
  );
}