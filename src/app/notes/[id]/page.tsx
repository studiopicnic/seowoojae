"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import CommonHeader from "@/components/common/CommonHeader";
import OverlayModal from "@/components/common/OverlayModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import Toast from "@/components/common/Toast";
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
  const [toastMessage, setToastMessage] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleEdit = () => {
    setIsMenuOpen(false);
    setIsEditModalOpen(true);
  };

  const handleEditComplete = () => {
    fetchNote();
    setToastMessage("노트가 수정되었습니다");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  if (isLoading) return <div className="min-h-screen bg-white" />;
  if (!note) return null;

  return (
    // [유지] App Shell 구조: fixed inset-0
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

      {/* 3. 수정 모달 */}
      <BookSelectModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveComplete={handleEditComplete}
        isEditMode={true}
        noteId={note.id}
        initialContent={note.content}
        initialBook={note.books as any} 
      />

      {/* 4. 헤더 영역: shrink-0 및 z-index 격리 */}
      <div className="shrink-0 z-10 bg-white">
        <CommonHeader 
          leftIcon={<ChevronLeft className="w-6 h-6" />}
          onLeftClick={() => router.back()}
          rightIcon={<MoreHorizontal className="w-6 h-6" />}
          onRightClick={() => setIsMenuOpen(true)}
        />
      </div>

      {/* 5. 메인 컨텐츠 영역: absolute inset-0 구조로 스크롤 경험 통일 */}
      <div className="flex-1 w-full relative overflow-hidden bg-white">
        <main className="absolute inset-0 w-full h-full px-6 pb-12 overflow-y-auto overscroll-y-auto scrollbar-hide">
          <div className="mt-4 mb-8 text-center">
            <span className="text-[14px] text-gray-400 font-medium">
              {note.books?.title}
            </span>
          </div>
          <div className="flex flex-col items-center pb-20">
            <p className="text-[16px] text-gray-900 leading-loose whitespace-pre-wrap text-left w-full">
              {note.content}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}