"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, MoreHorizontal } from "lucide-react"; // [추가] 아이콘 직접 사용
import { createClient } from "@/utils/supabase/client";
import { Book, Memo, BookStatus } from "@/types/book";

// [수정] BookHeader 제거하고 CommonHeader 추가
import CommonHeader from "@/components/common/CommonHeader";
import BookHeroSection from "@/components/book-detail/BookHeroSection";
import ReadingController from "@/components/book-detail/ReadingController";
import MemoSection from "@/components/book-detail/MemoSection";
import BookMenuOverlay from "@/components/book-detail/BookMenuOverlay";
import BookSelectModal from "@/components/note/BookSelectModal";

// 모달들 (내부적으로 FullScreenModal 적용됨)
import InputModal from "@/components/common/InputModal";
import DateSettingsModal from "@/components/book/DateSettingsModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import RatingModal from "@/components/book/RatingModal";
import Toast from "@/components/common/Toast";

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const [book, setBook] = useState<Book | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  // --- 모달 상태 관리 ---
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputModalType, setInputModalType] = useState<"current" | "total">("current");
  
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 데이터 로딩
  const fetchBookDetail = useCallback(async () => {
    if (!params?.id) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }

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
  }, [params?.id, supabase, router]);

  useEffect(() => { fetchBookDetail(); }, [fetchBookDetail]);

  const executeDeleteBook = async () => {
    if (!book?.id) return;
    const { error } = await supabase.from("books").delete().eq("id", book.id);
    if (error) { alert("오류"); return; }
    router.replace("/home?toast=deleted");
  };

  const handleStatusChange = async (newStatus: BookStatus) => {
    if (!book?.id) return;
    const updates: any = { status: newStatus };
    const now = new Date().toISOString();
    if (newStatus === "reading") {
      if (!book.start_date) updates.start_date = now;
      updates.end_date = null;
    } else if (newStatus === "finished") {
      updates.end_date = now;
      if (!book.start_date) updates.start_date = now;
      updates.current_page = totalPage;
    } else if (newStatus === "wish") {
      updates.start_date = null;
      updates.end_date = null;
      updates.current_page = 0;
    }
    const { error } = await supabase.from("books").update(updates).eq("id", book.id);
    if (error) { alert("실패"); return; }
    setBook({ ...book, ...updates });
    if (updates.current_page !== undefined) setCurrentPage(updates.current_page);
    setIsMenuOpen(false);
  };

  const handleDateUpdate = async (start: Date, end: Date | null) => {
  if (!book?.id) return;

  const updates: any = { 
    start_date: start.toISOString() 
  };

  // [수정] 스키마에 맞춰 'end_date' 컬럼 사용
  if (end) {
    updates.end_date = end.toISOString();
  } else {
    updates.end_date = null; // 종료일이 없으면 null 처리
  }

  // Supabase 업데이트
  const { error } = await supabase
    .from("books")
    .update(updates)
    .eq("id", book.id);

  if (error) {
    console.error("날짜 업데이트 실패:", error);
    alert("날짜 저장에 실패했습니다.");
    return;
  }

  // 로컬 상태 즉시 반영
  setBook({ ...book, ...updates });
};

  const handleStartReading = async () => {
     if (!book?.id) return;
     const now = new Date().toISOString();
     const { error } = await supabase.from("books").update({ status: "reading", start_date: now, total_page: totalPage }).eq("id", book.id);
     if (error) return alert("오류");
     setBook({ ...book, status: "reading", start_date: now });
  };

  const handleFinishButton = () => { setIsFinishConfirmOpen(true); };

  const executeFinishReading = async () => {
     if (!book?.id) return;
     const now = new Date().toISOString();
     const { error } = await supabase.from("books").update({ status: "finished", end_date: now, current_page: totalPage }).eq("id", book.id);
     if (error) return alert("오류");
     setBook({ ...book, status: "finished", end_date: now });
     setCurrentPage(totalPage);
  };

  const handleSliderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const newVal = Number(e.target.value);
     setCurrentPage(newVal);
     if (book?.id) await supabase.from("books").update({ current_page: newVal }).eq("id", book.id);
  };

  const openInputModal = (type: "current" | "total") => { setInputModalType(type); setIsInputModalOpen(true); };

  const handleInputConfirm = async (value: number) => {
     if (!book?.id) return;
     if (inputModalType === "current") {
       const validValue = totalPage > 0 ? Math.min(value, totalPage) : value;
       setCurrentPage(validValue);
       await supabase.from("books").update({ current_page: validValue }).eq("id", book.id);
     } else {
       setTotalPage(value);
       if (value < currentPage) {
           setCurrentPage(value);
           await supabase.from("books").update({ total_page: value, current_page: value }).eq("id", book.id);
       } else {
           await supabase.from("books").update({ total_page: value }).eq("id", book.id);
       }
     }
  };

  const handleRatingUpdate = async (rating: number) => {
     if (!book?.id) return;
     const { error } = await supabase.from("books").update({ rating: rating }).eq("id", book.id);
     if (error) return alert("실패");
     setBook({ ...book, rating: rating });
  };

  const handleMemoSaved = () => {
    fetchBookDetail();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };


  const percentage = totalPage > 0 ? Math.floor((currentPage / totalPage) * 100) : 0;
  if (isLoading || !book) return <div className="min-h-screen bg-white" />;

  return (
    <div className="fixed inset-0 flex flex-col bg-white max-w-[430px] mx-auto shadow-2xl overflow-hidden">
      
      <Toast isVisible={showToast} message="새로운 노트가 추가되었습니다" />

      {/* 1. 더보기 메뉴 오버레이 (OverlayModal 적용됨) */}
      <BookMenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentStatus={book.status}
        onStatusChange={handleStatusChange}
        onDeleteClick={() => {
          setIsMenuOpen(false); 
          setIsDeleteConfirmOpen(true); 
        }}
      />

      {/* 2. 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={executeDeleteBook}
        title="이 책을 삭제하시겠습니까?"
        message="책의 독서 기록과 메모가 함께 삭제됩니다."
        confirmText="삭제"
        cancelText="취소"
        isDanger={true} 
      />

      {/* 3. 독서 완료 확인 모달 */}
      <ConfirmModal
        isOpen={isFinishConfirmOpen}
        onClose={() => setIsFinishConfirmOpen(false)}
        onConfirm={executeFinishReading}
        title="독서 완료"
        message="이 책을 다 읽으셨나요?"
        confirmText="완료"
      />

      {/* 4. 기타 모달들 (FullScreenModal 적용됨) */}
      <DateSettingsModal 
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onConfirm={handleDateUpdate}
        initialStartDate={book.start_date || book.created_at}
        initialEndDate={book.end_date}
        isFinished={book.status === "finished"}
      />
      <RatingModal 
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onConfirm={handleRatingUpdate}
        initialRating={book.rating}
      />
      <InputModal 
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onConfirm={handleInputConfirm}
        title={inputModalType === "current" ? "현재 페이지 수정" : "총 페이지 수 입력"}
        initialValue={inputModalType === "current" ? currentPage : totalPage}
      />

      <BookSelectModal 
        isOpen={isMemoModalOpen}
        onClose={() => setIsMemoModalOpen(false)}
        onSaveComplete={handleMemoSaved}
        initialBook={book} 
      />

      {/* --- 메인 화면 --- */}
      
      {/* [수정 완료] 공통 헤더 적용 */}
      <CommonHeader 
        // 왼쪽: 뒤로가기
        leftIcon={<ChevronLeft className="w-6 h-6" />}
        onLeftClick={() => router.back()}
        
        // 오른쪽: 더보기 메뉴
        rightIcon={<MoreHorizontal className="w-6 h-6" />}
        onRightClick={() => setIsMenuOpen(true)}
      />

      <main 
        className="flex-1 px-6 pt-2 pb-10 overflow-y-auto overscroll-y-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <BookHeroSection 
          book={book} 
          percentage={percentage}
          onDateClick={() => setIsDateModalOpen(true)}
          onRatingClick={() => setIsRatingModalOpen(true)}
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
          onFinishReading={handleFinishButton}
        />

        <MemoSection 
          memos={memos}
          onAddMemo={() => setIsMemoModalOpen(true)} 
          isReadingOrFinished={book.status === "reading" || book.status === "finished"}
        />
      </main>
    </div>
  );
}