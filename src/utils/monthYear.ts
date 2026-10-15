const MONTH_NAMES: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

export const toMonthInputValue = (value: string | undefined): string => {
  const normalized = value?.trim();
  if (!normalized) return "";

  const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (isoMatch) {
    const month = Number(isoMatch[2]);
    return month >= 1 && month <= 12
      ? `${isoMatch[1]}-${String(month).padStart(2, "0")}`
      : "";
  }

  const monthNameMatch = normalized.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthNameMatch) {
    const month = MONTH_NAMES[monthNameMatch[1].toLowerCase()];
    return month ? `${monthNameMatch[2]}-${month}` : "";
  }

  const numericMatch = normalized.match(/^(\d{1,2})\/(\d{4})$/);
  if (numericMatch) {
    const month = Number(numericMatch[1]);
    return month >= 1 && month <= 12
      ? `${numericMatch[2]}-${String(month).padStart(2, "0")}`
      : "";
  }

  return "";
};

export const fromMonthInputValue = (value: string): string => value.trim();
