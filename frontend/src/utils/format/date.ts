function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function getParts(dt: string | Date) {
  const d = typeof dt === "string" ? new Date(dt) : dt;
  if (isNaN(d.getTime())) throw new Error("Invalid date");
  return {
    yyyy: d.getFullYear(),
    mm: pad(d.getMonth() + 1),
    dd: pad(d.getDate()),
    hh: pad(d.getHours()),
    mi: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
  };
}

/**
 * YYYY
 */
export function formatYear(dt: string | Date): string {
  const { yyyy } = getParts(dt);
  return `${yyyy}`;
}

/**
 * YYYY-MM or YYYY.MM
 */
export function formatYearMonth(
  dt: string | Date,
  sep: "-" | "." = "-"
): string {
  const { yyyy, mm } = getParts(dt);
  return `${yyyy}${sep}${mm}`;
}

/**
 * YYYY-MM-DD or YYYY.MM.DD
 */
export function formatDate(dt: string | Date, sep: "-" | "." = "-"): string {
  const { yyyy, mm, dd } = getParts(dt);
  return `${yyyy}${sep}${mm}${sep}${dd}`;
}

/**
 * YYYY-MM-DD HH:mm or YYYY.MM.DD HH:mm
 */
export function formatDateTime(
  dt: string | Date,
  sep: "-" | "." = "-"
): string {
  const { yyyy, mm, dd, hh, mi } = getParts(dt);
  return `${yyyy}${sep}${mm}${sep}${dd} ${hh}:${mi}`;
}

/**
 * YYYY-MM-DD HH:mm:ss or YYYY.MM.DD HH:mm:ss
 */
export function formatDateTimeWithSeconds(
  dt: string | Date,
  sep: "-" | "." = "-"
): string {
  const { yyyy, mm, dd, hh, mi, ss } = getParts(dt);
  return `${yyyy}${sep}${mm}${sep}${dd} ${hh}:${mi}:${ss}`;
}

/**
 * HH:mm
 */
export function formatClock(dt: string | Date): string {
  const { hh, mi } = getParts(dt);
  return `${hh}:${mi}`;
}

/**
 * 프로젝트 기간 표시. "2026.03.17 - 2026.04.30", 종료일이 없으면 "2026.03.17 - 진행 중".
 * 시작일도 없으면 빈 문자열. 값이 "YYYY-MM-DD" 문자열이라 Date 로 바꾸지 않는다 —
 * new Date("2026-03-17") 은 UTC 자정이어서 서쪽 시간대에서는 하루가 밀린다.
 */
export function formatPeriod(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  if (!start) return "";
  const dot = (iso: string) => iso.slice(0, 10).replace(/-/g, ".");
  return `${dot(start)} - ${end ? dot(end) : "진행 중"}`;
}
