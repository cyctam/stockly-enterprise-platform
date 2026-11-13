export function generateRequestCode(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `PR-${year}${month}${day}-${randomSuffix}`;
}

export function isRequestCode(value: string): boolean {
  return /^PR-\d{8}-\d{4}$/.test(value);
}
