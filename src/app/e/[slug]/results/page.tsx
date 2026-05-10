import Link from "next/link";

import { formatKoreanDate } from "@/lib/date";
import { getEventResults } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event, results, participantCount, bestDates } = await getEventResults(slug);
  const bestDateSet = new Set(bestDates.map((result) => result.date));

  return (
    <main className="page">
      <section className="card stack">
        <div>
          <p className="eyebrow">결과</p>
          <h1 className="title">{event.title}</h1>
          <p className="description">현재 {participantCount}명이 선택했어요.</p>
        </div>
        {bestDates[0] ? (
          <div className="result-item best">
            <strong>{formatKoreanDate(bestDates[0].date)}이 가장 유력해요</strong>
            <p className="muted">{bestDates[0].count}명이 선택했습니다.</p>
          </div>
        ) : (
          <p className="muted">아직 선택한 사람이 없습니다.</p>
        )}
        <div className="result-list">
          {results.map((result) => (
            <div
              className={bestDateSet.has(result.date) ? "result-item best" : "result-item"}
              key={result.date}
            >
              <strong>{formatKoreanDate(result.date)}</strong>
              <p className="muted">{result.count}명 선택</p>
              <p>{result.participants.length > 0 ? result.participants.join(", ") : "아직 없음"}</p>
            </div>
          ))}
        </div>
        <Link className="button" href={`/e/${event.slug}`}>
          내 선택 수정하기
        </Link>
      </section>
    </main>
  );
}
