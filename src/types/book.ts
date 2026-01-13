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
  book_id: string;
  content: string;
  created_at: string;
}