export function truncateHex(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function formatEth(
  value: string | number,
  locale?: string,
  fractionDigits = 6,
): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatInt(value: number, locale?: string): string {
  return value.toLocaleString(locale);
}

export function formatTimestamp(iso: string, locale?: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

export function formatRelative(
  iso: string,
  locale?: string,
  now: Date = new Date(),
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (abs < 60) return rtf.format(-diffSec, "second");
  if (abs < 3600) return rtf.format(-Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(-Math.round(diffSec / 3600), "hour");
  return rtf.format(-Math.round(diffSec / 86400), "day");
}
