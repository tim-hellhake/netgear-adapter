'use strict';

const {Property} = require('gateway-addon');

class NetgearProperty extends Property {
  constructor(device, name, descr, value) {
    super(device, name, descr);
    this.setCachedValue(value);
  }
}

module.exports = NetgearProperty;
