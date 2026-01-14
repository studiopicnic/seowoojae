"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import CommonHeader from "@/components/common/CommonHeader";
import BottomNav from "@/components/common/BottomNav";
import BookSelectModal from "@/components/note/BookSelectModal";
import Toast from "@/components/common/Toast";

interface MemoWithBook {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  book_id: string;
  books: {
    title: string;
  };
}

function RecordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memos, setMemos] = useState<MemoWithBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 토스트 메시지 처리 (삭제 후 돌아왔을 때 등)
  useEffect(() => {
    if (searchParams.get("toast") === "deleted") {
      setToastMessage("노트가 삭제되었습니다");
      setShowToast(true);
      
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("toast");
      window.history.replaceState({}, "", newUrl.toString());

      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // 메모 데이터 로드
  const fetchMemos = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("memos")
        .select(`
          id,
          content,
          created_at,
          book_id,
          books (
            title
          )
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      // Supabase 타입 추론 문제 해결을 위한 단언
      if (data) setMemos(data as unknown as MemoWithBook[]);

    } catch (error) {
      console.error("메모 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchMemos();
  }, [fetchMemos]);

  const handleNoteAdded = () => {
    fetchMemos();
    setToastMessage("새로운 노트가 추가되었습니다");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <Toast isVisible={showToast} message={toastMessage} />
      
      {/* [수정] type="tab" 적용 및 여백 조정 */}
      <CommonHeader 
        title="노트"
        type="tab"
        rightIcon={<Plus className="w-6 h-6" />}
        onRightClick={() => setIsModalOpen(true)}
      />

      <main className="flex-1 flex flex-col px-6 pt-4 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            로딩 중...
          </div>
        ) : memos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <p className="text-[16px] font-medium text-gray-900">첫 독서 노트를 남겨볼까요?</p>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              한 줄의 메모가 쌓여<br/>당신의 독서 여정이 깊어집니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {memos.map((memo) => (
              <div 
                key={memo.id} 
                className="w-full border border-gray-100 rounded-[12px] p-5 flex flex-col gap-3 shadow-sm active:scale-[0.99] transition-transform cursor-pointer bg-white"
                onClick={() => router.push(`/notes/${memo.id}`)} 
              >
                <div className="text-center">
                  <span className="text-[12px] text-gray-400 font-medium">{memo.books?.title}</span>
                </div>
                <p className="text-[15px] text-gray-900 leading-relaxed line-clamp-3 text-center px-2">
                  {memo.content}
                </p>
                <div className="text-left mt-1">
                  <span className="text-[12px] text-gray-400">{formatDate(memo.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      <BookSelectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveComplete={handleNoteAdded} 
      />
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <RecordContent />
    </Suspense>
  );
}