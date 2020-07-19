'use strict';

const {Device} = require('gateway-addon');
const NetgearProperty = require('./property');

class NetgearDevice extends Device {
  constructor(adapter, id, router, password) {
    super(adapter, id);

    this.router = router;
    this.password = password;

    this.promise = router.login({password}).then(() => {
      return router.getCurrentSetting();
    }).then((setting) => {
      this.name = `Netgear ${setting.Model}`;

      this.properties.set(
        'internetConnected',
        new NetgearProperty(
          this,
          'internetConnected',
          {
            '@type': 'BooleanProperty',
            title: 'Internet Connected',
            type: 'boolean',
            readOnly: true,
          },
          setting.InternetConnectionStatus === 'Up'
        )
      );

      this.addAction(
        'reboot',
        {
          title: 'Reboot',
          description: 'Reboot the router',
        }
      );

      return router.logout();
    }).then(() => {
      this._pollSchedule = setTimeout(this.poll.bind(this), 30 * 1000);
    });
  }

  poll() {
    this.router.login({password: this.password}).then(() => {
      return this.router.getCurrentSetting();
    }).then((setting) => {
      this.properties.get('internetConnected').setCachedValueAndNotify(
        setting.InternetConnectionStatus === 'Up'
      );

      return this.router.logout();
    }).finally(() => {
      this._pollSchedule = setTimeout(this.poll.bind(this), 30 * 1000);
    });
  }

  unload() {
    if (this._pollSchedule) {
      clearTimeout(this._pollSchedule);
      this._pollSchedule = null;
    }
  }

  async performAction(action) {
    action.start();

    try {
      switch (action.name) {
        case 'reboot':
          await this.reboot();
          break;
      }
    } catch (e) {
      console.error(e);
      action.status = 'error';
      this.actionNotify(action);
      return;
    }

    action.finish();
  }

  reboot() {
    if (this._pollSchedule) {
      clearTimeout(this._pollSchedule);
      this._pollSchedule = null;
    }

    this.router.login({password: this.password}).then(() => {
      return this.router.reboot();
    }).then(() => {
      this._pollSchedule = setTimeout(this.poll.bind(this), 30 * 1000);
    });
  }
}

module.exports = NetgearDevice;
