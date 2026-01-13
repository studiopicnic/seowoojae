"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import CommonHeader from "@/components/common/CommonHeader";
import OverlayModal from "@/components/common/OverlayModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import Toast from "@/components/common/Toast";
// [추가] 모달 import
import BookSelectModal from "@/components/note/BookSelectModal";

interface NoteDetail {
  id: string;
  content: string;
  created_at: string;
  book_id: string;
  books: {
    title: string;
  };
}

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const [note, setNote] = useState<NoteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); // 토스트 메시지 동적 관리

  // [추가] 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 데이터 로딩
  const fetchNote = useCallback(async () => {
    if (!params?.id) return;

    const { data, error } = await supabase
      .from("memos")
      .select(`
        id, content, created_at, book_id,
        books ( title )
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      console.error(error);
      router.replace("/record");
      return;
    }

    if (data) setNote(data as any);
    setIsLoading(false);
  }, [params?.id, supabase, router]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const handleDelete = async () => {
    if (!note) return;
    const { error } = await supabase.from("memos").delete().eq("id", note.id);
    if (error) { alert("삭제 실패"); return; }
    router.replace("/record?toast=deleted");
  };

  // [수정] 수정 버튼 클릭 시 모달 열기
  const handleEdit = () => {
    setIsMenuOpen(false); // 메뉴 닫고
    setIsEditModalOpen(true); // 수정 모달 열기
  };

  // [추가] 수정 완료 핸들러
  const handleEditComplete = () => {
    fetchNote(); // 데이터 새로고침
    setToastMessage("노트가 수정되었습니다"); // 와이어프레임 7-10 텍스트
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  if (isLoading) return <div className="min-h-screen bg-white" />;
  if (!note) return null;

  return (
    <div className="fixed inset-0 flex flex-col bg-white max-w-[430px] mx-auto shadow-2xl overflow-hidden">
      <Toast isVisible={showToast} message={toastMessage} />

      {/* 1. 메뉴 (OverlayModal) */}
      <OverlayModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <div className="flex flex-col gap-3">
          <button onClick={handleEdit} className="w-full h-[56px] flex items-center justify-between px-5 bg-[#333333] rounded-xl active:scale-[0.98] transition-transform">
            <span className="text-[16px] font-bold text-white">노트 수정</span>
            <Pencil className="w-5 h-5 text-white/70" />
          </button>
          
          <button onClick={() => { setIsMenuOpen(false); setIsDeleteConfirmOpen(true); }} className="w-full h-[56px] flex items-center justify-between px-5 bg-[#333333] rounded-xl active:scale-[0.98] transition-transform hover:bg-[#443333]">
            <span className="text-[16px] font-bold text-white">노트 삭제</span>
            <Trash2 className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </OverlayModal>

      {/* 2. 삭제 확인 모달 */}
      <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="노트를 삭제하시겠습니까?"
        message="삭제된 기록은 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        isDanger={true}
      />

      {/* [추가] 3. 수정 모달 (BookSelectModal 재사용) */}
      {/* note.books가 title만 가지고 있지만, 모달 내부에서 title 표시에만 쓰이므로 타입 단언(as any) 또는 호환됨 */}
      <BookSelectModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveComplete={handleEditComplete}
        
        // 수정 모드 활성화
        isEditMode={true}
        noteId={note.id}
        initialContent={note.content}
        initialBook={note.books as any} 
      />

      {/* 4. 헤더 */}
      <CommonHeader 
        leftIcon={<ChevronLeft className="w-6 h-6" />}
        onLeftClick={() => router.back()}
        rightIcon={<MoreHorizontal className="w-6 h-6" />}
        onRightClick={() => setIsMenuOpen(true)}
      />

      {/* 5. 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col px-6 pb-12 overflow-y-auto scrollbar-hide">
        <div className="mt-4 mb-8 text-center">
          <span className="text-[14px] text-gray-400 font-medium">
            {note.books?.title}
          </span>
        </div>
        <div className="flex-1 flex items-center pb-20">
          <p className="text-[16px] text-gray-900 leading-loose whitespace-pre-wrap text-left w-full">
            {note.content}
          </p>
        </div>
      </main>
    </div>
  );
}