export function buildPeriodQuery(month: number, year: number) {
  return `month=${month}&year=${year}`;
}

export function buildPeriodHref(pathname: string, month: number, year: number) {
  return `${pathname}?${buildPeriodQuery(month, year)}`;
}
