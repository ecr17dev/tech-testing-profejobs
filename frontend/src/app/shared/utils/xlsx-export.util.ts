import * as XLSX from 'xlsx';

export type XlsxRowValue = string | number | null;

export function exportRowsToXlsx(
  fileName: string,
  sheetName: string,
  rows: Array<Record<string, XlsxRowValue>>,
): void {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}

export function getCurrentDateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
