import type { Locale } from "./i18n";

export function formatRelativeTime(timestamp: number, locale: Locale): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.round(diffMs / 60000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffMin < 1) return rtf.format(0, "minute");
  if (diffMin < 60) return rtf.format(-diffMin, "minute");

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return rtf.format(-diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(-diffDays, "day");
}
