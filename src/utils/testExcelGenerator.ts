import * as XLSX from 'xlsx';

// Function to create a test Excel file for debugging
export const createTestExcelFile = () => {
  const testData = [
    ['Title', 'Date', 'Description', 'Is Active'],
    ['Test Holiday 1', '2024-12-25', 'Christmas Day', 'Yes'],
    ['Test Holiday 2', '2024-01-01', 'New Year', 'Yes'],
    ['Test Holiday 3', '2024-07-04', 'Independence Day', 'No']
  ];
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(testData);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 20 }, // Title
    { width: 15 }, // Date
    { width: 30 }, // Description
    { width: 10 }  // Is Active
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Holidays');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  return blob;
};

// Function to log Excel file contents for debugging
export const debugExcelFile = (file: File) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'array' });
      
      console.log('=== EXCEL DEBUG INFO ===');
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
      console.log('Workbook sheets:', workbook.SheetNames);
      
      workbook.SheetNames.forEach((sheetName, index) => {
        console.log(`\n--- Sheet ${index + 1}: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        
        // Get sheet range
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        console.log('Sheet range:', worksheet['!ref']);
        console.log('Rows:', range.e.r + 1);
        console.log('Columns:', range.e.c + 1);
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false
        });
        
        console.log('Raw data:', jsonData);
        
        // Show cell values
        console.log('Cell values:');
        for (let row = range.s.r; row <= range.e.r; row++) {
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = worksheet[cellAddress];
            if (cell && cell.v !== undefined) {
              console.log(`${cellAddress}: "${cell.v}" (type: ${typeof cell.v})`);
            }
          }
        }
      });
      
      console.log('=== END DEBUG INFO ===');
    } catch (error) {
      console.error('Debug error:', error);
    }
  };
  
  reader.readAsArrayBuffer(file);
};

