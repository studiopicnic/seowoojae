"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronLeft, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Book } from "@/types/book";

// 공통 컴포넌트
import BottomSheet from "@/components/common/BottomSheet";
import CommonHeader from "@/components/common/CommonHeader";

interface BookSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveComplete: () => void;
  initialBook?: Book | null; // 상세 페이지에서 진입 시 책 정보
  
  // [추가] 수정 모드 관련 Props
  isEditMode?: boolean;      // 수정 모드 여부
  noteId?: string;           // 수정할 노트 ID
  initialContent?: string;   // 기존 내용
}

export default function BookSelectModal({ 
  isOpen, 
  onClose, 
  onSaveComplete,
  initialBook = null,
  isEditMode = false,    // 기본값 false (작성 모드)
  noteId,
  initialContent = ""
}: BookSelectModalProps) {
  const supabase = createClient();
  
  // 단계: selection(책선택) -> writing(글쓰기)
  const [step, setStep] = useState<"selection" | "writing">("selection");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // 글쓰기 내용
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // [핵심] 모달이 열릴 때 초기화 로직
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // 1. 수정 모드일 때: 바로 글쓰기 단계로 이동 + 내용 채우기
        setStep("writing");
        setContent(initialContent);
        // 수정 모드에서는 책 정보가 partial(제목만) 일 수 있으므로 그대로 세팅
        if (initialBook) setSelectedBook(initialBook);
      } else {
        // 2. 작성 모드일 때
        setContent("");
        if (initialBook) {
          // 책 상세에서 들어왔으면 책은 선택된 상태로
          setSelectedBook(initialBook);
          setStep("writing");
        } else {
          // 기록 탭에서 들어왔으면 책 선택부터
          setStep("selection");
          setSelectedBook(null);
          setSearchQuery("");
          setSearchResults([]);
        }
      }
    }
  }, [isOpen, initialBook, isEditMode, initialContent]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`/api/books?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.documents || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setStep("writing");
  };

// [핵심] 저장 및 수정 로직 분기
const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date().toISOString(); // [추가] 현재 시간

      if (isEditMode && noteId) {
        // --- [A] 수정 로직 (UPDATE) ---
        // [복구] updated_at을 현재 시간으로 갱신 -> 리스트 최상단으로 이동됨
        const { error } = await supabase
          .from("memos")
          .update({ 
            content: content,
            updated_at: now // 수정된 시간 기록
          }) 
          .eq("id", noteId);
        
        if (error) throw error;

      } else {
        // --- [B] 신규 저장 로직 (INSERT) ---
        if (!selectedBook) return;
        
        let targetBookId = selectedBook.id;

        // (책 등록 로직... 생략... 기존과 동일)
        if (!targetBookId) {
           const { data: insertedBook, error: bookError } = await supabase
             .from("books")
             .upsert({
               title: selectedBook.title,
               authors: selectedBook.authors,
               thumbnail: selectedBook.thumbnail,
               isbn: selectedBook.isbn,
               user_id: user.id,
               status: 'reading'
             }, { onConflict: 'isbn, user_id' })
             .select()
             .single();
            
            if (bookError || !insertedBook) throw bookError;
            targetBookId = insertedBook.id;
        }

        // [수정] 신규 생성 시에도 updated_at을 기록
        const { error } = await supabase
          .from("memos")
          .insert({
            user_id: user.id,
            book_id: targetBookId,
            content: content,
            updated_at: now // 생성 시간 = 수정 시간 초기화
          });

        if (error) throw error;
      }

      onSaveComplete();
      onClose();
      setContent("");
      
    } catch (error: any) {
      console.error("저장 실패 상세:", error.message || error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="h-[90dvh]">
      {/* 헤더 처리 
         - 수정 모드: "노트 수정" (와이어프레임 7-9)
         - 작성 모드(책선택): "책 선택"
         - 작성 모드(글쓰기): "기록하기"
      */}
      <CommonHeader
        title={isEditMode ? "노트 수정" : (step === "selection" ? "책 선택" : "기록하기")}
        leftIcon={step === "writing" && !isEditMode && !initialBook ? <ChevronLeft className="w-6 h-6" /> : null}
        onLeftClick={() => setStep("selection")}
        rightIcon={
            step === "writing" 
            ? <Check className={`w-6 h-6 ${isSaving ? 'text-gray-300' : 'text-black'}`} /> 
            : <X className="w-6 h-6" />
        }
        onRightClick={step === "writing" ? handleSave : onClose}
      />

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* 1. 책 선택 화면 (수정 모드에선 안 보임) */}
        {!isEditMode && step === "selection" && (
          <div className="flex flex-col gap-4 mt-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="search"
                placeholder="책 제목을 검색하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 pl-12 pr-4 bg-gray-50 rounded-xl outline-none"
                autoFocus
              />
            </form>
            <div className="flex flex-col gap-2">
              {searchResults.map((book, idx) => (
                <div key={idx} onClick={() => handleBookSelect(book)} className="flex gap-4 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                   <div className="w-[50px] h-[72px] bg-gray-200 rounded shrink-0 overflow-hidden">
                      {book.thumbnail && <img src={book.thumbnail} className="w-full h-full object-cover" />}
                   </div>
                   <div>
                     <h4 className="font-bold text-sm">{book.title}</h4>
                     <p className="text-xs text-gray-500 mt-1">{book.authors.join(", ")}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. 글쓰기 화면 (작성/수정 공통) */}
        {step === "writing" && (
          <div className="flex flex-col h-full pt-2">
            {/* 책 제목 표시 (와이어프레임 7-9: 상단 작게 표시) */}
            <div className="text-center mb-6">
               <span className="text-[14px] text-gray-400">
                 {selectedBook?.title}
               </span>
            </div>

            {/* 텍스트 에디터 */}
            <textarea
              className="flex-1 w-full text-[16px] leading-relaxed text-gray-900 resize-none outline-none placeholder:text-gray-300"
              placeholder="자유롭게 남겨보세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
          </div>
        )}
      </div>
    </BottomSheet>
  );
}