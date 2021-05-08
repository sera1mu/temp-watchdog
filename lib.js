const dayjs = require('dayjs');
const path = require('path');
const sensor = require('node-dht-sensor').promises;
const fs = require('fs/promises');

/**
 * Read connected DHT22 pin
 * @param { number } pinNumber DHT22 pin
 * @returns { { temperature: number, humidity: number }}
 */
const readPin = async (pinNumber) => {
  try {
    const result = await sensor.read(22, pinNumber);
    return result;
  } catch(err) {
    throw new Error(`Failed to read from DHT22: ${err}`);
  }
}

/**
 * Log readed temperature and humidity to console
 * @param { string } timeStamp Format: YYYY-MM-DDTHH:mm:SS
 * @param { number } temperature Readed temperature
 * @param { number } humidity Readed humidity
 */
const logData = (timeStamp, temperature, humidity) => {
  console.log(`${timeStamp} info: Temperature: ${temperature} Humidity: ${humidity}`);
}

/**
 * Log error details to console
 * @param { string } content
 */
const logError = (content) => {
  console.error(`${getTimeStamp()} error: ${content}`);
}

/**
 * Record readed temperature and humidity to CSV file
 * @param { string } timeStamp Format: YYYY-MM-DDTHH:mm:SS
 * @param { number } temperature Readed temperature
 * @param { number } humidity Readed humidity
 * @param { string } fileName CSV file name
 */
const recordDataToCSV = async (timeStamp, temperature, humidity, fileName) => {
  const text = `${timeStamp},${temperature},${humidity}`;
  await fs.appendFile(fileName, text);
}

/**
 * Get TimeStamp (YYYY-MM-DDTHH:mm:SS)
 * @returns { string }
 */
const getTimeStamp = () => {
  return dayjs().format('YYYY-MM-DDTHH:mm:SS');
}

/**
 * Initialize system
 */
const init = async () => {
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
  const thisMonthFilePath = path.join(process.env.RECORDS_DIR, `temp-watchdog_${dayjs().format('YYYY-MM')}_records.csv`);
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

const run = async () => {
  const data = readPin(process.env.PIN_NUMBER);
  const timeStamp = getTimeStamp();
  logData(timeStamp, data.temperature, data.humidity);
  await recordDataToCSV(timeStamp, data.temperature, data.humidity);
}

module.exports = {
  readPin,
  logData,
  logError,
  recordDataToCSV,
  getTimeStamp,
  init,
  run
}
