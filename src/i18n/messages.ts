import { en, type MessageKey } from "./en";
import { hi } from "./hi";
import { kn } from "./kn";

export type Language = "en" | "hi" | "kn";
export type { MessageKey } from "./en";

type MessageParam = string | number;

export const messages: Record<Language, Record<MessageKey, string>> = { en, hi, kn };

export function isMessageKey(key: string): key is MessageKey {
  return key in en;
}

export function getMessage(language: Language, key: MessageKey, params?: Record<string, MessageParam>) {
  const message = messages[language][key];
  if (!params) return message;
  return Object.entries(params).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    message,
  );
}

export const languageLabels: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
};

export const languages: Language[] = ["en", "hi", "kn"];
