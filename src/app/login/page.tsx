"use client";

import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const handleSocialLogin = async (provider: "google" | "apple") => {
    const supabase = createClient();
    
    await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        // 가장 안정적인 기본 리다이렉트 설정으로 복구합니다.
        redirectTo: `${window.location.origin}/auth/callback?next=/home`,
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
          <div className="w-6 h-6 mr-3 bg-gray-200 rounded-full"></div>
          <span className="flex-1 text-base font-medium text-center text-gray-900">구글로 로그인하기</span>
        </button>
      </div>
    </div>
  );
}