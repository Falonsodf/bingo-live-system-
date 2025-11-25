import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

export const loadData = async (file) => {
  const filePath = resolve('backend/data', file);
  const data = await readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

export const saveData = async (file, content) => {
  const filePath = resolve('backend/data', file);
  await writeFile(filePath, JSON.stringify(content, null, 2));
};
