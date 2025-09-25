import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface HolidayExcelRow {
  title: string;
  date: string;
  description?: string;
  is_active?: boolean;
}

export const parseExcelFile = (file: File): Promise<HolidayExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        console.log('File loaded, parsing Excel...');
        
        // Use array buffer for better compatibility
        const workbook = XLSX.read(data, { type: 'array' });
        console.log('Workbook sheets:', workbook.SheetNames);
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with proper header handling
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '', // Default value for empty cells
          raw: false  // Don't use raw values, format them
        });
        
        console.log('Raw Excel data:', jsonData);
        
        // Skip header row and process data
        const [, ...rows] = jsonData as any[][];
        console.log('Data rows (excluding header):', rows);
        
        const holidays: HolidayExcelRow[] = rows
          .filter(row => {
            // More flexible filtering - check if row has any content
            const hasContent = row.some(cell => cell && String(cell).trim() !== '');
            const hasTitle = row[0] && String(row[0]).trim() !== '';
            const hasDate = row[1] && String(row[1]).trim() !== '';
            return hasContent && hasTitle && hasDate;
          })
          .map((row, index) => {
            console.log(`Processing row ${index + 2}:`, row);
            try {
              return {
                title: String(row[0] || '').trim(),
                date: formatDateForExcel(row[1]),
                description: row[2] ? String(row[2]).trim() : undefined,
                is_active: row[3] !== undefined ? parseBooleanValue(row[3]) : true,
              };
            } catch (error) {
              console.error(`Error processing row ${index + 2}:`, error);
              throw new Error(`Row ${index + 2}: ${error.message}`);
            }
          });
        
        console.log('Parsed holidays:', holidays);
        resolve(holidays);
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      console.error('File reading error');
      reject(new Error('Failed to read file'));
    };
    
    // Use readAsArrayBuffer for better compatibility
    reader.readAsArrayBuffer(file);
  });
};

export const exportHolidaysToExcel = (holidays: HolidayExcelRow[], filename = 'holidays.xlsx') => {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  
  // Prepare data with headers
  const data = [
    ['Title', 'Date', 'Description', 'Is Active'],
    ...holidays.map(holiday => [
      holiday.title,
      holiday.date,
      holiday.description || '',
      holiday.is_active ? 'Yes' : 'No'
    ])
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 20 }, // Title
    { width: 15 }, // Date
    { width: 30 }, // Description
    { width: 10 }  // Is Active
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Holidays');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Download file
  saveAs(blob, filename);
};

export const downloadExcelTemplate = () => {
  const templateData = [
    ['Title', 'Date', 'Description', 'Is Active'],
    ['New Year\'s Day', '2024-01-01', 'New Year celebration', 'Yes'],
    ['Independence Day', '2024-08-15', 'National holiday', 'Yes'],
    ['Diwali', '2024-11-01', 'Festival of lights', 'Yes']
  ];
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 20 }, // Title
    { width: 15 }, // Date
    { width: 30 }, // Description
    { width: 10 }  // Is Active
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Holidays Template');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(blob, 'holidays_template.xlsx');
};

const parseBooleanValue = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1' || lowerValue === 'active';
  }
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
};

const formatDateForExcel = (dateValue: any): string => {
  if (!dateValue) return '';
  
  console.log('Formatting date:', dateValue, 'Type:', typeof dateValue);
  
  // Handle different date formats
  if (typeof dateValue === 'number') {
    // Excel serial date (days since 1900-01-01)
    if (dateValue > 25569) { // After 1970
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    } else {
      // Excel date before 1970
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
  }
  
  if (typeof dateValue === 'string') {
    // Try to parse the string
    const trimmedValue = dateValue.trim();
    
    // Handle common date formats with more comprehensive parsing
    const dateFormats = [
      // ISO formats
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // YYYY-MM-DDTHH:MM:SS
      
      // US formats
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{1,2}-\d{1,2}-\d{4}$/, // M-D-YYYY
      
      // European formats
      /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // D/M/YYYY
      /^\d{2}\.\d{2}\.\d{4}$/, // DD.MM.YYYY
      /^\d{1,2}\.\d{1,2}\.\d{4}$/, // D.M.YYYY
      
      // Other formats
      /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
      /^\d{4}\.\d{2}\.\d{2}$/, // YYYY.MM.DD
    ];
    
    for (const format of dateFormats) {
      if (format.test(trimmedValue)) {
        try {
          const date = new Date(trimmedValue);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // Try parsing with different separators
    const separators = ['-', '/', '.', ' '];
    for (const sep of separators) {
      const parts = trimmedValue.split(sep);
      if (parts.length === 3) {
        try {
          // Try different order combinations
          const combinations = [
            [parts[0], parts[1], parts[2]], // Original order
            [parts[2], parts[0], parts[1]], // YYYY-MM-DD
            [parts[2], parts[1], parts[0]], // YYYY-DD-MM
          ];
          
          for (const combo of combinations) {
            const dateStr = `${combo[0]}-${combo[1].padStart(2, '0')}-${combo[2].padStart(2, '0')}`;
            const date = new Date(dateStr);
            if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
              return date.toISOString().split('T')[0];
            }
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // Try direct parsing as last resort
    try {
      const date = new Date(trimmedValue);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Ignore
    }
  }
  
  // If it's a Date object
  if (dateValue instanceof Date) {
    if (!isNaN(dateValue.getTime())) {
      return dateValue.toISOString().split('T')[0];
    }
  }
  
  console.warn('Could not parse date:', dateValue);
  throw new Error(`Invalid date format: ${dateValue}. Please use YYYY-MM-DD format.`);
};
