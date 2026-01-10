"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // [추가된 부분] 로그인 상태 감지기
  // 페이지 로드 시점 & 로그인 상태 변경 시점을 감시해서
  // 로그인이 되어있다면 즉시 홈(/home)으로 이동시킵니다.
  useEffect(() => {
    // 1. 페이지 접속 시 이미 로그인 된 상태인지 체크
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/home");
      }
    };
    checkUser();

    // 2. 로그인 프로세스가 진행되면서 상태가 변하는 순간을 감지 (핵심!)
    // 첫 시도 때 쿠키가 세팅되자마자 바로 반응하게 해줍니다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || session) {
        router.replace("/home");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleSocialLogin = async (provider: "google" | "kakao") => {
    // [수정] location.origin을 사용하여 현재 환경(로컬/배포)에 맞게 돌아오게 설정
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  return (
    <div className="flex flex-col justify-between min-h-screen px-6 py-10 bg-white">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">서우재(書宇齋)</h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-700">
          독서를 간단히 기록하고,<br /> 나만의 서재를 채워가요
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => alert("애플 로그인은 추후 설정 예정입니다.")}
          className="flex items-center w-full px-6 py-4 transition-transform bg-white border border-gray-300 rounded-xl active:scale-[0.98]"
        >
          <div className="w-6 h-6 mr-3 bg-gray-200 rounded-full"></div>
          <span className="flex-1 text-base font-medium text-center text-gray-900">애플로 로그인하기</span>
        </button>

        <button
          onClick={() => handleSocialLogin("google")}
          className="flex items-center w-full px-6 py-4 transition-transform bg-white border border-gray-300 rounded-xl active:scale-[0.98]"
        >
          {/* 구글 아이콘 (편의상 색상 원으로 유지, 필요시 SVG로 교체 가능) */}
          <div className="w-6 h-6 mr-3 bg-gray-200 rounded-full"></div>
          <span className="flex-1 text-base font-medium text-center text-gray-900">구글로 로그인하기</span>
        </button>
      </div>
    </div>
  );
}