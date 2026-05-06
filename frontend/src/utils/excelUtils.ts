/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * ============================================================ */
import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file (.xlsx)
 * 
 * @param data - Array of objects to be exported
 * @param fileName - Name of the file (without extension)
 * @param sheetName - Name of the worksheet (default: "Data")
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = "Data") => {
  try {
    // 1. Create a worksheet from JSON data
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // 2. Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // 3. Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // 4. Trigger the download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Excel Export Error:", error);
    alert("Failed to export Excel file. Please try again.");
  }
};

/**
 * Reads an Excel file and returns JSON data
 * 
 * @param file - The file object from an input element
 * @returns Promise resolving to an array of objects
 */
export const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
