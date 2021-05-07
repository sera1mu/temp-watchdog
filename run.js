const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const sensor = require('node-dht-sensor').promises;

// Check specified records directory
if(typeof process.env.RECORDS_DIR !== 'string') {
  console.error('Please specify recording directory.');
  process.exit(1);
}

// Make specified directory when it not maked
try {
  fs.statSync(process.env.RECORDS_DIR);
} catch(err) {
  if(err.code === 'ENOENT') {
    fs.mkdirSync(process.env.RECORDS_DIR);
  } else {
    throw err;
  }
}

// Make this month file when it not maked
// File path: temp-watchdog_{{ YEAR AND MONTH(YYYY/MM) }}_records.csv
const thisMonthFilePath = path.join(process.env.RECORDS_DIR, `temp-watchdog_${dayjs().format('YYYY/MM')}_records.csv`);
try {
  fs.statSync(thisMonthFilePath);
} catch(err) {
  if(err.code === 'ENOENT') {
    // CSV Format: datetime(YYYY/MM/DDTHH:mm:SS),temp(℃),humidity(%)
    fs.writeFileSync(thisMonthFilePath, 'datetime,temp,humidity\n');
  } else {
    throw err;
  }
}

// Get data from sensor
const result = await sensor.read(22, 4);
const date = dayjs().format('YYYY/MM/DDTHH:mm:ss');

// Logging information
console.log(`${date} : Temperature: ${result.temperature}℃, Humidity: ${result.humidity}%`);

// Append file
fs.appendFileSync(thisMonthFilePath, `${date},${result.temperature},${result.humidity}\n`);
