import 'react-native';
import queueFactory from 'react-native-queue';
// import Realm from 'realm';
// import RC from '@rc';
// import App from '../../model/App';
// import Setting from '../../model/Setting';
// import Errors from '../../model/Errors';
// import Login from '../../model/Login';
// import Group from '../../model/Group';
// import Message from '../../model/Message';
// import User from '../../model/User';

import AppTaskManager from '../AppTaskManager';
/* eslint-disable-next-line */
import PushService from '../../../push/PushService';

// import AppService from '../AppService';
// const mockRegister = jest.fn();
jest.mock('../../../push/PushService', () => ({
  register: () => 'Hello',
}));

const RC = {};

class TaskManager {
  constructor() {
    this.provider = RC;
    this.initQueue();
  }

  async initQueue() {
    this.queue = await queueFactory();
  }

  createJob = (jobName, arg, retryCount = 1, priority = 5, timeout = 2000) => {
    if (!this.queue) {
      this.initQueue();
    }

    this.queue.createJob(jobName, arg, {
      priority,
      timeout,
      retryCount,
    });
  };
}

class UserManager {}

class AppManager {
  constructor() {
    console.log('APP INITIALIZES');
  }

  set settings(settings) {
    this.settings = settings;
  }

  setUserId() {
    return true;
  }

  setServiceStatus() {
    return true;
  }

  logError() {
    return true;
  }
}

class DBManager {
  constructor() {
    this.app = new AppManager();
  }
}

let appTaskHandler;
let nullAppTaskHandler;

const nullObj = null;

// const SETTINGSJOBNAME = 'Settings';
// const LOGINJOBNAME = 'Login';
// const CONNECTJOBNAME = 'Connection';
// const MODULE = 'TaskHandler';
// const LOGOUTJOBNAME = 'logout';
// const USERSUBSCRIPTIONS = 'subscriptions';
const settings = [
  { _id: 'globalTImeZone', value: true },
  { _id: 'isDateAvail', value: "{'id':'global'}" },
];

// const AppSchema = {
//   schema: [App, Setting, Errors, Login, Group, Message, User],
//   schemaVersion: 3,
//   migration: () => {},
// };

