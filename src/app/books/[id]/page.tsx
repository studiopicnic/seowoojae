"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Book, Memo } from "@/types/book";

// 컴포넌트들
import BookHeader from "@/components/book-detail/BookHeader";
import BookHeroSection from "@/components/book-detail/BookHeroSection";
import ReadingController from "@/components/book-detail/ReadingController";
import MemoSection from "@/components/book-detail/MemoSection";

// 모달들
import InputModal from "@/components/common/InputModal";
import DateSettingsModal from "@/components/book/DateSettingsModal";
import ConfirmModal from "@/components/common/ConfirmModal"; // [추가]

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  // ... (기존 상태들 유지) ...
  const [book, setBook] = useState<Book | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  // 모달 상태들
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputModalType, setInputModalType] = useState<"current" | "total" | "rating">("current");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  
  // [추가] 독서 완료 확인 모달 상태
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);

  // ... (fetchBookDetail, handleDeleteBook, handleDateUpdate 등 기존 로직 유지) ...
  const fetchBookDetail = useCallback(async () => {
     // ... (기존 코드 생략) ...
     const { data: bookData, error } = await supabase.from("books").select("*").eq("id", params.id).single();
     if (bookData) {
        setBook(bookData);
        setCurrentPage(bookData.current_page || 0);
        setTotalPage(bookData.total_page || 0);
     }
     // ... (메모 로딩 등) ...
     setIsLoading(false);
  }, [params?.id, supabase]);

  useEffect(() => { fetchBookDetail(); }, [fetchBookDetail]);

  // ... (handleDeleteBook, handleDateUpdate, handleStartReading 등 기존 함수 유지) ...

  const handleStartReading = async () => {
    // ... (기존과 동일)
    if (!book?.id) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("books").update({ status: "reading", start_date: now, total_page: totalPage }).eq("id", book.id);
    if (error) return alert("오류 발생");
    setBook({ ...book, status: "reading", start_date: now });
  };


  // [수정] 1. 버튼 누르면 모달만 엽니다.
  const handleFinishButton = () => {
    setIsFinishConfirmOpen(true);
  };

  // [수정] 2. 실제 완료 처리 로직 (모달에서 '확인' 누르면 실행됨)
  const executeFinishReading = async () => {
    if (!book?.id) return;

    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from("books")
      .update({ 
        status: "finished", 
        end_date: now, 
        current_page: totalPage 
      })
      .eq("id", book.id);

    if (error) {
      alert("처리 중 오류가 발생했습니다.");
      return;
    }

    setBook({ ...book, status: "finished", end_date: now });
    setCurrentPage(totalPage);
  };

  // ... (handleSliderChange, openInputModal, handleInputConfirm, getModalTitle 등 유지) ...
  const handleSliderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = Number(e.target.value);
      setCurrentPage(newVal);
      if (book?.id) await supabase.from("books").update({ current_page: newVal }).eq("id", book.id);
  };
  const openInputModal = (type: "current" | "total" | "rating") => {
    setInputModalType(type);
    setIsInputModalOpen(true);
  };
  const handleInputConfirm = async (value: number) => {
    // ... (기존 로직 유지) ...
    if (!book?.id) return;
    if (inputModalType === "current") {
        const validValue = totalPage > 0 ? Math.min(value, totalPage) : value;
        setCurrentPage(validValue);
        await supabase.from("books").update({ current_page: validValue }).eq("id", book.id);
    } else if (inputModalType === "total") {
        setTotalPage(value);
        // ... (나머지 로직)
    } else if (inputModalType === "rating") {
        const validRating = Math.min(Math.max(value, 0), 5);
        await supabase.from("books").update({ rating: validRating }).eq("id", book.id);
        setBook({ ...book, rating: validRating });
    }
  };
  
  // 렌더링 헬퍼
  const percentage = totalPage > 0 ? Math.floor((currentPage / totalPage) * 100) : 0;
  if (isLoading || !book) return <div className="min-h-screen bg-white" />;

  // ... (getModalTitle 등) ...
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

  const handleDeleteBook = async () => {
      // ... 삭제 로직 ...
      // 참고: 삭제도 나중에 ConfirmModal로 바꾸면 좋습니다. 일단은 그대로 둡니다.
      if (!book?.id) return;
      if (!confirm("정말 삭제하시겠습니까?")) return;
      await supabase.from("books").delete().eq("id", book.id);
      router.replace("/home");
  };
  const handleDateUpdate = async (start: Date, end: Date | null) => {
      // ... 기존 날짜 업데이트 로직 ...
      if(!book?.id) return;
      const updates: any = { start_date: start.toISOString() };
      if (end) updates.end_date = end.toISOString();
      await supabase.from("books").update(updates).eq("id", book.id);
      setBook({ ...book, ...updates });
  };


  return (
    <div className="fixed inset-0 flex flex-col bg-white max-w-[430px] mx-auto shadow-2xl overflow-hidden">
      
      {/* [추가] 독서 완료 확인 모달 */}
      <ConfirmModal
        isOpen={isFinishConfirmOpen}
        onClose={() => setIsFinishConfirmOpen(false)}
        onConfirm={executeFinishReading} // 확인 누르면 실행
        title="독서 완료"
        message="이 책을 다 읽으셨나요?"
        confirmText="완료"
      />

      {/* 기존 모달들 */}
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

      <BookHeader onDelete={handleDeleteBook} />

      <main 
        className="flex-1 px-6 pt-2 pb-10 overflow-y-auto overscroll-y-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <BookHeroSection 
          book={book} 
          percentage={percentage}
          onDateClick={() => setIsDateModalOpen(true)}
          onRatingClick={() => openInputModal("rating")}
        />

        <ReadingController 
          book={book}
          currentPage={currentPage}
          totalPage={totalPage}
          percentage={percentage}
          onSliderChange={handleSliderChange}
          onCurrentPageClick={() => openInputModal("current")}
          onTotalPageClick={() => openInputModal("total")}
          onStartReading={handleStartReading}
          onFinishReading={handleFinishButton} // [수정] 모달 여는 함수 연결
        />

        <MemoSection 
          memos={memos}
          onAddMemo={() => alert("메모 작성 모달 열기")}
          isReadingOrFinished={book.status === "reading" || book.status === "finished"}
        />
      </main>
    </div>
  );
}