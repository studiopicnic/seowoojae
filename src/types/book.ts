export interface Book {
  id?: string;
  user_id?: string;
  
  title: string;
  authors: string[];
  translators?: string[];
  thumbnail?: string;
  publisher?: string;
  contents?: string;
  isbn?: string;
  
  status?: "reading" | "wish" | "finished";
  
  start_date?: string;
  // [추가] 독서 종료일
  end_date?: string; 
  
  current_page?: number;
  total_page?: number;
  
  // [추가] 평점 (없을 수도 있음)
  rating?: number; 
  
  created_at?: string;
}

export interface Memo {
  id: string;
  content: string;
  created_at: string;
  page?: number;
}