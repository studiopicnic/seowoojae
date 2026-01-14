"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronLeft, Plus, Check, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Book } from "@/types/book";

import BottomSheet from "@/components/common/BottomSheet";
import SafeScrollArea from "@/components/common/SafeScrollArea";
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

  // [추가] 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [isEnd, setIsEnd] = useState(false); // 더 이상 불러올 데이터가 없는지 체크

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

  // 모달 닫힘 감지 및 초기화
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setModalStep("selection");
        setSearchQuery("");
        setSearchResults([]);
        setHasSearched(false);
        setIsSearching(false);
        setPage(1); // 페이지 초기화
        setIsEnd(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

  // [수정] 검색 함수 (페이지 파라미터 추가)
  const handleSearch = async (query: string, newPage: number = 1) => {
    if (!query.trim()) return;
    
    // 첫 검색이면 로딩 표시, 더보기면 로딩 표시 안 함(버튼 내에서 처리하거나 조용히 로드)
    if (newPage === 1) {
      setIsSearching(true);
      setSearchResults([]);
      setHasSearched(true);
      setIsEnd(false);
    }

    try {
      // API 호출 시 page와 size=20 전달
      const response = await fetch(`/api/books?query=${encodeURIComponent(query)}&page=${newPage}&size=20`);
      const data = await response.json();
      const newBooks = data.documents || [];

      if (newPage === 1) {
        setSearchResults(newBooks);
        saveSearchTerm(query);
      } else {
        setSearchResults((prev) => [...prev, ...newBooks]);
      }

      // 20개 미만으로 왔다면 마지막 페이지로 간주
      if (newBooks.length < 20) {
        setIsEnd(true);
      }

      setPage(newPage);

    } catch (error) {
      console.error("검색 실패", error);
    } finally {
      setIsSearching(false);
    }
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery, 1); // 새로운 검색은 항상 1페이지부터
  };

  // [추가] 더보기 버튼 핸들러
  const handleLoadMore = () => {
    handleSearch(searchQuery, page + 1);
  };

  const handleSelectStatus = (label: string) => {
    setSelectedStatusLabel(label);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setModalStep("search");
    setPage(1);
    setIsEnd(false);
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
          modalStep === 'search' ? 'h-[85dvh]' : 'h-auto' // 검색 모드일 때 높이를 좀 더 확보 (더보기 버튼 고려)
        }`}
      >
        {/* 헤더 */}
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

        <SafeScrollArea className="px-6 pb-8">
          
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
                    onChange={(e) => { 
                      setSearchQuery(e.target.value); 
                      // 검색어 변경 시 초기화
                      if (!e.target.value) {
                         setHasSearched(false);
                         setSearchResults([]);
                      }
                    }}
                    className="w-full py-4 pl-12 pr-12 text-[15px] bg-gray-50 text-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-gray-900/10"
                    autoFocus
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => { setSearchQuery(""); setSearchResults([]); setHasSearched(false); setPage(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400">
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
                    <div key={term} onClick={() => { setSearchQuery(term); handleSearch(term, 1); }} className="flex justify-between py-3 cursor-pointer border-b border-gray-50 last:border-0">
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
                    <div key={`${book.isbn}-${idx}`} onClick={() => setSelectedBook(book)} className="flex gap-4 p-2 hover:bg-gray-50 rounded-lg cursor-pointer items-center">
                      <div className="w-[60px] h-[86px] bg-gray-200 rounded overflow-hidden shrink-0 border border-gray-100 relative">
                        {book.thumbnail ? (
                          <img src={book.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[15px] font-bold truncate">{book.title}</h4>
                        <p className="text-[13px] text-gray-500 mt-1 truncate">{book.authors.join(", ")}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleAddClick(book); }} className={`w-9 h-9 rounded-full flex items-center justify-center ${isAdded ? "bg-white border shadow-sm" : "bg-gray-100"}`}>
                        {isAdded ? <Check className="w-5 h-5 text-green-500"/> : <Plus className="w-5 h-5 text-gray-400"/>}
                      </button>
                    </div>
                  );
                })}

                {/* 로딩 표시 */}
                {isSearching && page === 1 && (
                  <div className="text-center py-10 text-gray-400 text-sm flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    검색중...
                  </div>
                )}
                
                {/* 검색 결과 없음 */}
                {!isSearching && hasSearched && !searchResults.length && (
                  <div className="text-center py-10 text-gray-400 text-sm">검색 결과가 없습니다.</div>
                )}

                {/* [추가] 더보기 버튼 */}
                {!isSearching && hasSearched && searchResults.length > 0 && !isEnd && (
                  <button 
                    onClick={handleLoadMore}
                    className="w-full py-4 mt-4 text-[14px] font-medium text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    {/* 로딩 중일 땐 스피너 표시 */}
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    결과 더보기
                  </button>
                )}
              </div>
            </div>
          )}

        </SafeScrollArea>
      </BottomSheet>

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