"use client";

import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean; // 삭제 같은 위험한 동작일 때 빨간 버튼 쓰려고
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  isDanger = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* 배경 (클릭 시 닫힘) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* 모달 창 */}
      <div className="relative w-full max-w-[320px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <h3 className="text-[18px] font-bold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-[14px] text-gray-500 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        <div className="flex border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-[15px] font-medium text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <div className="w-[1px] bg-gray-100" />
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-4 text-[15px] font-bold hover:bg-gray-50 active:bg-gray-100 transition-colors ${
              isDanger ? "text-red-500" : "text-blue-600"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}