/* global it expect jest */
import 'react-native';

// import Constants from '../constants';

import AppManager from '../AppManager';
import Realm from './_realm';
import Constants from '../constants';
import { Application } from '@mongrov/config';

// const AppSchema = {
//   name: Constants.App,
//   primaryKey: '_id',
//   properties: {
//     _id: { type: 'int', default: 0 },
//     host: { type: 'string', optional: true },
//     lastSync: { type: 'date', optional: true },
//     userId: { type: 'string', optional: true },
//     settings: { type: 'list', objectType: Constants.Setting },
//     login: { type: Constants.Login, optional: true },
//     errors: { type: 'list', objectType: Constants.Errors },
//     isServiceConnected: { type: 'bool', default: false },
//     isNetworkConnected: { type: 'bool', default: false },
//   },
// };
// // var App  ={
// //   schema :AppSchema
// // }

var provider = {};

const AppUtil = require('../../../utils/index');

const realmObj = Realm;
const { JOB_LOGIN } = Application.JOBNAME;

class AppTaskManager {
  constructor() {
    console.log('APP TASK MANAGER');
  }

  initTaskHandler() {
    return true;
  }

  connect() {
    return true;
  }

  doUserSubscription() {
    return true;
  }

  doLoginJob() {
    // appManager.setUserId('swami8223');
  }

  doLogoutJob() {
    return true;
  }

  doRegisterUser() {}

  fetchSettingsJob() {
    return true;
  }

  reconnect = jest.fn(() => {});
}
const appTaskManager = new AppTaskManager();
// var handler = new AppTaskHandler();
class TaskManager {
  initDBManager() {
    this.app = appTaskManager;
  }
}

const taskManager = new TaskManager();
const appManager = new AppManager(realmObj, taskManager);
taskManager.provider = provider;
taskManager.initDBManager();

const host = 'corp.mongrov.com';
const settings = [
  { _id: 'globalTImeZone', value: true },
  { _id: 'isDateAvail', value: "{'id':'global'}" },
];
const nullSettings = null;
const hostSecond = 'ems.mongrov.com';
const userName = 'swami';
const password = 'swami#4041$';
const userID = 'swami8223';
const listner = jest.fn();
const connectionCode = 500;

const createGuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

