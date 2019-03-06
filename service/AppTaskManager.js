import AppUtil from '@mongrov/utils';
// import AppService from './AppService';
import {Config} from '@mongrov/config';
import Errors from '../../constants/errors';
import PushService from '../../push/PushService';
// import { Module } from 'module';
// import { Module } from 'module';

// const JOB_SETTINGS = 'Settings';
// const JOB_LOGIN = 'Login';
// const JOB_CONNECT = 'Connection';
// const JOB_LOGOUT = 'logout';

const MODULE = 'AppTaskManager';
const {
  JOB_SETTINGS,
  JOB_LOGIN,
  JOB_REGISTER,
  JOB_CONNECT,
  JOB_LOGOUT,
  JOB_USER_SUBSCRIPTIONS,
  JOB_RESET_PASSWORD,
  JOB_RECONNECT,
} = Config.JOBNAME;

export default class AppTaskManager {
  constructor(taskManager, dbManager) {
    // temp assigning RC here. It need to be passed
    if (taskManager && dbManager) {
      this._taskManager = taskManager;
      this._dbManager = dbManager;
      this._appManager = this._dbManager.app;
      this._userManager = this._dbManager.user;
      this.initTaskManager();
    }
  }

  /* Initiate Task Handler */
  initTaskManager = () => {
    //  this._service = new AppService();
    this._initConnectProviderWorker();
    this._initRegisterUserWorker();
    this._initAuthenticateUserWorker();
    this._initSettingsWorker();
    this._initLogoutWorker();
    // this._initUserSubscriptionWorker();
    this._initResetPassword();
    this._initReConnectProviderWorker();
  };

