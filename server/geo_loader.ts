import fs from 'fs';
import path from 'path';
import { getCacheData, setCacheData } from './cache.ts';

const DATA_DIR = path.join(process.cwd(), 'data', 'geo');

export function loadGeoJSON(fileName: string) {
  const cacheKey = `geo_${fileName}`;
  const cached = getCacheData(cacheKey);
  if (cached) return cached;

  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  setCacheData(cacheKey, data);
  return data;
}
