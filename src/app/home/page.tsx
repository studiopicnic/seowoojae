"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Plus } from "lucide-react"; // LogOut 제거됨
import { AnimatePresence, motion, PanInfo } from "framer-motion";

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

const TAB_ORDER: BookStatus[] = ["reading", "wish", "finished"];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const initialTab = (searchParams.get("tab") as BookStatus) || "reading";
  const [activeTab, setActiveTab] = useState<BookStatus>(initialTab);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [myBooks, setMyBooks] = useState<Record<BookStatus, Book[]>>({
    reading: [],
    wish: [],
    finished: [],
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  
  const [slideDirection, setSlideDirection] = useState(0);

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
          newBooks[item.status as BookStatus].push(item);
        }
      });

      newBooks.finished.sort((a, b) => {
        const dateA = new Date(a.end_date || a.created_at || 0).getTime();
        const dateB = new Date(b.end_date || b.created_at || 0).getTime();
        return dateB - dateA;
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

  useEffect(() => {
    const tabFromUrl = (searchParams.get("tab") as BookStatus) || "reading";
    if (TAB_ORDER.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const toastType = searchParams.get("toast");
    
    if (toastType === "deleted") {
      setToastMessage("책이 삭제되었습니다");
      setShowToast(true);

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("toast");
      window.history.replaceState({}, "", newUrl.toString());

      setTimeout(() => setShowToast(false), 2000);
    }
  }, [searchParams]);

  // [삭제됨] handleLogout 함수 제거

  const handleTabChange = (newTab: BookStatus) => {
    if (newTab === activeTab) return;
    
    const oldIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(newTab);
    setSlideDirection(newIndex > oldIndex ? 1 : -1);

    setActiveTab(newTab);
    router.replace(`/home?tab=${newTab}`);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const currentIndex = TAB_ORDER.indexOf(activeTab);

    if (info.offset.x < -threshold) {
      if (currentIndex < TAB_ORDER.length - 1) {
        handleTabChange(TAB_ORDER[currentIndex + 1]);
      }
    } else if (info.offset.x > threshold) {
      if (currentIndex > 0) {
        handleTabChange(TAB_ORDER[currentIndex - 1]);
      }
    }
  };

  const handleBookClick = (bookId?: string) => {
    if (bookId) router.push(`/books/${bookId}`);
  };
  
  const handleAddBook = async (book: Book, status: BookStatus) => {
    const bookKey = book.title + book.authors.join("");
    if (addedBookKeys.has(bookKey)) {
      setShowAlert(true);
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      let fetchedTotalPage = 0;
      let fetchedCover = null;

      if (book.isbn) {
        try {
          const res = await fetch(`/api/aladin?isbn=${book.isbn}`);
          const data = await res.json();
          if (data.page) fetchedTotalPage = data.page;
          if (data.cover) fetchedCover = data.cover;
        } catch (err) { console.error(err); }
      }

      const finalCover = fetchedCover || book.thumbnail;
      const { error } = await supabase.from("books").insert({
        user_id: user.id,
        title: book.title,
        authors: book.authors,
        translators: book.translators,
        thumbnail: finalCover,
        publisher: book.publisher,
        contents: book.contents,
        isbn: book.isbn,
        status: status,
        total_page: fetchedTotalPage,
      });

      if (error) throw error;
      fetchBooks(); 
      setToastMessage(`${STATUS_LABELS[status]}에 추가되었습니다`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error(error);
      alert("오류 발생");
    }
  };

  const currentBooks = myBooks[activeTab];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white overflow-hidden max-w-[430px] mx-auto shadow-2xl">
      <Toast isVisible={showToast} message={toastMessage} />
      <AlertModal isOpen={showAlert} onClose={() => setShowAlert(false)} message="이미 등록된 책입니다" />

      {/* [삭제됨] 로그아웃 버튼 제거 */}

      <header className="flex flex-col items-center w-full pt-8 pb-4 bg-white z-10 shrink-0 select-none">
        <div className="flex gap-6 mb-2 relative">
          {TAB_ORDER.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`text-lg font-bold transition-colors cursor-pointer hover:opacity-70 relative z-10 ${
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

      <div className="flex-1 w-full relative overflow-hidden bg-white">
        <AnimatePresence initial={false} custom={slideDirection}>
          <motion.main
            key={activeTab}
            custom={slideDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            
            className={`absolute inset-0 w-full h-full px-6 pb-24 overflow-y-auto overscroll-y-auto scrollbar-hide ${
              isLoading || currentBooks.length === 0 ? "flex flex-col items-center justify-center" : "pt-4"
            }`}
          >
            {isLoading ? (
              <div className="text-gray-400 text-sm">내 서재를 불러오는 중...</div>
            ) : currentBooks.length === 0 ? (
              <div className="text-center">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === "finished" ? "다 읽은 책이 없어요" : "첫 책을 기록해볼까요?"}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {activeTab === "finished" ? "독서를 완료하고 기록을 남겨보세요." : "작은 기록이 쌓여 나만의 독서 여정이 됩니다."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 pb-10">
                {currentBooks.map((book, index) => (
                  <div 
                    key={`${book.id}-${index}`} 
                    className="flex flex-col transition-opacity cursor-pointer active:opacity-80"
                    onClick={() => handleBookClick(book.id)}
                  >
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
                      
                      {activeTab === "finished" && book.rating !== null && book.rating !== undefined && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                            ★ {book.rating}
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
          </motion.main>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-[100px] left-0 w-full flex justify-center pointer-events-none z-20">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="pointer-events-auto w-14 h-10 bg-black text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer hover:bg-gray-800"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <BottomNav />

      <SearchModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddBook={handleAddBook}
        addedBooks={addedBookKeys} 
        />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HomeContent />
    </Suspense>
  );
}