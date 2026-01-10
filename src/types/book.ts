// src/types/book.ts

export interface Book {
  title: string;
  authors: string[];
  translators: string[]; // 옮긴이
  thumbnail: string;
  publisher: string;
  contents: string;      // 책 소개
  isbn: string;          // 고유 ID 대용
}