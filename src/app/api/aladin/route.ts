import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn");

  if (!isbn) {
    return NextResponse.json({ page: 0, cover: null });
  }

  const ttbKey = process.env.NEXT_PUBLIC_ALADIN_TTB_KEY;

  const isbnList = isbn.split(" ");
  let targetIsbn = isbnList.find((code) => code.length === 13);
  let targetType = "ISBN13";

  if (!targetIsbn) {
    targetIsbn = isbnList.find((code) => code.length === 10);
    targetType = "ISBN";
  }

  if (!targetIsbn) {
    return NextResponse.json({ page: 0, cover: null });
  }

  try {
    const response = await fetch(
      `https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${ttbKey}&itemIdType=${targetType}&ItemId=${targetIsbn}&output=js&Version=20131101&OptResult=packing`
    );

    const data = await response.json();

    if (data.errorCode || !data.item || data.item.length === 0) {
      return NextResponse.json({ page: 0, cover: null });
    }

    const item = data.item[0];
    const pageInfo = item.subInfo?.itemPage || 0;
    
    // [수정 핵심] 이미지 URL 업그레이드 로직
    let coverUrl = item.cover;
    if (coverUrl) {
      // 알라딘 썸네일(coversum)이나 일반(cover)을 고화질(cover500)로 강제 변경
      coverUrl = coverUrl.replace("/coversum/", "/cover500/");
      coverUrl = coverUrl.replace("/cover/", "/cover500/");
    }

    console.log(`[알라딘] 쪽수: ${pageInfo}p | 이미지: ${coverUrl}`);
    
    return NextResponse.json({ page: pageInfo, cover: coverUrl });

  } catch (error) {
    console.error("알라딘 API 통신 에러:", error);
    return NextResponse.json({ page: 0, cover: null });
  }
}