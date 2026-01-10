// src/app/api/books/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  // 검색어가 없으면 에러 반환
  if (!query) {
    return NextResponse.json({ error: "검색어가 없습니다." }, { status: 400 });
  }

  try {
    // 카카오 책 검색 API 호출
    const response = await fetch(
      `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(
        query
      )}&target=title&size=20`, // 제목 검색, 최대 20권
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("카카오 API 요청 실패");
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Book Search Error:", error);
    return NextResponse.json(
      { error: "책을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}