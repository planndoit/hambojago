import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="page">
      <section className="card stack">
        <div>
          <p className="eyebrow">생성자 로그인</p>
          <h1 className="title">약속을 만들려면 로그인하세요</h1>
          <p className="description">
            참여자는 로그인 없이 링크에서 바로 날짜를 선택할 수 있습니다.
          </p>
        </div>
        <AuthForm />
      </section>
    </main>
  );
}
