import dayjs from 'dayjs';
import path from 'path';
import { promises as sensor } from 'node-dht-sensor';
import fs from 'fs/promises';

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
export const recordDataToCSV = async (timeStamp: string, temperature: number, humidity: number, fileName: string) => {
  const text = `${timeStamp},${temperature},${humidity}\n`;
  await fs.appendFile(fileName, text);
}

/**
 * Get TimeStamp (YYYY-MM-DDTHH:mm:SS)
 */
export const getTimeStamp = (): string => {
  return dayjs().format('YYYY-MM-DDTHH:mm:ss');
}

/**
 * Get this month record file path
 * @returns { string } Format: temp-watchdog_YYYY-MM_records.csv
 */
export const getThisMonthFilePath = () => {
  return path.join(process.env.RECORDS_DIR, `temp-watchdog_${dayjs().format('YYYY-MM')}_records.csv`);
}

/**
 * Initialize system
 */
export const init = async () => {
  // Make specified directory when it not maked
  try {
    await fs.stat(process.env.RECORDS_DIR);
  } catch(err) {
    if(err.code === 'ENOENT') {
      await fs.mkdir(process.env.RECORDS_DIR);
    } else {
      throw err;
    }
  }

  // Make this month file when it not maked
  // File path: temp-watchdog_{{ YEAR AND MONTH(YYYY-MM) }}_records.csv
  const thisMonthFilePath = getThisMonthFilePath();
  try {
    await fs.stat(thisMonthFilePath);
  } catch(err) {
    if(err.code === 'ENOENT') {
      // CSV Format: datetime(YYYY/MM/DDTHH:mm:SS),temp(℃),humidity(%)
      await fs.writeFile(thisMonthFilePath, 'datetime,temp,humidity\n');
    } else {
      throw err;
    }
  }
}

export const run = async () => {
  const data = await readPin(Number(process.env.PIN_NUMBER));
  const timeStamp = getTimeStamp();
  logData(timeStamp, data.temperature, data.humidity);
  await recordDataToCSV(timeStamp, data.temperature, data.humidity, getThisMonthFilePath());
}
