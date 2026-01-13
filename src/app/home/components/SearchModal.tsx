"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronLeft, Plus, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Book } from "@/types/book";

// [공통 컴포넌트]
import BottomSheet from "@/components/common/BottomSheet";
import BookDetailModal from "./BookDetailModal";

type BookStatus = "reading" | "wish" | "finished";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: Book, status: BookStatus) => void;
  addedBooks: Set<string>;
}

const STATUS_MAP: Record<string, BookStatus> = {
  "읽고 있는 책": "reading",
  "읽고 싶은 책": "wish",
  "읽은 책": "finished",
};

export default function SearchModal({ isOpen, onClose, onAddBook, addedBooks }: SearchModalProps) {
  const supabase = createClient();
  
  // UI 상태
  const [modalStep, setModalStep] = useState<"selection" | "search">("selection");
  const [selectedStatusLabel, setSelectedStatusLabel] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 데이터 로딩 (최근 검색어)
  const fetchRecentSearches = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("recent_searches")
      .select("term")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setRecentSearches(data.map((item) => item.term));
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
      await supabase.from("recent_searches").delete().match({ user_id: user.id, term: term });
    }
  };

  const clearAllSearches = async () => {
    setRecentSearches([]);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("recent_searches").delete().eq("user_id", user.id);
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
    if (statusKey) onAddBook(book, statusKey);
  };

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        className={`transition-[height] duration-300 ${
          modalStep === 'search' ? 'h-[70dvh]' : 'h-auto'
        }`}
      >
        {/* [수정] 헤더 패딩 조정: mb-4 -> py-4 (BookSelectModal과 간격 통일) */}
        <div className="relative flex items-center justify-center py-4 px-6 shrink-0">
          {modalStep === "search" && (
            <button 
              onClick={() => setModalStep("selection")} 
              className="absolute left-6 p-1 -ml-1 text-gray-500 hover:text-gray-900"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h3 className="text-lg font-bold text-gray-900">추가하기</h3>
        </div>

        {/* 컨텐츠 영역 */}
        <div 
          className="px-6 pb-8 overflow-y-auto flex-1 min-h-0 scrollbar-hide"
          style={{ 
            touchAction: 'pan-y', 
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* 1. 상태 선택 화면 */}
          {modalStep === "selection" && (
            <div className="space-y-3 pb-8">
              {Object.keys(STATUS_MAP).map((label) => (
                <button 
                  key={label} 
                  onClick={() => handleSelectStatus(label)} 
                  className="w-full py-4 text-[15px] font-medium text-gray-900 border border-gray-200 rounded-xl active:bg-gray-50 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* 2. 검색 화면 */}
          {modalStep === "search" && (
            <div className="flex flex-col">
              {/* 검색바 (Sticky) */}
              <div className="sticky top-0 z-20 bg-white pb-2 pt-2">
                <form onSubmit={onSearchSubmit} className="relative">
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
              </div>

              {/* 최근 검색어 */}
              {!isSearching && !hasSearched && !searchResults.length && recentSearches.length > 0 && (
                <div className="mt-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-[13px] font-medium text-gray-500">최근 검색어</span>
                    <button onClick={clearAllSearches} className="text-[12px] text-gray-400">모두 삭제</button>
                  </div>
                  {recentSearches.map(term => (
                    <div key={term} onClick={() => { setSearchQuery(term); handleSearch(term); }} className="flex justify-between py-3 cursor-pointer border-b border-gray-50 last:border-0">
                      <span className="text-[15px] text-gray-900">{term}</span>
                      <button onClick={(e) => { e.stopPropagation(); removeSearchTerm(term); }} className="p-2 text-gray-300"><X className="w-4 h-4"/></button>
                    </div>
                  ))}
                </div>
              )}

              {/* 검색 결과 */}
              <div className="space-y-4 pb-4 mt-2">
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
      </BottomSheet>

      {/* 책 상세 팝업 (이중 모달) */}
      {selectedBook && (
        <BookDetailModal 
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onAdd={(book) => { handleAddClick(book); setSelectedBook(null); }}
          isAdded={addedBooks.has(selectedBook.title + selectedBook.authors.join(""))}
        />
      )}
    </>
  );
}