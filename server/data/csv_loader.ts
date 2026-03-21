import fs from 'fs';
import path from 'path';

export interface VillageCSV {
  village_id: string;
  village_name: string;
  state: string;
  district: string;
  population: number;
  households: number;
  livestock: number;
  main_crop: string;
  groundwater_level_initial: number;
}

export interface RainfallCSV {
  year: number;
  month: number;
  rainfall_mm: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');

export function loadVillageList(): VillageCSV[] {
  const filePath = path.join(DATA_DIR, 'villages.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      const val = values[index];
      if (['population', 'households', 'livestock', 'groundwater_level_initial'].includes(header)) {
        obj[header] = parseFloat(val);
      } else {
        obj[header] = val;
      }
    });
    return obj as VillageCSV;
  });
}

export function loadRainfallData(villageId: string): { avg_rainfall_mm: number; rainfall_category: string } {
  const filePath = path.join(DATA_DIR, `rainfall_${villageId}.csv`);
  if (!fs.existsSync(filePath)) {
    return { avg_rainfall_mm: 0, rainfall_category: 'Normal' };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const data: RainfallCSV[] = lines.slice(1).map(line => {
    const [year, month, rainfall_mm] = line.split(',').map(Number);
    return { year, month, rainfall_mm };
  });

  // Take last 12 months (or all if less)
  const last12 = data.slice(-12);
  const total = last12.reduce((sum, d) => sum + d.rainfall_mm, 0);
  const avg = total / last12.length;

  let category = 'Normal';
  if (avg < 50) category = 'Below normal'; // Adjusted thresholds for monthly avg
  else if (avg >= 150) category = 'Above normal';

  return {
    avg_rainfall_mm: Number(avg.toFixed(1)),
    rainfall_category: category
  };
}
