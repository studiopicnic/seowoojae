"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import CommonHeader from "@/components/common/CommonHeader";
import ConfirmModal from "@/components/common/ConfirmModal";
import Toast from "@/components/common/Toast";

interface Book {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  status: "reading" | "wish" | "finished";
  created_at: string;
}

type TabType = "reading" | "wish" | "finished";

const TABS: { id: TabType; label: string }[] = [
  { id: "reading", label: "읽고 있는 책" },
  { id: "wish", label: "읽고 싶은 책" },
  { id: "finished", label: "읽은 책" },
];

export default function MyLibraryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabType>("reading");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const fetchBooks = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("books")
      .select("id, title, authors, thumbnail, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBooks(data as Book[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, [supabase, router]);

  const currentBooks = useMemo(() => {
    return books.filter((book) => book.status === activeTab);
  }, [books, activeTab]);

  const toggleEditMode = () => setIsEditMode((prev) => !prev);

  const handleDeleteRequest = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    setDeleteTargetId(bookId);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const { error } = await supabase.from("books").delete().eq("id", deleteTargetId);
      if (error) throw error;
      setBooks((prev) => prev.filter((b) => b.id !== deleteTargetId));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error(error);
      alert("삭제 실패");
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <>
      {/* [수정] fixed inset-0으로 전체 화면 고정 */}
      <div className="fixed inset-0 flex flex-col bg-white">
        <Toast isVisible={showToast} message="책이 삭제되었습니다" />

        {/* 1. 헤더 (고정) */}
        <CommonHeader
          title="내 서재"
          type="default"
          leftIcon={<ChevronLeft className="w-6 h-6" />}
          onLeftClick={() => router.back()}
          rightIcon={
            <span className={`text-[14px] font-medium transition-colors ${
              isEditMode ? "text-blue-600 font-bold" : "text-gray-900"
            }`}>
              {isEditMode ? "완료" : "삭제"}
            </span>
          }
          onRightClick={toggleEditMode}
          className="shrink-0 border-b border-transparent"
        />

        {/* 2. 카테고리 탭 (고정) */}
        <div className="flex px-6 mb-2 shrink-0 bg-white z-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mr-4 pb-2 text-[16px] transition-colors ${
                activeTab === tab.id 
                  ? "font-bold text-gray-900" 
                  : "font-medium text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3. 리스트 영역 (여기만 스크롤) */}
        <main className="flex-1 px-6 pb-10 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="py-20 text-center text-sm text-gray-400">로딩 중...</div>
          ) : currentBooks.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-400">책이 없습니다.</div>
          ) : (
            <div className="flex flex-col gap-6 pt-2">
              {currentBooks.map((book) => (
                <div 
                  key={book.id} 
                  className="flex items-center justify-between group cursor-pointer active:opacity-95"
                  onClick={() => !isEditMode && router.push(`/books/${book.id}`)}
                >
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-[60px] h-[86px] bg-gray-100 rounded overflow-hidden shrink-0 border border-gray-100 relative">
                      {book.thumbnail ? (
                        <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No Img</div>
                      )}
                    </div>
                    <div className="flex flex-col py-1 min-w-0 justify-start">
                      <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1">{book.title}</h3>
                      <p className="text-[13px] text-gray-500 truncate">{book.authors?.join(", ")}</p>
                    </div>
                  </div>
                  {isEditMode && (
                    <button
                      onClick={(e) => handleDeleteRequest(e, book.id)}
                      className="p-2 ml-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <ConfirmModal 
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="이 책을 삭제하시겠습니까?"
        message={`책의 독서 기록과 메모가 함께 삭제됩니다.`}
        confirmText="삭제"
        cancelText="취소"
        isDanger={true}
      />
    </>
  );
}