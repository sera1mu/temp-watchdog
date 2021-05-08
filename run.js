const lib = require('./lib');

// Check specified records directory
if(typeof process.env.RECORDS_DIR !== 'string') {
  lib.logError('Please specify recording directory.');
  process.exit(1);
}

if(typeof process.env.PIN_NUMBER !== 'string') {
  lib.logError('Please specify DHT22 pin number.');
  process.exit(1);
}

(async() => {
  await lib.init();
  await lib.run();
})();