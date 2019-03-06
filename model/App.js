/*
 * app related data structures
 */

import Constants from './constants';

const AppSchema = {
  name: Constants.App,
  primaryKey: '_id',
  properties: {
    _id: { type: 'int', default: 0 },
    host: { type: 'string', optional: true },
    lastSync: { type: 'date', optional: true },
    userId: { type: 'string', optional: true },
    token: { type: 'string', optional: true },
    settings: { type: 'list', objectType: Constants.Setting },
    login: { type: Constants.Login, optional: true },
    errors: { type: 'list', objectType: Constants.Errors },
    isServiceConnected: { type: 'bool', default: false },
    isNetworkConnected: { type: 'bool', default: false },
    isAppStateActive: { type: 'bool', default: true },
    isDisclaimer: { type: 'bool', default: false },
    isIntro: { type: 'bool', default: false },
    isCertIntro: { type: 'bool', default: false },
    subscriptions: 'string?[]',
  },
};

export default class App {}
App.schema = AppSchema;
