import * as XLSX from 'xlsx';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
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
 * Export data as CSV file
 */
export async function exportAsCSV(data: ExportData): Promise<void> {
  try {
    const formattedData = formatMealsForExport(data);
    
    if (formattedData.length === 0) {
      throw new Error('No data to export');
    }
    
    const csv = arrayToCSV(formattedData);
    const fileName = `protein_tracker_export_${new Date().toISOString().split('T')[0]}.csv`;
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
    
    // Write the workbook to array buffer
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    
    const fileName = `protein_tracker_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    const file = new File(Paths.cache, fileName);
    
    // Write as Uint8Array
    file.write(new Uint8Array(wbout));
    
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
