export function parseSeoulLocalDateTime(input: string): Date | null {
  const t = input.trim();
  if (!t) {
    return null;
  }

  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(t);

  if (!m) {
    return null;
  }

  return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00+09:00`);
}

export function toDateTimeLocalStringSeoul(iso: string): string {
  const d = new Date(iso);
  const s = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(d);

  return s.replace(" ", "T");
}

export function formatSeoulDateTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
}
