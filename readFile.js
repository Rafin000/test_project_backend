import XLSX from 'xlsx';
import fs from 'fs';

const readRoutineDataFromExcelByBatch = () => {
  const batches = [18, 19, 20, 21, 22];
  const consolidatedData = {};

  try {
    batches.forEach(batch => {
      const filePath = `./${batch}_routineData.xlsx`;

      if (fs.existsSync(filePath)) {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const batchData = XLSX.utils.sheet_to_json(worksheet);

        consolidatedData[batch] = batchData;
      } else {
        console.warn(`File for batch ${batch} not found.`);
      }
    });
  } catch (error) {
    console.error('Error reading files:', error);
  }

  return consolidatedData;
};

export default readRoutineDataFromExcelByBatch;




// const routineDataFromExcel = readRoutineDataFromExcelByBatch();

// if (routineDataFromExcel) {
//   console.log('Routine data from Excel:', routineDataFromExcel);
// }
