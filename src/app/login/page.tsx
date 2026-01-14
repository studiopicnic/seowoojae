"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/home");
      }
    };
    checkUser();

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
    // [수정] App Shell 구조화: fixed inset-0으로 화면 잠금 및 중앙 정렬 유지
    <div className="fixed inset-0 flex flex-col bg-white overflow-hidden max-w-[430px] mx-auto shadow-2xl">
      
      {/* [수정] 내부 콘텐츠 영역: absolute inset-0 구조 
        justify-between을 사용하여 상단 텍스트와 하단 버튼을 양 끝으로 배치 
      */}
      <div className="absolute inset-0 flex flex-col justify-between px-6 py-20 bg-white">
        
        {/* 상단 텍스트 영역 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">서우재(書宇齋)</h1>
          <p className="mt-3 text-lg leading-relaxed text-gray-700">
            독서를 간단히 기록하고,<br /> 나만의 서재를 채워가요
          </p>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="space-y-3">
          <button
            onClick={() => alert("애플 로그인은 추후 설정 예정입니다.")}
            className="flex items-center w-full px-6 py-4 transition-transform bg-white border border-gray-300 rounded-xl active:scale-[0.98]"
          >
            <div className="w-6 h-6 mr-3 bg-gray-200 rounded-full"></div>
            <span className="flex-1 text-base font-medium text-center text-gray-900">애플로 로그인하기</span>
          </button>

          <button
            onClick={() => handleSocialLogin("google")}
            className="flex items-center w-full px-6 py-4 transition-transform bg-white border border-gray-100 bg-gray-50/50 rounded-xl active:scale-[0.98]"
          >
            {/* 구글 아이콘 대용 원형 배경 */}
            <div className="w-6 h-6 mr-3 bg-gray-200 rounded-full"></div>
            <span className="flex-1 text-base font-medium text-center text-gray-900">구글로 로그인하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}