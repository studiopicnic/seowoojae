"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Home, User, PenSquare, Plus, LogOut, ChevronLeft, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // 애니메이션 라이브러리 추가

type ModalStep = "selection" | "search";

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("reading");
  
  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>("selection");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const openModal = () => {
    setModalStep("selection");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchQuery("");
  };

  const handleSelectStatus = (status: string) => {
    setSelectedStatus(status);
    setSearchQuery("");
    setModalStep("search");
  };

  const handleBackStep = () => {
    setModalStep("selection");
  };

  const handleClearQuery = () => {
    setSearchQuery("");
  };

  return (
    <div className="h-dvh flex flex-col bg-white overflow-hidden relative">
      
      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-40 px-3 py-1.5 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm hover:bg-black transition-colors flex items-center gap-1 cursor-pointer"
      >
        <LogOut className="w-3 h-3" />
        로그아웃
      </button>

      {/* 상단 탭 */}
      <header className="sticky top-0 z-10 flex items-center justify-center w-full pt-8 pb-4 bg-white gap-6">
        {["reading", "wish", "finished"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-lg font-bold transition-colors cursor-pointer hover:opacity-70 ${
              activeTab === tab ? "text-gray-900" : "text-gray-300"
            }`}
          >
            {tab === "reading" ? "읽고 있는 책" : tab === "wish" ? "읽고 싶은 책" : "읽은 책"}
          </button>
        ))}
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-2">첫 책을 기록해볼까요?</h2>
        <p className="text-sm text-gray-500 leading-relaxed">작은 기록이 쌓여 나만의 독서 여정이 됩니다.</p>
      </main>

      {/* 하단 네비게이션 */}
      <div className="fixed bottom-0 w-full max-w-[430px] z-20">
        <div className="absolute bottom-[68px] left-0 w-full flex justify-center pointer-events-none">
          <button 
            onClick={openModal}
            className="pointer-events-auto w-14 h-10 bg-black text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer hover:bg-gray-800"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        <nav className="h-[60px] bg-white border-t border-gray-100 flex items-center justify-between px-10 pb-2">
          <button className="p-2 text-gray-900 cursor-pointer"><Home className="w-6 h-6 fill-current" /></button>
          <button className="p-2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"><PenSquare className="w-6 h-6" /></button>
          <button className="p-2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"><User className="w-6 h-6" /></button>
        </nav>
      </div>

      {/* === [멀티 스텝 모달 - Framer Motion 적용] === */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex justify-center items-end">
            {/* 배경 레이어 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* 모달 본체: 드래그 기능 추가 */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                // 아래로 100px 이상 내리거나 속도가 빠르면 닫기
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  closeModal();
                }
              }}
              className="relative w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: "92dvh" }}
            >
              {/* 드래그 핸들 영역 (상단 손잡이 부분) */}
              <div className="pt-4 px-6 pb-2 shrink-0 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <div className="relative flex items-center justify-center mb-4">
                  {modalStep === "search" && (
                    <button 
                      onClick={handleBackStep}
                      className="absolute left-0 p-1 -ml-1 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  <h3 className="text-lg font-bold text-gray-900">추가하기</h3>
                </div>
              </div>

              {/* 내용 영역 */}
              <div 
                className={`px-6 pb-12 overflow-y-auto transition-[height] duration-300 ${
                  modalStep === 'search' ? 'h-[500px]' : 'h-auto'
                }`}
              >
                {modalStep === "selection" && (
                  <div className="space-y-3">
                    {["읽고 있는 책", "읽고 싶은 책", "읽은 책"].map((status) => (
                      <button 
                        key={status}
                        onClick={() => handleSelectStatus(status)} 
                        className="w-full py-4 text-[15px] font-medium text-gray-900 border border-gray-200 rounded-xl active:bg-gray-50 transition-colors"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}

                {modalStep === "search" && (
                  <div className="flex flex-col h-full">
                    <div className="relative mb-6">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-4 pl-12 pr-12 text-[15px] bg-gray-50 text-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-gray-900/10"
                        autoFocus
                      />
                      {searchQuery.length > 0 && (
                        <button
                          onClick={handleClearQuery}
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                      <p>검색 결과가 여기에 표시됩니다</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}