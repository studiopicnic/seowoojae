// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  // 1. 현재 접속한 주소(origin)를 가져옵니다. 
  // 로컬이면 http://localhost:3000, 배포판이면 https://seowoojae... 가 들어옵니다.
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // [수정 포인트] 로그인 직후 이동할 페이지 설정
  // next 값이 있으면 거기로 가고, 없으면 무조건 '/home'으로 보냅니다.
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 로그인 성공! 
      // 로컬에서 로그인했으면 localhost/home으로, 배포에서 했으면 vercel/home으로 자동 이동합니다.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 실패 시 로그인 페이지로 복귀
  return NextResponse.redirect(`${origin}/login`);
}