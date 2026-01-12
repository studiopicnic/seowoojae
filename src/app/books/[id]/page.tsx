"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Book, Memo } from "@/types/book";

// [분리된 컴포넌트들]
import BookHeader from "@/components/book-detail/BookHeader";
import BookHeroSection from "@/components/book-detail/BookHeroSection";
import ReadingController from "@/components/book-detail/ReadingController";
import MemoSection from "@/components/book-detail/MemoSection";

// [모달들]
import InputModal from "@/components/common/InputModal";
import DateSettingsModal from "@/components/book/DateSettingsModal";

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  // --- [상태 관리] ---
  const [book, setBook] = useState<Book | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  // rating 상태는 book 객체 안의 것을 써도 되지만, 즉각적인 UI 반영을 위해 로컬 state 활용 가능
  // 여기선 book.rating을 바로 쓰되, 업데이트 시 book 상태를 갱신하는 방식으로 통일

  // 모달 상태
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputModalType, setInputModalType] = useState<"current" | "total" | "rating">("current");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // --- [데이터 로딩] ---
  const fetchBookDetail = useCallback(async () => {
    if (!params?.id) return;

    const { data: bookData, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("책 정보 로딩 실패:", error);
      setIsLoading(false);
      return;
    }

    if (bookData) {
      setBook(bookData);
      setCurrentPage(bookData.current_page || 0);
      setTotalPage(bookData.total_page || 0);
    }

    const { data: memoData } = await supabase
      .from("memos")
      .select("*")
      .eq("book_id", params.id)
      .order("created_at", { ascending: false });

    if (memoData) setMemos(memoData);
    setIsLoading(false);
  }, [params?.id, supabase]);

  useEffect(() => {
    fetchBookDetail();
  }, [fetchBookDetail]);

  // --- [핸들러 함수들] ---
  
  // 1. 책 삭제
  const handleDeleteBook = async () => {
    if (!book?.id) return;
    if (!confirm("정말 이 책을 삭제하시겠습니까?\n작성한 메모도 함께 삭제됩니다.")) return;

    const { error } = await supabase.from("books").delete().eq("id", book.id);
    if (error) {
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }
    router.replace("/home");
  };

  // 2. 날짜 업데이트
  const handleDateUpdate = async (newStart: Date, newEnd: Date | null) => {
    if (!book?.id) return;
    const updates: any = { start_date: newStart.toISOString() };
    if (newEnd) updates.end_date = newEnd.toISOString();

    const { error } = await supabase.from("books").update(updates).eq("id", book.id);
    if (error) {
      alert("오류 발생"); return;
    }
    setBook({ ...book, start_date: updates.start_date, end_date: updates.end_date || book.end_date });
  };

  // 3. 독서 시작
  const handleStartReading = async () => {
    if (!book?.id) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("books").update({ status: "reading", start_date: now, total_page: totalPage }).eq("id", book.id);
    if (error) return alert("오류 발생");
    setBook({ ...book, status: "reading", start_date: now });
  };

  // 4. 독서 완료
  const handleFinishReading = async () => {
    if (!book?.id) return;
    if (!confirm("독서를 완료 처리하시겠습니까?")) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("books").update({ status: "finished", end_date: now, current_page: totalPage }).eq("id", book.id);
    if (error) return alert("오류 발생");
    setBook({ ...book, status: "finished", end_date: now });
    setCurrentPage(totalPage);
  };

  // 5. 슬라이더 변경
  const handleSliderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    setCurrentPage(newVal);
    if (book?.id) await supabase.from("books").update({ current_page: newVal }).eq("id", book.id);
  };

  // 6. 숫자/평점 입력 모달 열기
  const openInputModal = (type: "current" | "total" | "rating") => {
    setInputModalType(type);
    setIsInputModalOpen(true);
  };

  // 7. 모달 확인 (값 업데이트)
  const handleInputConfirm = async (value: number) => {
    if (!book?.id) return;

    if (inputModalType === "current") {
      const validValue = totalPage > 0 ? Math.min(value, totalPage) : value;
      setCurrentPage(validValue);
      await supabase.from("books").update({ current_page: validValue }).eq("id", book.id);
    } else if (inputModalType === "total") {
      setTotalPage(value);
      if (value < currentPage) {
        setCurrentPage(value);
        await supabase.from("books").update({ total_page: value, current_page: value }).eq("id", book.id);
      } else {
        await supabase.from("books").update({ total_page: value }).eq("id", book.id);
      }
    } else if (inputModalType === "rating") {
      const validRating = Math.min(Math.max(value, 0), 5);
      await supabase.from("books").update({ rating: validRating }).eq("id", book.id);
      setBook({ ...book, rating: validRating }); // 로컬 반영
    }
  };

  // --- [렌더링 헬퍼] ---
  const percentage = totalPage > 0 ? Math.floor((currentPage / totalPage) * 100) : 0;
  
  if (isLoading) return <div className="min-h-screen bg-white" />;
  if (!book) return <div className="min-h-screen bg-white" />;

  const getModalTitle = () => {
    if (inputModalType === "rating") return "평점 입력 (0~5)";
    if (inputModalType === "current") return "현재 페이지 수정";
    return "총 페이지 수 입력";
  };
  const getModalInitialValue = () => {
    if (inputModalType === "rating") return book.rating || 5;
    if (inputModalType === "current") return currentPage;
    return totalPage;
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white max-w-[430px] mx-auto shadow-2xl overflow-hidden">
      
      {/* 모달들 */}
      <DateSettingsModal 
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onConfirm={handleDateUpdate}
        initialStartDate={book.start_date || book.created_at}
        initialEndDate={book.end_date}
        isFinished={book.status === "finished"}
      />
      <InputModal 
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onConfirm={handleInputConfirm}
        title={getModalTitle()}
        initialValue={getModalInitialValue()}
      />

      {/* 1. 헤더 */}
      <BookHeader onDelete={handleDeleteBook} />

      {/* 본문 */}
      <main 
        className="flex-1 px-6 pt-2 pb-10 overflow-y-auto overscroll-y-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* 2. 책 정보 & 날짜 & 평점 */}
        <BookHeroSection 
          book={book} 
          percentage={percentage}
          onDateClick={() => setIsDateModalOpen(true)}
          onRatingClick={() => openInputModal("rating")}
        />

        {/* 3. 독서 컨트롤러 (슬라이더, 버튼) */}
        <ReadingController 
          book={book}
          currentPage={currentPage}
          totalPage={totalPage}
          percentage={percentage}
          onSliderChange={handleSliderChange}
          onCurrentPageClick={() => openInputModal("current")}
          onTotalPageClick={() => openInputModal("total")}
          onStartReading={handleStartReading}
          onFinishReading={handleFinishReading}
        />

        {/* 4. 메모 리스트 */}
        <MemoSection 
          memos={memos}
          onAddMemo={() => alert("메모 작성 모달 열기")}
          isReadingOrFinished={book.status === "reading" || book.status === "finished"}
        />

      </main>
    </div>
  );
}