// without the db
describe('tests without db', () => {
  const appManagerWithoutRealm = new AppManager();

  it('appManager getSettingsValue method throws an error', () => {
    try {
      appManagerWithoutRealm.getSettingsValue(settings[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('groupManager setServiceStatus method throws an error', () => {
    try {
      appManagerWithoutRealm.setServiceStatus(settings[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('groupManager setServiceStatus method throws an error', () => {
    try {
      appManagerWithoutRealm.setLastSyncOffline(settings[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
});

it('get realmObj', () => {
  var { realm } = appManager;
  expect(realm).toEqual(expect.anything());
});

// it('get userId', () => {
//   var { userId } = appManager;
//   expect(userId).toBe(null);
// });

it('set server host', () => {
  appManager.host = host;
  expect(appManager.app.host).not.toBeNull();
});

it('set server host if host already exisit', () => {
  appManager.host = host;
  appManager.host = hostSecond;
  expect([appManager.app]).toHaveLength(1);
});

it('set server host', () => {
  appManager.reconnectHost();
  expect(appTaskManager.reconnect.mock.calls.length).toBe(1);
});

it('call service connected', () => {
  appManager.setServiceStatus(true);

  // expect(handler.fetchSettingsJob).toHaveBeenCalled();
});

it('call service disconnected', () => {
  appManager.setServiceStatus(false);
});

it('set settings host', () => {
  appManager.settings = settings;
  expect(appManager.app.settings).toHaveLength(settings.length);
  appManager.settings = settings;
  expect(appManager.app.settings).toHaveLength(settings.length);
  appManager.settings = nullSettings;
});

it('set login', () => {
  appManager.login(userName, password);
  expect(appManager.app.login.userName).toBe(userName);
  expect(appManager.app.login.userPwd).toBe(password);
});

it('set userID', () => {
  appManager.setUserId(userID);
  expect(appManager.userId).toBe(userID);
});

it('log error', async () => {
  const errObj = {
    _id: createGuid(),
    desc: 'Connect Failed',
    code: '301',
    action: 'LOGIN',
  };
  await appManager.logError(errObj);
  const errorArray = appManager.app.errors.length - 1;
  await expect(appManager.app.errors[errorArray].desc).toBe(errObj.desc);
  await expect(appManager.app.errors[errorArray].code).toBe(errObj.code);
});
it('multi log error', async () => {
  const errObjLogin = {
    _id: createGuid(),
    desc: 'login  Failed',
    code: '305',
    action: 'LOGIN',
  };
  const errorArray = appManager.app.errors.length - 1;
  await appManager.logError(errObjLogin);
  // console.log('ERRORS ====', appManager.app.errors);
  await expect(appManager.app.errors[errorArray].desc).toBe(errObjLogin.desc);
  await expect(appManager.app.errors[errorArray].code).toBe(errObjLogin.code);
});

it('second log error', async () => {
  const errObjChat = {
    _id: createGuid(),
    desc: 'chat pull failed',
    code: '305',
    action: 'CHAT',
  };
  await appManager.logError(errObjChat);
  const errorArray = appManager.app.errors.length - 1;
  await expect(appManager.app.errors[errorArray].desc).toBe(errObjChat.desc);
  await expect(appManager.app.errors[errorArray].code).toBe(errObjChat.code);
});

it('remove log error', async () => {
  await appManager.removeError('CHAT');
  const withLoginError = realmObj.objects(Constants.Errors).filtered(`action == "CHAT"`);
  expect(withLoginError.length).toBe(0);
});

it('set appstate', () => {
  appManager.appState = true;
  expect(appManager.appState).toBe(true);
});

it('set service status', () => {
  appManager.setServiceStatus(true);
  expect(appManager.app.isServiceConnected).toBe(true);
  appManager.setServiceStatus(false);
  expect(appManager.app.isServiceConnected).toBe(false);
});

it('sets network status', () => {
  appManager.setNetworkStatus(true);
  expect(appManager.app.isNetworkConnected).toBe(true);
});

it('sets resetPassword', async () => {
  appManager._taskManger.app.resetPassword = jest.fn(() => {});
  appManager.resetPassword('ghyju');

  expect(appManager._taskManger.app.resetPassword.mock.calls.length).toBe(1);
});
it('sets resetPassword', async () => {
  appManager._taskManger.app.resetPassword = jest.fn(() => {});
  appManager.resetPassword('');
  expect(appManager._taskManger.app.resetPassword.mock.calls.length).toBe(0);
});

it('sets registerUser', async () => {
  appManager._taskManger.app.doregisterUser = jest.fn(() => {});
  appManager.registerUser(0);
  // expect(appManager.app.isServiceConnected).toBe(false);
  expect(appManager._taskManger.app.doregisterUser.mock.calls.length).toBe(0);
});

it('sets setLastSyncOffline', async () => {
  await appManager.setServiceStatus(true);
  appManager.setLastSyncOffline(false);
  expect(appManager.app.isServiceConnected).toBe(false);
});

it('sets network status', () => {
  const nowDate = new Date();
  AppUtil.getCurrentRealmDate = jest.fn(() => nowDate);
  appManager.setLastSyncOnMessage(true);
  expect(appManager.app.lastSync.toString()).toBe(nowDate.toString());
});

it('sets network status', () => {
  // const tvalueExpect = {"_id": "isDateAvail", "value": "{'id':'global'}"}
  const settingsValue = appManager.getSettingsValue('isDateAvail');
  expect(settingsValue._id).toBe('isDateAvail');
});

it('addAppListener with listner ', () => {
  appManager.addAppListener(listner);
  appManager.host = host;
  expect(listner).toHaveBeenCalled();
});

it('set disclaimer', () => {
  appManager.disclaimer = true;
  expect(appManager.disclaimer).toBe(true);
});
// else
it('set disclaimer', () => {
  appManager.disclaimer = null;
  expect(appManager.disclaimer).toBeNull();
});

it('set isIntro', () => {
  appManager.isIntro = true;
  expect(appManager.isIntro).toBe(true);
});
// else
it('set isIntro', () => {
  appManager.isIntro = null;
  expect(appManager.isIntro).toBeNull();
});

it('set isCertIntro', () => {
  appManager.isCertIntro = true;
  expect(appManager.isCertIntro).toBe(true);
});
// else
it('set isCertIntro', () => {
  appManager.isCertIntro = null;
  expect(appManager.isCertIntro).toBeNull();
});

it('set token', () => {
  appManager.setUserId(userID);
  appManager.setToken('Kujihj');
  expect(appManager.token).toBe('Kujihj');
});

it('set token', () => {
  appManager.setUserId(userID);
  appManager.setToken(null);
  expect(appManager.token).toBeNull();
});
it('set userId token', () => {
  var { userId } = appManager;
  console.log('USER ID ', userId);
  appManager.setUserIdToken(userId, 'KujihjNH');
  expect(appManager.token).toBe('KujihjNH');
});

it('check log out', () => {
  appManager.logout();
  expect(appManager.userId).toBe(null);
});

it('addAppListener with null listner ', () => {
  expect(appManager.addAppListener(nullSettings));
});
it('remove app with listner ', () => {
  expect(appManager.removeAppListener(nullSettings));
});

it('set host on null', () => {
  appManager._realm.write(() => {
    appManager._realm.delete(appManager.app);
  });
  appManager.host = host;
  expect(listner).toHaveBeenCalled();
});

// THESE FUNCTION NEED TO BE LAST
it('addAppListener error ', () => {
  appManager._realm = null;
  appManager.addAppListener(listner);
});
it('remove app with listner ', () => {
  appManager.removeAppListener(listner);
});
it('set settings error', () => {
  appManager.settings = settings;
});
it('check log out without app', () => {
  try {
    appManager.app = null;
    appManager.logout();
  } catch (e) {
    expect(e).toEqual(expect.anything());
  }
});

it('check setLastSyncOnMessage without app', () => {
  try {
    appManager.app = null;
    appManager.setLastSyncOnMessage();
  } catch (e) {
    expect(e).toEqual(expect.anything());
  }
});
it('log error', () => {
  try {
    appManager.logError();
  } catch (e) {
    expect(e).toEqual(expect.anything());
  }
});

describe('tests without db', () => {
  it('check setNetworkStatus without app', () => {
    try {
      appManager.app = null;
      appManager._realm = jest.fn(() => {
        console.log('mock realm write');
      });
      appManager.setNetworkStatus();
    } catch (e) {
      expect(e).toEqual(expect.anything());
    }
  });
});
const insertAppManager = () => {
  console.log('INIT APP MANAGERS ==-=');
};

beforeAll(() => {
  insertAppManager();
});
afterAll(() => {
  // delete all groups
  // cleanDB();
  const db = realmObj;
  db.write(() => {
    db.deleteAll();
  });
  // close DB
  realmObj.close();
});
