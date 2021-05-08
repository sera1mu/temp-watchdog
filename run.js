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

lib.init()
  .then(() => {
    lib.run().catch((err) => {
      lib.logError(`Failed to run program: ${err.stack}`);
    });
  }).catch((err) => {
    lib.logError(`Failed to initialize: ${err.stack}`);
  });
