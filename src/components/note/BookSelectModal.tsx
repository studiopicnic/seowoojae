"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Book } from "@/types/book";

// 공통 컴포넌트
import BottomSheet from "@/components/common/BottomSheet";
import CommonHeader from "@/components/common/CommonHeader";

interface BookSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveComplete: () => void;
  initialBook?: Book | null;
  
  // 수정 모드 관련 Props
  isEditMode?: boolean;
  noteId?: string;
  initialContent?: string;
}

export default function BookSelectModal({ 
  isOpen, 
  onClose, 
  onSaveComplete,
  initialBook = null,
  isEditMode = false,
  noteId,
  initialContent = ""
}: BookSelectModalProps) {
  const supabase = createClient();
  
  const [step, setStep] = useState<"selection" | "writing">("selection");
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<"reading" | "finished">("reading");

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canSave = content.trim().length > 0 && !isSaving;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setStep("writing");
        setContent(initialContent);
        if (initialBook) setSelectedBook(initialBook);
      } else {
        setContent("");
        if (initialBook) {
          setSelectedBook(initialBook);
          setStep("writing");
        } else {
          setStep("selection");
          setSelectedBook(null);
          fetchMyBooks();
        }
      }
    }
  }, [isOpen, initialBook, isEditMode, initialContent]);

  const fetchMyBooks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .in("status", ["reading", "finished"])
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMyBooks(data);
    }
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setStep("writing");
  };

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const now = new Date().toISOString();

      if (isEditMode && noteId) {
        const { error } = await supabase
          .from("memos")
          .update({ content: content, updated_at: now }) 
          .eq("id", noteId);
        if (error) throw error;
      } else {
        if (!selectedBook) return;
        const { error } = await supabase
          .from("memos")
          .insert({
            user_id: user.id,
            book_id: selectedBook.id,
            content: content,
            updated_at: now
          });
        if (error) throw error;
      }

      onSaveComplete();
      onClose();
      setContent("");
    } catch (error: any) {
      console.error("저장 실패:", error.message || error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBooks = myBooks.filter(book => 
    activeTab === "reading" ? book.status === "reading" : book.status === "finished"
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="h-[90dvh]">
      <CommonHeader
        title={isEditMode ? "노트 수정" : (step === "selection" ? "책 선택하기" : "기록하기")}
        leftIcon={step === "writing" && !isEditMode && !initialBook ? <ChevronLeft className="w-6 h-6" /> : null}
        onLeftClick={() => setStep("selection")}
        rightIcon={
            step === "writing" 
            ? <Check className={`w-6 h-6 transition-colors ${canSave ? 'text-black' : 'text-gray-300'}`} /> 
            : <X className="w-6 h-6" />
        }
        onRightClick={step === "writing" ? (canSave ? handleSave : undefined) : onClose}
      />

      {/* [핵심 수정] 내부 콘텐츠 영역에 스크롤 및 터치 동작 허용 */}
      <div 
        className="flex-1 overflow-y-auto px-6 pb-8"
        style={{ 
          // 1. 부모(BottomSheet)에서 막아둔 터치 액션을 여기서 다시 허용합니다. (pan-y: 위아래 스크롤 허용)
          touchAction: 'pan-y', 
          // 2. 스크롤이 끝에 닿았을 때 부모(화면 전체)로 체이닝되는 것을 막습니다. (고무줄 효과 방지)
          overscrollBehavior: 'contain',
          // 3. iOS 부드러운 스크롤 적용
          WebkitOverflowScrolling: 'touch'
        }}
        // 추가: 확실한 이벤트 전파 방지
        onTouchMove={(e) => e.stopPropagation()}
      >
        {!isEditMode && step === "selection" && (
          <div className="flex flex-col h-full">
            <div className="flex border-b border-gray-100 mb-4">
              <button
                onClick={() => setActiveTab("reading")}
                className={`flex-1 py-3 text-[14px] font-medium transition-colors relative ${
                  activeTab === "reading" ? "text-gray-900 font-bold" : "text-gray-400"
                }`}
              >
                읽고 있는 책
                {activeTab === "reading" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
              </button>
              <button
                onClick={() => setActiveTab("finished")}
                className={`flex-1 py-3 text-[14px] font-medium transition-colors relative ${
                  activeTab === "finished" ? "text-gray-900 font-bold" : "text-gray-400"
                }`}
              >
                읽은 책
                {activeTab === "finished" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {filteredBooks.length === 0 ? (
                <div className="py-20 text-center text-gray-400 text-sm">
                  {activeTab === "reading" ? "읽고 있는 책이 없습니다." : "다 읽은 책이 없습니다."}
                </div>
              ) : (
                filteredBooks.map((book) => (
                  <div 
                    key={book.id} 
                    onClick={() => handleBookSelect(book)} 
                    className="flex gap-4 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                     <div className="w-[50px] h-[72px] bg-gray-200 rounded shrink-0 overflow-hidden border border-gray-100">
                        {book.thumbnail ? (
                          <img src={book.thumbnail} className="w-full h-full object-cover" alt={book.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                        )}
                     </div>
                     <div className="flex flex-col justify-center">
                       <h4 className="font-bold text-[15px] text-gray-900 leading-snug line-clamp-1">{book.title}</h4>
                       <p className="text-[13px] text-gray-500 mt-1 line-clamp-1">{book.authors.join(", ")}</p>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {step === "writing" && (
          <div className="flex flex-col h-full pt-2">
            <div className="text-center mb-6">
               <span className="text-[14px] text-gray-400">
                 {selectedBook?.title}
               </span>
            </div>

            <textarea
              className="flex-1 w-full text-[16px] leading-relaxed text-gray-900 resize-none outline-none placeholder:text-gray-300"
              placeholder="자유롭게 남겨보세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
              // 텍스트 영역도 터치 액션 허용 (명시적)
              style={{ touchAction: 'pan-y' }}
            />
          </div>
        )}
      </div>
    </BottomSheet>
  );
}