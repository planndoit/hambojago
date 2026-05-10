import { redirect } from "next/navigation";

import { createEventAction, signOutAction } from "@/app/actions";
import { getCurrentCreator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const creator = await getCurrentCreator();

  if (!creator) {
    redirect("/login");
  }

  return (
    <main className="page">
      <section className="card stack">
        <div>
          <p className="eyebrow">약속 생성</p>
          <h1 className="title">날짜 범위만 정하면 링크가 만들어집니다</h1>
          <p className="description">참여자는 범위 안의 날짜 중 가능한 날만 선택합니다.</p>
        </div>
        <form action={createEventAction} className="form">
          <label className="field">
            <span>약속 이름</span>
            <input className="input" name="title" placeholder="토요일 저녁 모임" required />
          </label>
          <label className="field">
            <span>설명</span>
            <textarea
              className="input"
              name="description"
              placeholder="간단한 안내를 적어주세요"
              rows={3}
            />
          </label>
          <label className="field">
            <span>시작 날짜</span>
            <input className="input" name="startDate" required type="date" />
          </label>
          <label className="field">
            <span>종료 날짜</span>
            <input className="input" name="endDate" required type="date" />
          </label>
          <button className="button" type="submit">
            링크 만들기
          </button>
        </form>
        <form action={signOutAction}>
          <button className="button secondary" type="submit">
            로그아웃
          </button>
        </form>
      </section>
    </main>
  );
}
