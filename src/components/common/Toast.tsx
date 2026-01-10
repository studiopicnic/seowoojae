"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface ToastProps {
  isVisible: boolean;
  message: string;
}

export default function Toast({ isVisible, message }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          // [수정 포인트] left-1/2 -translate-x-1/2 로 중앙 정렬 + max-w-[430px] 제한
          className="fixed top-[60px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 h-[48px] z-[110] pointer-events-none"
        >
          {/* 실제 토스트 박스 */}
          <div className="w-full h-full bg-white border border-black flex items-center px-4 gap-3 shadow-sm">
            <Check className="w-5 h-5 text-black" />
            <span className="text-[14px] font-medium text-gray-900 truncate">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}