import dayjs from 'dayjs';
import path from 'path';
import { promises as sensor } from 'node-dht-sensor';
import fs from 'fs/promises';
import { Config } from './structures/Config';
import { Sheets } from './structures/Sheets';

/**
 * Read connected DHT22 pin
 * @param pinNumber DHT22 pin
 */
export const readPin = async (pinNumber: number): Promise<{ temperature: number, humidity: number }> => {
  try {
    const result = await sensor.read(22, pinNumber);
    return result;
  } catch(err) {
    throw new Error(`Failed to read from DHT22: ${err}`);
  }
}

/**
 * Log readed temperature and humidity to console
 * @param timeStamp Format: YYYY-MM-DDTHH:mm:SS
 * @param temperature Readed temperature
 * @param humidity Readed humidity
 */
export const logData = (timeStamp: string, temperature: number, humidity: number): void => {
  console.log(`${timeStamp} info: Temperature: ${temperature}℃ Humidity: ${humidity}%`);
}

/**
 * Log error details to console
 */
export const logError = (content: string): void => {
  console.error(`${getTimeStamp()} error: ${content}`);
}

/**
 * Record readed temperature and humidity to CSV file
 * @param timeStamp Format: YYYY-MM-DDTHH:mm:SS
 * @param temperature Readed temperature
 * @param humidity Readed humidity
 * @param fileName CSV file name
 */
export const recordDataToCSV = async (timeStamp: string, temperature: number, humidity: number, fileName: string): Promise<void> => {
  const text = `${timeStamp},${temperature},${humidity}\n`;
  await fs.appendFile(fileName, text);
}

/**
 * Get TimeStamp (YYYY-MM-DDTHH:mm:ssZ)
 */
export const getTimeStamp = (): string => {
  return dayjs().format('YYYY-MM-DDTHH:mm:ssZ');
}

/**
 * Get this month record file path
 * @returns Format: {saveDirectory}/temp-watchdog_YYYY-MM_records.csv
 */
export const getThisMonthFilePath = (saveDirectory: string, fileNameFormat: string): string => {
  return path.join(saveDirectory, `temp-watchdog_${dayjs().format(fileNameFormat)}_records.csv`);
}

/**
 * Initialize system
 */
export const init = async (config: Config): Promise<Sheets | undefined> => {
  // CSV save settings
  if(config.csv?.enable) {
    // Make save directory when not it maked
    if(typeof config.csv.saveDirectory === 'undefined') {
      throw new Error('CSV save directory not specified in configuration.');
    }
    try {
      await fs.stat(config.csv.saveDirectory);
    } catch(err) {
      // If error code is ENOENT, make directory
      if(err.code === 'ENOENT') {
        await fs.mkdir(config.csv.saveDirectory);
      } else {
        throw new Error(`An unknown error occurred: ${err.stack}`);
      }
    }

    // Make this month file when it not maked
    // File format: temp-watchdog_{{ config.csv.fileNameFormat }}_records.csv
    if(typeof config.csv.fileNameFormat === 'undefined') {
      throw new Error('CSV file name format not specified in configuration.');
    }
    const thisMonthFilePath = getThisMonthFilePath(config.csv.saveDirectory, config.csv.fileNameFormat);
    try {
      await fs.stat(thisMonthFilePath);
    } catch(err) {
      // If error code is ENOENT, make directory
      if(err.code === 'ENOENT') {
        await fs.writeFile(thisMonthFilePath, 'timestamp,temp,humidity\n');
      } else {
        throw new Error(`An unknown error occurred: ${err.stack}`);
      }
    }
  }

  // Google Sheets save settings
  if(config.googleSheets?.enable) {
    if(typeof config.googleSheets.sheetId === 'undefined') {
      throw new Error('Google sheets sheetId not specified in configuration.');
    }
    const sheet = new Sheets(config.googleSheets.sheetId);

    // Prepare sheets
    if(typeof config.googleSheets.credentialsFile === 'undefined') {
      throw new Error('Google sheets credentialsFile not specified in configuration.');
    }
    if(typeof config.googleSheets.sheetTitleFormat === 'undefined') {
      throw new Error('Google sheets sheetTitleFormat not specified in configuration.');
    }

    const credentials = JSON.parse(await fs.readFile(config.googleSheets.credentialsFile, { encoding: 'utf-8' }));
    await sheet.prepare(credentials.client_email, credentials.private_key, config.googleSheets.sheetTitleFormat);
    return sheet;
  }
}

/**
 * Log and record temperature and humidity
 */
export const run = async (config: Config, sheets?: Sheets) => {
  const data = await readPin(config.pinNumber);
  const timeStamp = getTimeStamp();
  logData(timeStamp, data.temperature, data.humidity);

  if(config.csv?.enable) {
    if(typeof config.csv.saveDirectory !== 'undefined' && typeof config.csv.fileNameFormat !== 'undefined') {
      await recordDataToCSV(timeStamp, data.temperature, data.humidity, getThisMonthFilePath(config.csv.saveDirectory, config.csv.fileNameFormat));
    }
  }

  if(config.googleSheets?.enable) {
    if(typeof sheets !== 'undefined' && typeof config.googleSheets.sheetTitleFormat !== 'undefined') {
      await sheets.addRecord(timeStamp, data.temperature, data.humidity, config.googleSheets.sheetTitleFormat);
    }
  }
}