  // #region Worker Method(s)
  _initConnectProviderWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_CONNECT,
      async (jobId, host) => {
        try {
          Config.resetInstance(host);
          await this._taskManager.provider.initMeteor(host);
          this._montiorChangeInConnection(); // check is listner already present
        } catch (error) {
          this._logError(error.error, JOB_CONNECT, error.message);
          // this._logError(null, JOB_CONNECT, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          // this._logError(599, JOB_CONNECT);
        },
      },
    );
  };

  _initReConnectProviderWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_RECONNECT,
      async (jobId, host) => {
        try {
          Config.resetInstance(host);
          await this._taskManager.provider.reconnectMeteor(host);
        } catch (error) {
          this._logError(error.error, JOB_CONNECT, error.message);
          // this._logError(null, JOB_CONNECT, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          // this._logError(599, JOB_CONNECT);
        },
      },
    );
  };

  _initSettingsWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_SETTINGS,
      async () => {
        try {
          const settingsList = await this._taskManager.provider.getPublicSettings();
          this._dbManager.app.settings = settingsList;
          return settingsList;
        } catch (error) {
          this._logError(error.error, JOB_SETTINGS, error.message);
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          // this._logError(599, JOB_SETTINGS);
        },
      },
    );
  };

  _initRegisterUserWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_REGISTER,
      async (jobId, userDetails) => {
        try {
          const result = await this._taskManager.provider.registerUser(userDetails);
          if (result) {
            this._dbManager.app.login(userDetails.email, userDetails.pass);
          }
        } catch (error) {
          this._logError(error.error, JOB_REGISTER, error.message);
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          // this._logError(551, JOB_REGISTER);
        },
      },
    );
  };

  _initAuthenticateUserWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_LOGIN,
      async (jobId, userDetails) => {
        try {
          await this._taskManager.provider.loginWithEmailAndPassword(userDetails);
          PushService.register(this._taskManager.provider.userId);
          this._dbManager.app.setUserIdToken(
            this._taskManager.provider.userId,
            this._taskManager.provider.token,
          );
        } catch (error) {
          this._logError(error.error, JOB_LOGIN, error.reason);
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          // this._logError(599, JOB_LOGIN); // already logged so no need to log again
        },
      },
    );
  };

  _initLogoutWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_LOGOUT,
      async () => {
        try {
          this._taskManager.provider.logout();
        } catch (error) {
          this._logError(error.error, JOB_LOGOUT, error.message);
          // this._logError(null, JOB_LOGOUT, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          // this._logError(599, JOB_LOGOUT);
        },
      },
    );
  };

  // _initUserSubscriptionWorker = () => {
  //   this._taskManager.queue.addWorker(
  //     JOB_USER_SUBSCRIPTIONS,
  //     async (jobId, arg) => {
  //       try {
  //         const { userID } = arg;
  //         await this._taskManager.provider.initUserSubscriptions(this, userID);
  //       } catch (error) {
  //         this._logError(error.error, JOB_USER_SUBSCRIPTIONS, error.message);
  //         // this._logError(null, JOB_USER_SUBSCRIPTIONS, error.toString());
  //       }
  //     },
  //     {
  //       concurrency: 1,
  //       onFailed: () => {
  //         // this._logError(599, JOB_USER_SUBSCRIPTIONS);
  //       },
  //     },
  //   );
  // };
  // #endregion

  _initResetPassword = () => {
    this._taskManager.queue.addWorker(
      JOB_RESET_PASSWORD,
      async (jobId, password) => {
        try {
          const currentUser = {
            _id: this._userManager.loggedInUser._id,
            requirePasswordChange: true,
          };
          await this._taskManager.provider.setUserPassword(
            currentUser,
            password,
            this.resetPasswordCallback,
          );
        } catch (error) {
          this._logError(error.error, JOB_RESET_PASSWORD, error.message);
        }
      },
      {
        concurrency: 1,
        onFailed: () => {},
      },
    );
  };

  // #region Public Method(s)
  connect = (host) => {
    this._taskManager.createJob(JOB_CONNECT, host);
  };

  reconnect = (host) => {
    this._taskManager.createJob(JOB_RECONNECT, host, 1, 9);
  };

  doRegisterUser = (name, email, publicKey, password) => {
    this._dbManager.app.removeError(JOB_REGISTER);
    // TO-DO domain name should be from config
    // const emailTEMP = `${publicKey}@groov.one`;
    this._taskManager.createJob(
      JOB_REGISTER,
      { name, email, pass: password, dontSendWelcomeEmail: true },
      1,
      8,
      3000,
    );
  };

  doLoginJob = (uName, uPassword) => {
    this._dbManager.app.removeError(JOB_LOGIN);
    this._taskManager.createJob(JOB_LOGIN, { email: uName, password: uPassword }, 1, 7, 3000);
  };

  doLogoutJob = () => {
    this._taskManager.createJob(JOB_LOGOUT);
  };

  // doUserSubscription = (userid) => {
  //   this._taskManager.createJob(JOB_USER_SUBSCRIPTIONS, { userID: userid });
  // };

  fetchSettingsJob = () => {
    this._taskManager.createJob(JOB_SETTINGS, '', 2, 6, 6000);
  };

  resetPassword = (password, callback) => {
    this.resetPasswordUiCallBack = callback;
    if (password && callback) {
      this._taskManager.createJob(JOB_RESET_PASSWORD, password, 2, 6, 6000);
    }
  };

  _montiorChangeInConnection = () => {
    try {
      this._taskManager.provider.monitorServiceConnection((isConnected) => {
        this._dbManager.app.setServiceStatus(isConnected);
      });
    } catch (err) {
      this._logError(600, JOB_USER_SUBSCRIPTIONS);
    }
  };

  // #region Common Method(s)
  _logError = (errorCode, action, description) => {
    const _description = description || Errors.http.default;
    const errObj = {
      _id: AppUtil.createGuid(),
      desc: `${_description}`,
      code: errorCode ? errorCode.toString() : 418,
      action: action || 'false',
      module: MODULE,
    };
    this._dbManager.app.logError(errObj);
  };

  resetPasswordCallback = (error) => {
    if (error) {
      const errObj = {
        _id: AppUtil.createGuid(),
        desc: `${error.reason}`,
        code: '418',
        action: 'ResetPassword' || 'false',
        module: MODULE,
      };
      this._dbManager.app.logError(errObj);
      this.resetPasswordUiCallBack(false, error.reason);
    } else {
      // this.doLogoutJob();
      this.resetPasswordUiCallBack(true);
    }
  };
}
