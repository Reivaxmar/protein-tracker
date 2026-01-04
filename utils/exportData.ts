import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Meal, DailyProteinData } from '../types';

interface ExportData {
  meals: Meal[];
  dailyProteinData: { [date: string]: DailyProteinData };
}

/**
 * Format meals data for export, grouped by date and tag
 */
export function formatMealsForExport(data: ExportData): any[] {
  const formattedData: any[] = [];
  
  // Get all dates and sort them
  const dates = Object.keys(data.dailyProteinData).sort();
  
  dates.forEach((date) => {
    const dailyData = data.dailyProteinData[date];
    const mealsForDay = dailyData.meals;
    
    // Group meals by tag
    const mealsByTag: { [tag: string]: Meal[] } = {};
    
    mealsForDay.forEach((meal) => {
      const tag = meal.tag || 'untagged';
      if (!mealsByTag[tag]) {
        mealsByTag[tag] = [];
      }
      mealsByTag[tag].push(meal);
    });
    
    // Add each meal with its information
    Object.keys(mealsByTag).sort().forEach((tag) => {
      mealsByTag[tag].forEach((meal) => {
        formattedData.push({
          Date: date,
          Tag: tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase(),
          'Meal Name': meal.name,
          'Protein per 100g (g)': meal.proteinPer100g.toFixed(2),
          'Grams Eaten': meal.gramsEaten.toFixed(2),
          'Total Protein (g)': meal.totalProtein.toFixed(2),
          Timestamp: new Date(meal.timestamp).toLocaleString(),
        });
      });
    });
    
    // Add daily summary
    formattedData.push({
      Date: date,
      Tag: '--- DAILY SUMMARY ---',
      'Meal Name': '',
      'Protein per 100g (g)': '',
      'Grams Eaten': '',
      'Total Protein (g)': dailyData.totalProtein.toFixed(2),
      Timestamp: `Target: ${dailyData.targetProtein.toFixed(2)}g`,
    });
    
    // Add empty row for separation
    formattedData.push({
      Date: '',
      Tag: '',
      'Meal Name': '',
      'Protein per 100g (g)': '',
      'Grams Eaten': '',
      'Total Protein (g)': '',
      Timestamp: '',
    });
  });
  
  return formattedData;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[]): string {
  if (data.length === 0) {
    return '';
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma or quote
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
        ? `"${escaped}"`
        : escaped;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Generate a safe filename for export with timestamp
 */
function generateExportFileName(extension: 'csv' | 'xlsx'): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  // Sanitize to ensure only valid filename characters
  const safeDate = date.replace(/[^0-9-]/g, '');
  return `protein_tracker_export_${safeDate}.${extension}`;
}

/**
 * Export data as CSV file
 */
export async function exportAsCSV(data: ExportData): Promise<void> {
  try {
    const formattedData = formatMealsForExport(data);
    
    if (formattedData.length === 0) {
      throw new Error('No data to export');
    }
    
    const csv = arrayToCSV(formattedData);
    const fileName = generateExportFileName('csv');

    // Web fallback: trigger browser download directly
    if (Platform.OS === 'web' || typeof window !== 'undefined') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }

    const fileUri = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + fileName;
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Protein Tracker Data',
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
}

/**
 * Export data as XLSX file
 */
export async function exportAsXLSX(data: ExportData): Promise<void> {
  try {
    const formattedData = formatMealsForExport(data);
    
    if (formattedData.length === 0) {
      throw new Error('No data to export');
    }
    
    // Create a new workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Protein Tracker Data');
    
    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 20 }, // Tag
      { wch: 30 }, // Meal Name
      { wch: 20 }, // Protein per 100g
      { wch: 15 }, // Grams Eaten
      { wch: 18 }, // Total Protein
      { wch: 25 }, // Timestamp
    ];
    
    // Write the workbook to base64
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

    const fileName = generateExportFileName('xlsx');

    // Web fallback: create blob from base64 and trigger download
    if (Platform.OS === 'web' || typeof window !== 'undefined') {
      // convert base64 to binary
      const byteCharacters = atob(wbout);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }

    const fileUri = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + fileName;

    await FileSystem.writeAsStringAsync(fileUri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Protein Tracker Data',
        UTI: 'org.openxmlformats.spreadsheetml.sheet',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error exporting XLSX:', error);
    throw error;
  }
}
