"use client";

import { useState, useEffect } from "react";
import FullScreenModal from "@/components/common/FullScreenModal";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rating: number) => void;
  initialRating?: number | null;
}

export default function RatingModal({
  isOpen,
  onClose,
  onConfirm,
  initialRating,
}: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedRating(initialRating || null);
    }
  }, [isOpen, initialRating]);

  const handleConfirm = () => {
    if (selectedRating !== null) {
      onConfirm(selectedRating);
      onClose();
    }
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col h-full">
        {/* 중앙 컨텐츠 */}
        <div className="flex-1 flex flex-col items-center pt-[100px] px-6">
          <h2 className="text-[22px] font-bold text-gray-900 mb-2">
            책은 어떠셨나요?
          </h2>
          <p className="text-[14px] text-gray-400 mb-12">
            당신만의 평가를 남겨보세요
          </p>

          <div className="flex gap-3 justify-center w-full">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => setSelectedRating(score)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-[16px] transition-all duration-200 ${
                  selectedRating === score
                    ? "border-[1.5px] border-black text-black font-bold" 
                    : "border border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 pb-10">
          <button
            onClick={handleConfirm}
            disabled={selectedRating === null}
            className={`w-full h-[52px] text-[16px] font-bold rounded-xl transition-all duration-200 ${
              selectedRating !== null
                ? "bg-black text-white active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            확인
          </button>
        </div>
      </div>
    </FullScreenModal>
  );
}