describe(' test after intializing', () => {
  beforeAll(async () => {
    const taskManager = new TaskManager();
    const dbManager = new DBManager();
    await taskManager.initQueue();
    const userManager = new UserManager();
    dbManager.user = userManager;
    appTaskHandler = new AppTaskManager(taskManager, dbManager);
    nullAppTaskHandler = new AppTaskManager(nullObj);
  });

  // var _appRealm = new Realm(AppSchema);

  it('app task handler constructor with null provoider', () => {
    expect(nullAppTaskHandler._taskManager).toBe(null || undefined);
    expect(nullAppTaskHandler._dbManager).toBe(null || undefined);
  });

  it('app task handler constructor with provoider', () => {
    expect(appTaskHandler._taskManager).not.toBe(null || undefined);
    expect(appTaskHandler._dbManager).not.toBe(null || undefined);
    // expect(appTaskHandler.initTaskManager).toHaveBeenCalled();
  });

  it('monitorChangeInConnection called', async () => {
    appTaskHandler._taskManager.provider.monitorServiceConnection = jest.fn(() => {
      throw new Error('error');
    });
    appTaskHandler._dbManager.app.setServiceStatus = jest.fn();
    expect.assertions(2);
    await appTaskHandler._montiorChangeInConnection();
    expect(appTaskHandler._taskManager.provider.monitorServiceConnection).toHaveBeenCalled();
    expect(appTaskHandler._dbManager.app.setServiceStatus).not.toHaveBeenCalled();
  });

  it('monitorChangeInConnection called', async () => {
    appTaskHandler._taskManager.provider.monitorServiceConnection = jest.fn((callback) => {
      callback(true);
    });
    appTaskHandler._dbManager.app.setServiceStatus = jest.fn();
    // await appTaskHandler._montiorChangeInConnection.mockClear();
    // appTaskHandler.sample = jest.fn();
    await appTaskHandler._montiorChangeInConnection();
    expect(appTaskHandler._taskManager.provider.monitorServiceConnection).toHaveBeenCalled();
    expect(appTaskHandler._dbManager.app.setServiceStatus).toHaveBeenCalled();
  });

  it('check resetPasswordCallback', async () => {
    appTaskHandler._dbManager.app.logError = jest.fn();
    appTaskHandler.resetPasswordUiCallBack = jest.fn();
    const errObj = {
      desc: '',
      code: '418',
      action: 'ResetPassword' || 'false',
    };
    await appTaskHandler.resetPasswordCallback(errObj);
    expect(appTaskHandler.resetPasswordUiCallBack).toHaveBeenCalled();
    // expect(appTaskHandler._montiorChangeInConnection).toHaveBeenCalled();
  });

  it('check resetPasswordCallback', async () => {
    appTaskHandler._dbManager.app.logError = jest.fn();
    appTaskHandler.resetPasswordUiCallBack = jest.fn();
    await appTaskHandler.resetPasswordCallback(null);
    expect(appTaskHandler.resetPasswordUiCallBack).toHaveBeenCalled();
    // expect(appTaskHandler._montiorChangeInConnection).toHaveBeenCalled();
  });

  it('register user', async () => {
    appTaskHandler._dbManager.app.removeError = jest.fn();
    appTaskHandler._taskManager.provider.registerUser = jest.fn();
    // appTaskHandler._montiorChangeInConnection = jest.fn();
    await appTaskHandler.doRegisterUser();
    expect(appTaskHandler._taskManager.provider.registerUser).toHaveBeenCalled();
    // expect(appTaskHandler._montiorChangeInConnection).toHaveBeenCalled();
  });

  it('register & login user', async () => {
    appTaskHandler._dbManager.app.removeError = jest.fn();
    appTaskHandler._dbManager.app.login = jest.fn();
    appTaskHandler._taskManager.provider.registerUser = jest.fn(() => Promise.resolve(true));
    expect.assertions(1);
    await appTaskHandler.doRegisterUser();
    expect(appTaskHandler._taskManager.provider.registerUser).toHaveBeenCalled();
    // expect(appTaskHandler._dbManager.app.login).toHaveBeenCalled();
  });

  it('check reconnect', async () => {
    appTaskHandler._taskManager.provider.reconnectMeteor = jest.fn();
    // appTaskHandler._montiorChangeInConnection = jest.fn();
    await appTaskHandler.reconnect();
    expect(appTaskHandler._taskManager.provider.reconnectMeteor).toHaveBeenCalled();
    // expect(appTaskHandler._montiorChangeInConnection).toHaveBeenCalled();
  });

  it('fails to reconnect', async () => {
    appTaskHandler._taskManager.provider.reconnectMeteor = jest.fn(() => Promise.reject());
    expect.assertions(1);
    await appTaskHandler.reconnect();
    expect(appTaskHandler._taskManager.provider.reconnectMeteor).toHaveBeenCalled();
  });

  it('check resetPassword', async () => {
    appTaskHandler._userManager.loggedInUser = { requirePasswordChange: true };
    appTaskHandler._taskManager.provider.setUserPassword = jest.fn();
    // appTaskHandler._montiorChangeInConnection = jest.fn();
    const callback = jest.fn((returnValue) => returnValue);
    await appTaskHandler.resetPassword('newPass', callback);
    expect(appTaskHandler._taskManager.provider.setUserPassword).toHaveBeenCalled();
    // expect(appTaskHandler._montiorChangeInConnection).toHaveBeenCalled();
  });

  it('resetPassword throws error', async () => {
    appTaskHandler._userManager.loggedInUser = { requirePasswordChange: true };
    appTaskHandler._taskManager.provider.setUserPassword = jest.fn(() => Promise.reject());
    const callback = jest.fn((returnValue) => returnValue);
    expect.assertions(1);
    await appTaskHandler.resetPassword('newPass', callback);
    expect(appTaskHandler._taskManager.provider.setUserPassword).toHaveBeenCalled();
  });

  it('does not resetPassword', async () => {
    appTaskHandler._userManager.loggedInUser = { requirePasswordChange: true };
    appTaskHandler._taskManager.provider.setUserPassword = jest.fn();
    // appTaskHandler._montiorChangeInConnection = jest.fn();
    const callback = jest.fn((returnValue) => returnValue);
    expect.assertions(1);
    await appTaskHandler.resetPassword('', callback);
    expect(appTaskHandler._taskManager.provider.setUserPassword).not.toHaveBeenCalled();
  });

  it('check connection', async () => {
    appTaskHandler._taskManager.provider.initMeteor = jest.fn();
    appTaskHandler._montiorChangeInConnection = jest.fn();
    await appTaskHandler.connect('corp.mongrov.com');
    expect(appTaskHandler._taskManager.provider.initMeteor).toHaveBeenCalled();
    expect(appTaskHandler._montiorChangeInConnection).toHaveBeenCalled();
  });

  it('fails to connect with provider', async () => {
    appTaskHandler._taskManager.provider.initMeteor = jest.fn(() => Promise.reject());
    appTaskHandler._montiorChangeInConnection = jest.fn();
    await appTaskHandler.connect('corp.mongrov.com');
    expect.assertions(2);
    expect(appTaskHandler._taskManager.provider.initMeteor).toHaveBeenCalled();
    expect(appTaskHandler._montiorChangeInConnection).not.toHaveBeenCalled();
  });

  it('do login job', () => {
    appTaskHandler._taskManager.provider.loginWithEmailAndPassword = jest.fn(() => {
      const loginPromise = new Promise((resolve) => {
        resolve(true);
      });
      return loginPromise;
    });
    appTaskHandler._taskManager.provider.userId = jest.fn();
    appTaskHandler._taskManager.provider.token = jest.fn();
    appTaskHandler._dbManager.app.removeError = jest.fn(() => true);
    appTaskHandler._dbManager.app.setUserIdToken = jest.fn();
    expect.assertions(1);
    appTaskHandler.doLoginJob();
    expect(appTaskHandler._taskManager.provider.loginWithEmailAndPassword).toHaveBeenCalled();
  });

  it('error in login job', () => {
    appTaskHandler._taskManager.provider.loginWithEmailAndPassword = jest.fn(() =>
      Promise.reject(),
    );
    appTaskHandler._taskManager.provider.userId = jest.fn();
    appTaskHandler._taskManager.provider.token = jest.fn();
    appTaskHandler._dbManager.app.removeError = jest.fn(() => true);
    appTaskHandler._dbManager.app.setUserIdToken = jest.fn();
    expect.assertions(1);
    appTaskHandler.doLoginJob();
    expect(appTaskHandler._taskManager.provider.loginWithEmailAndPassword).toHaveBeenCalled();
  });

  it('do fetchSettingsJob', () => {
    appTaskHandler._taskManager.provider.getPublicSettings = jest.fn(() =>
      Promise.resolve(settings),
    );
    appTaskHandler.fetchSettingsJob();
    expect(appTaskHandler._taskManager.provider.getPublicSettings).toHaveBeenCalled();
  });

  it('do LogoutJob', () => {
    appTaskHandler._taskManager.provider.logout = jest.fn(() => true);
    appTaskHandler.doLogoutJob();
    expect(appTaskHandler._taskManager.provider.logout).toHaveBeenCalled();
  });

  it('error in LogoutJob', () => {
    appTaskHandler._taskManager.provider.logout = jest.fn(() => {
      throw new Error('error');
    });
    appTaskHandler.doLogoutJob();
    expect(appTaskHandler._taskManager.provider.logout).toHaveBeenCalled();
  });

  it('call log error', async () => {
    appTaskHandler._dbManager.app.logError = jest.fn(() => true);

    appTaskHandler._logError('desc', 'action');
    expect(appTaskHandler._dbManager.app.logError).toHaveBeenCalled();
  });

  it('serviceListener with error', () => {
    appTaskHandler._taskManager.provider.monitorServiceConnection = jest.fn(() => {
      throw new Error('throw error');
    });
    try {
      appTaskHandler.monitorConnectionChange();
    } catch (e) {
      expect(e).toEqual(expect.anything());
    }
  });
});

