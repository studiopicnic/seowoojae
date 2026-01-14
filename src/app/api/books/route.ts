import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  
  // [수정 1] 프론트엔드에서 보낸 page와 size 값을 받아옵니다.
  // 값이 없으면 기본값(page=1, size=20)을 사용합니다.
  const page = searchParams.get("page") || "1";
  const size = searchParams.get("size") || "20";

  // 검색어가 없으면 에러 반환
  if (!query) {
    return NextResponse.json({ error: "검색어가 없습니다." }, { status: 400 });
  }

  try {
    // [수정 2] URL에 page와 size 변수를 적용합니다.
    const response = await fetch(
      `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(
        query
      )}&target=title&page=${page}&size=${size}`, 
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