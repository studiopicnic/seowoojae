"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Search, X, ChevronLeft, Plus, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Book } from "@/types/book";
import BookDetailModal from "./BookDetailModal";

type BookStatus = "reading" | "wish" | "finished";

interface SearchModalProps {
  onClose: () => void;
  onAddBook: (book: Book, status: BookStatus) => void;
  addedBooks: Set<string>;
}

const STATUS_MAP: Record<string, BookStatus> = {
  "읽고 있는 책": "reading",
  "읽고 싶은 책": "wish",
  "읽은 책": "finished",
};

export default function SearchModal({ onClose, onAddBook, addedBooks }: SearchModalProps) {
  const supabase = createClient();
  
  const [modalStep, setModalStep] = useState<"selection" | "search">("selection");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedStatusLabel, setSelectedStatusLabel] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const dragControls = useDragControls();

  // [정석 해결법] Body Freeze 기법 적용
  // 모달이 열리면 배경을 fixed로 고정해버려서 키보드 밀림과 스크롤 간섭을 물리적으로 차단함
  useEffect(() => {
    // 1. 현재 스크롤 위치 저장
    const scrollY = window.scrollY;
    
    // 2. 바디를 그 자리에 '얼음' (width: 100%는 레이아웃 깨짐 방지)
    document.body.style.cssText = `
      position: fixed; 
      top: -${scrollY}px;
      overflow-y: scroll;
      width: 100%;`;
    
    return () => {
      // 3. 모달 닫히면 '땡' (원래 위치로 복구)
      const scrollY = document.body.style.top;
      document.body.style.cssText = '';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    };
  }, []);

  const fetchRecentSearches = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("recent_searches")
      .select("term")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setRecentSearches(data.map((item) => item.term));
    }
  }, [supabase]);

  useEffect(() => {
    fetchRecentSearches();
  }, [fetchRecentSearches]);

  const saveSearchTerm = async (term: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("recent_searches").upsert(
      { user_id: user.id, term: term, created_at: new Date().toISOString() },
      { onConflict: "user_id, term" }
    );
    fetchRecentSearches();
  };

  const removeSearchTerm = async (term: string) => {
    setRecentSearches((prev) => prev.filter((t) => t !== term));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("recent_searches")
        .delete()
        .match({ user_id: user.id, term: term });
    }
  };

  const clearAllSearches = async () => {
    setRecentSearches([]);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("recent_searches")
        .delete()
        .eq("user_id", user.id);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/books?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.documents || []);
      saveSearchTerm(query);
    } catch (error) {
      console.error("검색 실패", error);
    } finally {
      setIsSearching(false);
    }
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleSelectStatus = (label: string) => {
    setSelectedStatusLabel(label);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setModalStep("search");
  };

  const handleAddClick = (book: Book) => {
    const statusKey = STATUS_MAP[selectedStatusLabel];
    if (statusKey) {
      onAddBook(book, statusKey);
    }
  };

  return (
    <>
      {/* [수정 포인트]
        - touchAction: 'none' -> 배경 터치 시 브라우저 스크롤 방지
        - height: '100dvh' -> 모바일 주소창 크기 변화 대응
      */}
      <div 
        className="fixed inset-0 z-50 flex justify-center items-end"
        style={{ height: '100dvh', touchAction: 'none' }}
      >
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          onTouchMove={(e) => e.preventDefault()} // 배경 터치 무시
          className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        />

        <motion.div
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          drag="y" dragControls={dragControls} dragListener={false} dragConstraints={{ top: 0 }} dragElastic={0.2}
          onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 500) onClose(); }}
          className="relative w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col z-10"
          // maxHeight를 92dvh로 유지하여 상단 여백 확보
          style={{ maxHeight: "92dvh" }}
        >
          <div className="pt-4 px-6 pb-2 shrink-0 cursor-grab active:cursor-grabbing touch-none" onPointerDown={(e) => dragControls.start(e)}>
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <div className="relative flex items-center justify-center mb-4">
              {modalStep === "search" && (
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setModalStep("selection")} className="absolute left-0 p-1 -ml-1 text-gray-500 hover:text-gray-900">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <h3 className="text-lg font-bold text-gray-900">추가하기</h3>
            </div>
          </div>

          {/* 내부 스크롤 영역:
             touch-action: pan-y (상하 스크롤만 허용)
             overscroll-behavior: contain (스크롤 끝 도달 시 부모로 전파 금지 -> 중요!)
          */}
          <div 
            className={`px-6 pb-8 overflow-y-auto transition-[height] duration-300 ${modalStep === 'search' ? 'h-[500px]' : 'h-auto'}`}
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
          >
            {modalStep === "selection" && (
              <div className="space-y-3 pb-8">
                {Object.keys(STATUS_MAP).map((label) => (
                  <button key={label} onClick={() => handleSelectStatus(label)} className="w-full py-4 text-[15px] font-medium text-gray-900 border border-gray-200 rounded-xl active:bg-gray-50 transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            )}

            {modalStep === "search" && (
              <div className="flex flex-col h-full">
                <form onSubmit={onSearchSubmit} className="relative mb-6 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input 
                    type="search"
                    placeholder="책 제목이나 저자를 입력하세요"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setHasSearched(false); }}
                    className="w-full py-4 pl-12 pr-12 text-[15px] bg-gray-50 text-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-gray-900/10"
                    autoFocus
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => { setSearchQuery(""); setSearchResults([]); setHasSearched(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </form>

                {!isSearching && !hasSearched && !searchResults.length && recentSearches.length > 0 && (
                  <div className="flex-1">
                    <div className="flex justify-between mb-4">
                      <span className="text-[13px] font-medium text-gray-500">최근 검색어</span>
                      <button onClick={clearAllSearches} className="text-[12px] text-gray-400">모두 삭제</button>
                    </div>
                    {recentSearches.map(term => (
                      <div key={term} onClick={() => { setSearchQuery(term); handleSearch(term); }} className="flex justify-between py-3 cursor-pointer">
                        <span className="text-[15px] text-gray-900">{term}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeSearchTerm(term); }} className="p-2 text-gray-300"><X className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto min-h-0 touch-pan-y space-y-4 pb-4">
                  {searchResults.map((book, idx) => {
                    const isAdded = addedBooks.has(book.title + book.authors.join(""));
                    return (
                      <div key={idx} onClick={() => setSelectedBook(book)} className="flex gap-4 p-2 hover:bg-gray-50 rounded-lg cursor-pointer items-center">
                        <div className="w-[60px] h-[86px] bg-gray-200 rounded overflow-hidden shrink-0">
                          {book.thumbnail && <img src={book.thumbnail} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[15px] font-bold truncate">{book.title}</h4>
                          <p className="text-[13px] text-gray-500 mt-1 truncate">{book.authors.join(", ")}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleAddClick(book); }} className={`w-9 h-9 rounded-full flex items-center justify-center ${isAdded ? "bg-white border shadow-sm" : "bg-gray-100"}`}>
                          {isAdded ? <Check className="w-5 h-5"/> : <Plus className="w-5 h-5 text-gray-400"/>}
                        </button>
                      </div>
                    );
                  })}
                  {isSearching && <div className="text-center py-10 text-gray-400 text-sm">검색중...</div>}
                  {!isSearching && hasSearched && !searchResults.length && <div className="text-center py-10 text-gray-400 text-sm">검색 결과가 없습니다.</div>}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal 
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onAdd={(book) => { handleAddClick(book); setSelectedBook(null); }}
            isAdded={addedBooks.has(selectedBook.title + selectedBook.authors.join(""))}
          />
        )}
      </AnimatePresence>
    </>
  );
}