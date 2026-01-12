"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  title: string;
  initialValue?: number;
}

export default function InputModal({ isOpen, onClose, onConfirm, title, initialValue = 0 }: InputModalProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // 모달이 열릴 때마다 초기값 세팅 및 포커스
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      // 약간의 지연 후 포커스 (애니메이션 고려)
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = () => {
    onConfirm(value);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* 모달 본체 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-[320px] bg-white rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-center text-gray-900 mb-6">
              {title}
            </h3>

            <input
              ref={inputRef}
              type="number"
              value={value || ""}
              onChange={(e) => setValue(Number(e.target.value))}
              onKeyDown={handleKeyDown}
              className="w-full h-12 text-center text-2xl font-bold border-b-2 border-gray-200 focus:border-black outline-none mb-8"
              placeholder="0"
            />

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-11 text-[15px] font-medium text-gray-500 bg-gray-100 rounded-xl active:scale-[0.98] transition-transform"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 h-11 text-[15px] font-bold text-white bg-black rounded-xl active:scale-[0.98] transition-transform"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}