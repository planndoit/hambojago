import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <section className="card stack">
        <div>
          <p className="eyebrow">함보자고</p>
          <h1 className="hero-title">10초만에 약속 날짜를 잡아보세요</h1>
          <p className="description">
            링크 하나를 공유하고, 참여자는 로그인 없이 되는 날만 누르면 됩니다.
          </p>
        </div>
        <Link className="button" href="/events/new">
          약속 만들기
        </Link>
      </section>
    </main>
  );
}
