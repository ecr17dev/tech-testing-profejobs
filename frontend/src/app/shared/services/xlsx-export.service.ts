import { Injectable } from '@angular/core';
import { exportRowsToXlsx, getCurrentDateStamp, XlsxRowValue } from '../utils/xlsx-export.util';

@Injectable({ providedIn: 'root' })
export class XlsxExportService {
  exportRowsToXlsx(
    fileName: string,
    sheetName: string,
    rows: Array<Record<string, XlsxRowValue>>,
  ): void {
    exportRowsToXlsx(fileName, sheetName, rows);
  }

  getCurrentDateStamp(): string {
    return getCurrentDateStamp();
  }
}
