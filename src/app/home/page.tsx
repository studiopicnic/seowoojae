"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LogOut, Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import BottomNav from "@/components/common/BottomNav";
import Toast from "@/components/common/Toast";
import AlertModal from "@/components/common/AlertModal";
import SearchModal from "./components/SearchModal";
import { Book } from "@/types/book";

type BookStatus = "reading" | "wish" | "finished";

const STATUS_LABELS: Record<BookStatus, string> = {
  reading: "읽고 있는 책",
  wish: "읽고 싶은 책",
  finished: "읽은 책",
};

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [activeTab, setActiveTab] = useState<BookStatus>("reading");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myBooks, setMyBooks] = useState<Record<BookStatus, Book[]>>({
    reading: [],
    wish: [],
    finished: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const addedBookKeys = new Set([
    ...myBooks.reading.map((b) => b.title + b.authors.join("")),
    ...myBooks.wish.map((b) => b.title + b.authors.join("")),
    ...myBooks.finished.map((b) => b.title + b.authors.join("")),
  ]);

  const fetchBooks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const newBooks: Record<BookStatus, Book[]> = {
        reading: [],
        wish: [],
        finished: [],
      };

      data?.forEach((item: any) => {
        if (item.status in newBooks) {
          newBooks[item.status as BookStatus].push({
            title: item.title,
            authors: item.authors,
            translators: item.translators,
            thumbnail: item.thumbnail,
            publisher: item.publisher,
            contents: item.contents,
            isbn: item.isbn,
          });
        }
      });

      setMyBooks(newBooks);
    } catch (error) {
      console.error("책 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleAddBook = async (book: Book, status: BookStatus) => {
    const bookKey = book.title + book.authors.join("");

    if (addedBookKeys.has(bookKey)) {
      setShowAlert(true);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { error } = await supabase.from("books").insert({
        user_id: user.id,
        title: book.title,
        authors: book.authors,
        translators: book.translators,
        thumbnail: book.thumbnail,
        publisher: book.publisher,
        contents: book.contents,
        isbn: book.isbn,
        status: status,
      });

      if (error) throw error;

      setMyBooks((prev) => ({
        ...prev,
        [status]: [book, ...prev[status]], 
      }));
      
      setToastMessage(`${STATUS_LABELS[status]}에 추가되었습니다`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

    } catch (error) {
      console.error("책 저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const currentBooks = myBooks[activeTab];

  return (
    // [수정 1] 화면 전체 스크롤 막음 (overflow-hidden) -> 헤더 고정의 핵심
    <div className="h-dvh flex flex-col bg-white overflow-hidden relative">
      <Toast isVisible={showToast} message={toastMessage} />
      <AlertModal isOpen={showAlert} onClose={() => setShowAlert(false)} message="이미 등록된 책입니다" />

      <button onClick={handleLogout} className="fixed top-4 right-4 z-40 px-3 py-1.5 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm hover:bg-black transition-colors flex items-center gap-1 cursor-pointer">
        <LogOut className="w-3 h-3" /> 로그아웃
      </button>

      {/* 헤더: sticky가 아니라 그냥 block 요소로 둠 (부모가 스크롤 안 되니까 자동 고정됨) */}
      <header className="flex flex-col items-center w-full pt-8 pb-4 bg-white z-10 shrink-0">
        <div className="flex gap-6 mb-2">
          {(["reading", "wish", "finished"] as BookStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-lg font-bold transition-colors cursor-pointer hover:opacity-70 ${
                activeTab === tab ? "text-gray-900" : "text-gray-300"
              }`}
            >
              {STATUS_LABELS[tab]}
            </button>
          ))}
        </div>
        <span className="text-[13px] text-gray-400 font-medium">
          총 {currentBooks.length}권
        </span>
      </header>

      {/* [수정 2] 메인 컨텐츠만 스크롤 가능하게 변경 (overflow-y-auto) */}
      <main 
        className={`flex-1 w-full px-6 pb-24 overflow-y-auto scrollbar-hide ${
          isLoading || currentBooks.length === 0 ? "flex flex-col items-center justify-center" : "pt-4"
        }`}
      >
        {isLoading ? (
          <div className="text-gray-400 text-sm">내 서재를 불러오는 중...</div>
        ) : currentBooks.length === 0 ? (
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">첫 책을 기록해볼까요?</h2>
            <p className="text-sm text-gray-500 leading-relaxed">작은 기록이 쌓여 나만의 독서 여정이 됩니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 pb-10">
            {currentBooks.map((book, index) => (
              <div key={index} className="flex flex-col">
                <div className="w-full aspect-[2/3] bg-gray-100 rounded-md mb-3 shadow-sm overflow-hidden border border-gray-100 relative">
                  {book.thumbnail ? (
                    <img 
                      src={book.thumbnail} 
                      alt={book.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs bg-gray-50">
                      No Image
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-[12px] text-gray-500 line-clamp-1">
                    {book.authors.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-[88px] left-0 w-full flex justify-center pointer-events-none z-20">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="pointer-events-auto w-14 h-10 bg-black text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer hover:bg-gray-800"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <BottomNav />

      <AnimatePresence>
        {isModalOpen && (
          <SearchModal 
            onClose={() => setIsModalOpen(false)}
            onAddBook={handleAddBook}
            addedBooks={addedBookKeys} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}