// it('check connection', () => {
//   appTaskHandler._taskManager._provider.initMeteor = jest.fn();
//   appTaskHandler._service.serviceListener = jest.fn();
//   appTaskHandler.connect('corp.mongrov.com');
//   expect(appTaskHandler._provider.initMeteor).toHaveBeenCalled();
//   expect(appTaskHandler._service.serviceListener).toHaveBeenCalled();
// });

// it('do login job', () => {
//   appTaskHandler._provider.loginWithEmailAndPassword = jest.fn(() => {
//     const loginPromise = new Promise((resolve) => {
//       resolve(true);
//     });
//     return loginPromise;
//   });
//   appTaskHandler.doLoginJob();
//   expect(appTaskHandler._provider.loginWithEmailAndPassword).toHaveBeenCalled();
// });

// it('do connect', () => {
//   appTaskHandler._provider.loginWithEmailAndPassword = jest.fn(() => {
//     const loginPromise = new Promise((resolve) => {
//       resolve(true);
//     });
//     return loginPromise;
//   });
//   appTaskHandler._service.serviceListener = jest.fn();

//   appTaskHandler._appManager._appManagersetUserId = jest.fn(() => {
//     return true;
//   });

//   appTaskHandler.connect('corp.mongrov.com');
//   expect(appTaskHandler._provider.initMeteor).toHaveBeenCalled();
//   expect(appTaskHandler._service.serviceListener).toHaveBeenCalled();
// });

