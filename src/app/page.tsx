import { redirect } from "next/navigation";

export default function Home() {
  // 들어오자마자 '/login' 폴더로 이동시킴 (웹 속도 최적화)
  redirect("/login");
}