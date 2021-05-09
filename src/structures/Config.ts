import { readFileSync } from 'fs'
import { parse } from 'toml';

export interface Config {
  pinNumber: number;
  intervalMs?: number;
  googleSheets?: {
    enable?: boolean;
    sheetTitleFormat?: string;
    sheetId?: string;
    credentialsFile?: string;
  };
  csv?: {
    enable?: boolean;
    saveDirectory?: string;
    fileNameFormat?: string;
  }
}

export const getConfig = (CONFIG_FILE: string): Config => {
  const config = parse(readFileSync(CONFIG_FILE, { encoding: 'utf-8' }));
  return config;
}
