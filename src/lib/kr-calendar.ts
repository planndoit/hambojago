import Holidays from "date-holidays";

const hd = new Holidays("KR");

function seoulNoonInstant(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00+09:00`);
}

export function getKstWeekdaySun0(isoDate: string): number {
  const d = seoulNoonInstant(isoDate);
  const w = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short"
  }).format(d);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  return map[w] ?? 0;
}

export function getKrDayMeta(isoDate: string): {
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName: string | null;
} {
  const weekday = getKstWeekdaySun0(isoDate);
  const isWeekend = weekday === 0 || weekday === 6;
  const h = hd.isHoliday(seoulNoonInstant(isoDate));
  const list = h === false ? [] : h;
  const isHoliday = list.length > 0;
  const holidayName = list.map((x) => x.name).filter(Boolean).join(" · ") || null;

  return { isWeekend, isHoliday, holidayName };
}
