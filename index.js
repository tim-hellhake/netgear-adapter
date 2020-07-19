'use strict';

const {Database} = require('gateway-addon');
const manifest = require('./manifest.json');
const NetgearAdapter = require('./lib/adapter');

module.exports = (addonManager, _, errorCallback) => {
  const db = new Database(manifest.id);
  db.open().then(() => {
    return db.loadConfig();
  }).then((config) => {
    if (!config.password) {
      errorCallback(manifest.id, 'Add-on must be configured before use');
      return;
    }

    new NetgearAdapter(addonManager, config);
  }).catch(console.error);
};
