// src/components/common/AlertModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  buttonText?: string;
}

export default function AlertModal({ 
  isOpen, 
  onClose, 
  message, 
  buttonText = "확인" 
}: AlertModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
          {/* 배경 (클릭 시 닫힘) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" 
            onClick={onClose}
          />
          
          {/* 모달 본체 */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-[300px] p-6 rounded-2xl shadow-2xl z-10 flex flex-col items-center text-center"
          >
            <h3 className="text-[16px] font-medium text-gray-900 mb-6 whitespace-pre-wrap">
              {message}
            </h3>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-black text-white text-[14px] font-bold rounded-xl active:scale-95 transition-transform"
            >
              {buttonText}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}