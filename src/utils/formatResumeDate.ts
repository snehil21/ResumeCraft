import type { DateFormat } from "../types/index.ts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const formatResumeDate = (value: string | undefined, format: DateFormat): string => {
  if (!value) return "";
  if (/^(present|current|now)$/i.test(value.trim())) return "Present";

  const match = value.trim().match(/^(\d{4})(?:-(\d{1,2})(?:-\d{1,2})?)?$/);
  if (!match) return value;

  const year = match[1];
  const monthIndex = match[2] ? Number(match[2]) - 1 : null;
  if (format === "YYYY" || monthIndex === null || monthIndex < 0 || monthIndex > 11) return year;
  if (format === "MM/YYYY") return `${String(monthIndex + 1).padStart(2, "0")}/${year}`;
  return `${MONTHS[monthIndex]} ${year}`;
};
