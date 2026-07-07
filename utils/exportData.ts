import * as XLSX from 'xlsx';
import { Paths, File } from 'expo-file-system';
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

  const meals = Array.isArray(data.meals) ? data.meals : [];
  const dailyDataMap = data.dailyProteinData || {};
  const mealsByDate: { [date: string]: Meal[] } = {};

  meals.forEach((meal) => {
    if (!meal || !meal.date) {
      return;
    }
    if (!mealsByDate[meal.date]) {
      mealsByDate[meal.date] = [];
    }
    mealsByDate[meal.date].push(meal);
  });

  const dates = Object.keys(mealsByDate).sort();

  dates.forEach((date) => {
    const mealsForDay = mealsByDate[date];
    const mealsByTag: { [tag: string]: Meal[] } = {};

    mealsForDay.forEach((meal) => {
      const tag = (meal.tag || 'untagged').trim() || 'untagged';
      if (!mealsByTag[tag]) {
        mealsByTag[tag] = [];
      }
      mealsByTag[tag].push(meal);
    });

    Object.keys(mealsByTag).sort().forEach((tag) => {
      mealsByTag[tag]
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        .forEach((meal) => {
          const proteinPer100g = Number(meal.proteinPer100g) || 0;
          const gramsEaten = Number(meal.gramsEaten) || 0;
          const totalProtein = Number(meal.totalProtein) || 0;
          const timestamp = Number(meal.timestamp);

          formattedData.push({
            Date: date,
            Tag: tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase(),
            'Meal Name': meal.name || '',
            'Protein per 100g (g)': proteinPer100g.toFixed(2),
            'Grams Eaten': gramsEaten.toFixed(2),
            'Total Protein (g)': totalProtein.toFixed(2),
            Timestamp: Number.isFinite(timestamp) ? new Date(timestamp).toLocaleString() : '',
          });
        });
    });

    const dayTotal = mealsForDay.reduce((sum, meal) => sum + (Number(meal.totalProtein) || 0), 0);
    const dayTarget = Number(dailyDataMap[date]?.targetProtein);

    formattedData.push({
      Date: date,
      Tag: '--- DAILY SUMMARY ---',
      'Meal Name': '',
      'Protein per 100g (g)': '',
      'Grams Eaten': '',
      'Total Protein (g)': dayTotal.toFixed(2),
      Timestamp: Number.isFinite(dayTarget) ? `Target: ${dayTarget.toFixed(2)}g` : '',
    });

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
    if (Platform.OS === 'web') {
      if (typeof document === 'undefined' || typeof URL === 'undefined') {
        throw new Error('Web export is not available in this environment');
      }
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

    const file = new File(Paths.cache, fileName);
    await file.write(csv);

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(file.uri, {
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
    
    const fileName = generateExportFileName('xlsx');

    // Web fallback: create blob and trigger download
    if (Platform.OS === 'web') {
      if (typeof document === 'undefined' || typeof URL === 'undefined') {
        throw new Error('Web export is not available in this environment');
      }
      const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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

    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const file = new File(Paths.cache, fileName);
    await file.write(wbout, { encoding: 'base64' });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(file.uri, {
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
