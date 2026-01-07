import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // 브라우저에서 사용할 Supabase 클라이언트를 만듭니다.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}