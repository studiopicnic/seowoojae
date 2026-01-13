"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"; // [수정] useSearchParams 추가
import { createClient } from "@/utils/supabase/client";

import CommonHeader from "@/components/common/CommonHeader";
import BottomNav from "@/components/common/BottomNav";
import BookSelectModal from "@/components/note/BookSelectModal";
import Toast from "@/components/common/Toast";

// (MemoWithBook 인터페이스 등 기존 코드 유지...)
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

export default function RecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // [추가]
  const supabase = createClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memos, setMemos] = useState<MemoWithBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // [추가] 삭제 후 돌아왔을 때 토스트 처리
  useEffect(() => {
    if (searchParams.get("toast") === "deleted") {
      setToastMessage("노트가 삭제되었습니다");
      setShowToast(true);
      
      // URL 파라미터 청소
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("toast");
      window.history.replaceState({}, "", newUrl.toString());

      setTimeout(() => setShowToast(false), 2000);
    }
  }, [searchParams]);

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
        // [수정] 정렬 기준 변경: created_at -> updated_at
        .order("updated_at", { ascending: false }); 

      if (error) throw error;
      
      if (data) setMemos(data as any);

    } catch (error) {
      console.error("메모 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchMemos(); }, [fetchMemos]);

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
    <div className="fixed inset-0 flex flex-col bg-white max-w-[430px] mx-auto shadow-2xl overflow-hidden">
      <Toast isVisible={showToast} message={toastMessage} />
      
      <CommonHeader 
        title="노트"
        align="left"
        rightIcon={<Plus className="w-6 h-6" />}
        onRightClick={() => setIsModalOpen(true)}
      />

      <main className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">로딩 중...</div>
        ) : memos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <p className="text-[16px] font-medium text-gray-900">첫 독서 노트를 남겨볼까요?</p>
            <p className="text-[13px] text-gray-500 leading-relaxed">한 줄의 메모가 쌓여 당신의 독서 여정이 깊어집니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-2">
            {memos.map((memo) => (
              <div 
                key={memo.id} 
                className="w-full border border-gray-100 rounded-[12px] p-5 flex flex-col gap-3 shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
                // [수정] 클릭 시 노트 상세 페이지로 이동
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