// it('do fetchSettingsJob', () => {
//   appTaskHandler._provider.getPublicSettings = jest.fn(() => {
//     return settings;
//   });
//   appTaskHandler.fetchSettingsJob();
//   expect(appTaskHandler._provider.getPublicSettings).toHaveBeenCalled();
// });

// it('do LogoutJob', () => {
//   appTaskHandler._provider.logout = jest.fn(() => {
//     return true;
//   });

//   appTaskHandler.doLogoutJob();
//   expect(appTaskHandler._provider.logout).toHaveBeenCalled();
// });
// it('call log error', async () => {
//   appTaskHandler._appManager.logError = jest.fn(() => true);

//   appTaskHandler._logError('desc', 'action');
//   expect(appTaskHandler._appManager.logError).toHaveBeenCalled();
// });

// it('do doUserSubscription while error', () => {
//   appTaskHandler._provider.initUserSubscriptions = jest.fn(() => {
//     console.log('APP TASK HANDLER CALLED');
//     throw new Error('Error on user sub');
//   });
//   appTaskHandler._logError = jest.fn(() => {
//     return false;
//   });
//   appTaskHandler.doUserSubscription('swami8223');
//   expect(appTaskHandler._logError).toHaveBeenCalled();
// });

// // it('createGuid', () => {
// //   expect(typeof appTaskHandler.createGuid()).toBe('string');
// // });

// it('create SETTINGSJOB', () => {
//   var arg = { userID: 'swami8223' };
//   var options = {
//     priority: 10,
//     timeout: 6000,
//     attempts: 2,
//   };
//   appTaskHandler.queue.createJob = jest.fn();
//   appTaskHandler.createJob(SETTINGSJOBNAME, arg);
//   expect(appTaskHandler.queue.createJob).toHaveBeenCalledWith(SETTINGSJOBNAME, arg, options);
// });

// it('create LOGINJOB', () => {
//   var arg = { userID: 'swami8223' };
//   var options = {
//     priority: 10,
//     timeout: 3000,
//     attempts: 1,
//   };
//   appTaskHandler.queue.createJob = jest.fn();
//   appTaskHandler.createJob(LOGINJOBNAME, arg);
//   expect(appTaskHandler.queue.createJob).toHaveBeenCalledWith(LOGINJOBNAME, arg, options);
// });

// it('createJob', () => {
//   var arg = { userID: 'swami8223' };
//   var options = {
//     priority: 10,
//     timeout: 1000,
//     attempts: 1,
//   };
//   appTaskHandler.queue.createJob = jest.fn();
//   appTaskHandler.createJob(LOGOUTJOBNAME, arg);
//   expect(appTaskHandler.queue.createJob).toHaveBeenCalledWith(LOGOUTJOBNAME, arg, options);
//   _appRealm.close();
// });
