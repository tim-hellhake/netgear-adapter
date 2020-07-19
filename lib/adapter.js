'use strict';

const {Adapter} = require('gateway-addon');
const manifest = require('../manifest.json');
const NetgearDevice = require('./device');
const NetgearRouter = require('netgear');

class NetgearAdapter extends Adapter {
  constructor(addonManager, config) {
    super(addonManager, manifest.id, manifest.id);
    addonManager.addAdapter(this);
    this.config = config;
    this.startPairing();
  }

  async startPairing() {
    const router = new NetgearRouter();

    try {
      await router.discover();
    } catch (e) {
      console.error('Failed to discover router:', e);
      return;
    }

    try {
      await router.login({password: this.config.password});
    } catch (e) {
      console.error('Failed to login:', e);
      return;
    }

    let id;
    try {
      const info = await router.getInfo();
      id = `netgear-${info.SerialNumber}`;
    } catch (e) {
      console.error('Failed to get device info:', e);
      return;
    }

    try {
      await router.logout();
    } catch (e) {
      console.error('Failed to logout:', e);
      // pass
    }

    if (!this.devices.hasOwnProperty(id)) {
      const dev = new NetgearDevice(this, id, router, this.config.password);

      dev.promise.then(() => {
        this.handleDeviceAdded(dev);
      }).catch((e) => {
        console.error('Failed to create device:', e);
      });
    }
  }

  removeThing(device) {
    if (this.devices.hasOwnProperty(device.id)) {
      device.unload();
      this.handleDeviceRemoved(device);
    }

    return Promise.resolve(device);
  }
}

module.exports = NetgearAdapter;
