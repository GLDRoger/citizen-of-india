import type { Language } from "@/i18n/messages";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatters: Record<Language, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }),
  hi: new Intl.DateTimeFormat("hi-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }),
  kn: new Intl.DateTimeFormat("kn-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }),
};

const monthYearFormatters: Record<Language, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }),
  hi: new Intl.DateTimeFormat("hi-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }),
  kn: new Intl.DateTimeFormat("kn-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }),
};

const timeFormatters: Record<Language, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }),
  hi: new Intl.DateTimeFormat("hi-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }),
  kn: new Intl.DateTimeFormat("kn-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }),
};

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatDate(value: string, language: Language = "en") {
  const parts = dateFormatters[language].formatToParts(new Date(`${value.slice(0, 10)}T00:00:00+05:30`));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((candidate) => candidate.type === type)?.value ?? "";
  return [part("day"), part("month"), part("year")].filter(Boolean).join(" ");
}

export function formatDateTime(value: string, language: Language = "en") {
  return `${formatDate(value, language)}, ${timeFormatters[language].format(new Date(value))}`;
}

export function formatMonthYear(value: string, language: Language = "en") {
  return monthYearFormatters[language].format(new Date(`${value.slice(0, 7)}-01T00:00:00+05:30`));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.at(0))
    .join("");
}

export function maskIdentifier(value: string, visibleCharacters = 4) {
  if (value.includes("*") || value.includes("X")) {
    return value;
  }
  const compact = value.replace(/\s/g, "");
  const suffix = compact.slice(-visibleCharacters);
  return `${compact.slice(0, 2)}••••${suffix}`;
}

export function daysUntil(value: string) {
  const target = new Date(`${value.slice(0, 10)}T00:00:00+05:30`).getTime();
  return Math.ceil((target - Date.now()) / 86_400_000);
}

const evidenceLabels: Record<string, string> = {
  "death-certificate": "Death certificate",
  "doc:itr-v-fy25": "Latest ITR-V",
  "income-declaration": "Income declaration",
};

export function formatEvidence(value: string) {
  return evidenceLabels[value] ?? value.replace("doc:", "").replaceAll("-", " ");
}
