import Link from "next/link";
import { headers } from "next/headers";

import { getEventWithDates } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function SharePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventWithDates(slug);
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const sharePath = `/e/${event.slug}`;
  const shareUrl = host ? `${protocol}://${host}${sharePath}` : sharePath;

  return (
    <main className="page">
      <section className="card stack">
        <div>
          <p className="eyebrow">공유 링크 생성 완료</p>
          <h1 className="title">{event.title}</h1>
          <p className="description">아래 링크를 카카오톡 등으로 공유하세요.</p>
        </div>
        <input className="input" readOnly value={shareUrl} />
        <Link className="button" href={sharePath}>
          참여 화면 보기
        </Link>
        <Link className="button secondary" href={`/e/${event.slug}/results`}>
          결과 화면 보기
        </Link>
      </section>
    </main>
  );
}
