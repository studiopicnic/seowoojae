// src/types/book.ts

// [추가] 책 상태 타입 정의
export type BookStatus = "reading" | "wish" | "finished";

export interface Book {
  id: string;
  user_id?: string;
  title: string;
  authors: string[];
  translators?: string[];
  thumbnail?: string;
  publisher?: string;
  contents?: string;
  isbn?: string;
  total_page?: number;
  current_page?: number;
  
  // [수정] string -> BookStatus로 변경 (자동완성 됨)
  status: BookStatus; 
  
  start_date?: string;
  end_date?: string;
  rating?: number;
  created_at?: string;
}

export interface Memo {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string; // [추가] 수정일 (있을 수도 있고 없을 수도 있음)
  book_id: string;
  user_id: string;
}