/*
* app master/global holder
*/
import AppUtil from '@mongrov/utils';
import Constants from './constants';
import { Application } from '@mongrov/config';

const Module = 'AppManager';

export default class AppManager {
  constructor(realmObj, taskManger) {
    if (realmObj && taskManger) {
      this._realm = realmObj;
      this._listeners = {};
      this._taskManger = taskManger;
      //  this._handler.initTaskHandler(this);
    }
  }

  get realm() {
    return this._realm;
  }

  get app() {
    let res;
    try {
      res = this._realm.objects(Constants.App);
      return res && res.length > 0 ? res['0'] : null;
    } catch (error) {
      // throw new Error('REALM NOT INTIALIZED');
      // console.log("APP NOT INTIALIZED APP",error);
      AppUtil.debug(`APP NOT INTIALIZED APP`, error);
      return error;
    }
  }

  set appState(appstate) {
    const _app = this.app;
    if (appstate !== undefined && appstate !== null && this.app) {
      this._realm.write(() => {
        _app.isAppStateActive = appstate;
      });
    }
  }

  get appState() {
    const _app = this.app;
    if (_app) {
      return _app.isAppStateActive;
    }
    return null;
  }

  // get wallet() {
  //   let res;
  //   try {
  //     res = this._realm.objects(Constants.Wallet);
  //     return res && res.length > 0 ? res['0'] : null;
  //   } catch (error) {
  //     // throw new Error('REALM NOT INTIALIZED');
  //     // console.log("APP NOT INTIALIZED WALLET",error);
  //     AppUtil.debug(`APP NOT INTIALIZED WALLET`, error);
  //     return error;
  //   }
  // }

  // setWallet(publicKey, secretKey, mnemonic) {
  //   try {
  //     const objToStore = {
  //       _id: AppUtil.createGuid(),
  //       publicKey,
  //       secretKey,
  //       mnemonic,
  //     };
  //     this._realm.write(() => {
  //       this._realm.create(Constants.Wallet, objToStore, true);
  //     });
  //   } catch (error) {
  //     // console.log("APP NOT INTIALIZED SET WALLET",error);
  //     AppUtil.debug(`APP NOT INTIALIZED SET WALLET`, error);
  //     return error;
  //   }
  // }

  getSettingsValue(key) {
    let res;
    try {
      res = this._realm.objects(Constants.Setting).filtered(`_id="${key}"`);
      return res && res.length > 0 ? res[0] : null;
    } catch (error) {
      // console.log("APP NOT INTIALIZED SETTINGS VALUE",error);
      AppUtil.debug(`APP NOT INTIALIZED SETTINGS VALUE`, error);
      return error;
    }
  }

  get userId() {
    var _app = this.app;
    return _app ? _app.userId : null;
  }

  get token() {
    var _app = this.app;
    return _app ? _app.token : null;
  }

  set disclaimer(isshown) {
    const _app = this.app;
    if (isshown !== undefined && isshown !== null) {
      this._realm.write(() => {
        _app.isDisclaimer = isshown;
      });
    }
  }

  set isIntro(isshown) {
    const _app = this.app;
    if (isshown !== undefined && isshown !== null) {
      this._realm.write(() => {
        _app.isIntro = isshown;
      });
    }
  }

  get isIntro() {
    return this.app.isIntro;
  }

  set isCertIntro(isshown) {
    const _app = this.app;
    if (isshown !== undefined && isshown !== null) {
      this._realm.write(() => {
        _app.isCertIntro = isshown;
      });
    }
  }

  get isCertIntro() {
    return this.app.isCertIntro;
  }

  get disclaimer() {
    return this.app.isDisclaimer;
  }

  // TODO
  // prev curr server to be set false
  // if input url is already present in db should set to true
  set host(serverURL) {
    let objToStore = {};
    if (serverURL) {
      const res = this.app; //  this._realm.objects(Constants.App).filtered(`_id = "${0}"`);
      objToStore = {
        host: serverURL,
      };
      if (res && res._id === 0) {
        this._realm.write(() => {
          // this._realm.delete(this.app);
          this._realm.create(Constants.App, objToStore, true);
        });
      } else {
        this._realm.write(() => {
          objToStore = {
            host: serverURL,
          };
          this._realm.create(Constants.App, objToStore, true);
        });
      }
      // call to create job from here
      this.connectHost();
    }
  }

  set settings(settings) {
    try {
      if (settings.length > 0) {
        const _settings = settings.map((setting) => {
          const _setting = setting;
          _setting.value = setting.value ? setting.value.toString() : '';
          return _setting;
        });
        const _app = this.app;

        if (settings && _app) {
          this._realm.write(() => {
            const currSettings = this._realm.objects(Constants.Setting);
            if (currSettings.length > 0) {
              this._realm.delete(currSettings);
            }
            _app.settings = _settings;
          });
        }
      }

      // console.log("APP MANAGER",_app.settings)
    } catch (err) {
      AppUtil.debug(`ERROR IN SET SETTINGS ${err}`, Module);
    }
  }

  connectHost() {
    if (this.app && this.app.host) {
      this._taskManger.app.connect(this.app.host);
    }
  }

  reconnectHost() {
    if (this.app && this.app.host) {
      this._taskManger.app.reconnect(this.app.host);
    }
  }

  setUserId(userid) {
    const _app = this.app;
    if (_app) {
      this._realm.write(() => {
        _app.userId = userid;
      });
    }
  }

  setToken(token) {
    const _app = this.app;
    if (_app) {
      this._realm.write(() => {
        _app.token = token;
      });
    }
  }

  setUserIdToken(userid, token) {
    const _app = this.app;
    if (_app) {
      this._realm.write(() => {
        _app.userId = userid;
        _app.token = token;
      });
    }
  }

  setServiceStatus = (serviceStatus) => {
    //  this should be one function - swami
    try {
      const _app = this.app;
      const realm = this._realm;
      if (_app && realm && _app.isServiceConnected !== serviceStatus) {
        realm.write(() => {
          _app.isServiceConnected = serviceStatus;
        });
      }
      if (serviceStatus) {
        // this.removeErrorByCode(599);
        AppUtil.debug(`SETTINGS FETCHING`, Module);
        if (this.app && Object.keys(this.app.settings).length < 1) {
          this._taskManger.app.fetchSettingsJob();
        }
      } else {
        AppUtil.debug(`METEOR DISCONNECTED`, Module);
      }
    } catch (error) {
      AppUtil.debug(`APP ERROR setServiceStatus === ${JSON.stringify(error)}`);
    }
  };

  setNetworkStatus = (networkStatus) => {
    try {
      const _app = this.app;
      const realm = this._realm;
      if (_app && realm) {
        realm.write(() => {
          _app.isNetworkConnected = networkStatus;
        });
      }
    } catch (error) {
      AppUtil.debug(`APP ERROR setNetworkStatus === ${JSON.stringify(error)}`);
    }
  };

  setLastSyncOffline(serviceStatus) {
    try {
      const _app = this.app;
      const realm = this._realm;
      if (!serviceStatus && serviceStatus !== _app.isServiceConnected) {
        if (_app && realm) {
          realm.write(() => {
            _app.isServiceConnected = serviceStatus;
            _app.lastSync = AppUtil.getCurrentRealmDate();
          });
        }
      }
    } catch (error) {
      AppUtil.debug(`APP ERROR setLastSyncOffline === ${JSON.stringify(error)}`);
    }
  }

  setLastSyncOnMessage() {
    try {
      const _app = this.app;
      const realm = this._realm;

      realm.write(() => {
        _app.lastSync = AppUtil.getCurrentRealmDate();
      });
    } catch (error) {
      AppUtil.debug(`APP ERROR setLastSyncOnMessage  === ${JSON.stringify(error)}`);
      AppUtil.debug(`APP ERROR setLastSyncOnMessage  === `, error);
    }
  }

  registerUser(name, email, password) {
    // TO-DO password to be generated
    this._taskManger.app.doRegisterUser(name, email, '', password);
  }

  login(userName, userPwd) {
    const _app = this.app;
    if (_app) {
      if (!_app.isServiceConnected) {
        this.connectHost();
      }
      this._realm.write(() => {
        const loginObj = { userName, userPwd };
        _app.login = loginObj;
      });
      this._taskManger.app.doLoginJob(userName, userPwd);
    }
  }

  logout() {
    const _app = this.app;
    if (_app) {
      this._realm.write(() => {
        // _app.login = null;
        _app.userId = null;
        _app.token = null;
        _app.lastSync = null;
        this._realm.delete(this._realm.objects(Constants.Group));
        this._realm.delete(this._realm.objects(Constants.Message));
        this._realm.delete(this._realm.objects(Constants.User));
        this._realm.delete(this._realm.objects(Constants.Board));
        this._realm.delete(this._realm.objects(Constants.Lists));
        this._realm.delete(this._realm.objects(Constants.Card));
        this._realm.delete(this._realm.objects(Constants.CardComments));
        this._realm.delete(this._realm.objects(Constants.Checklistitems));
        this._realm.delete(this._realm.objects(Constants.Checklists));
      });

      this.removeError(Application.JOBNAME.JOB_LOGIN);
      this._taskManger.app.doLogoutJob(); // if we logout meteor user can't able to login again
    }
  }

  // addSubToApp(sub){
  //   if(sub && sub.length < 0){

  //     this._realm.write(() => {
  //       this.app.subscriptions = [];
  //       for(let i =0 ; i < sub.length ; i+=1){
  //         this.app.subscriptions.push(sub[i])
  //       }
  //     })
  //   }

  // }

  logError(errorObj) {
    const _app = this.app;
    const _errorObj = errorObj;
    if (_app && _errorObj.desc) {
      this._realm.write(() => {
        const currentErrorsInSchema = this._realm
          .objects(Constants.App)
          .filtered(`errors.action =  "${_errorObj.action}"`);

        if (currentErrorsInSchema && currentErrorsInSchema.length > 0) {
          currentErrorsInSchema[0].errors[0].desc = errorObj.desc.toString();
          currentErrorsInSchema[0].errors[0].code = errorObj.code;
          currentErrorsInSchema[0].errors[0].createdAt = new Date();
        } else {
          _errorObj._id = AppUtil.createGuid();
          _errorObj._createdAt = new Date();
          _app.errors.push(this._realm.create(Constants.Errors, _errorObj, true));
        }
        AppUtil.debug(`APP ERROR === ${JSON.stringify(errorObj)}`);
      });
    }
  }

  removeError(action) {
    if (action) {
      this._realm.write(() => {
        const currentErrorsInSchema = this._realm
          .objects(Constants.Errors)
          .filtered(`action =  "${action}"`);
        if (currentErrorsInSchema[0]) {
          this._realm.delete(currentErrorsInSchema[0]);
        }
      });
    }
  }

  // removeErrorByCode(code) {
  //   if (code) {
  //     this._realm.write(() => {
  //       const currentErrorsInApp = this._realm
  //         .objects(Constants.App)
  //         .filtered(`errors.code =  "${code}"`);
  //       const errors = this._realm.objects(Constants.Errors).filtered(`code =  "${code}"`);
  //       if (currentErrorsInApp.length > 0) {
  //         currentErrorsInApp.forEach((errorSchema) => {
  //           this._realm.delete(errorSchema);
  //         });

  //         Object.keys(errors).forEach(() => {
  //           this._realm.delete(errors[0]);
  //         });
  //       }
  //     });
  //   }
  // }

  resetPassword(passsowrd, callback) {
    if (passsowrd) {
      this._taskManger.app.resetPassword(passsowrd, callback);
    }
  }

  // todo key tobe used to eliminate duplicate listener
  addAppListener(listener) {
    try {
      if (listener) {
        this._realm.objects(Constants.App).addListener(listener);
      }
    } catch (err) {
      AppUtil.debug(`Error In add listner`, Module);
      return err;
    }
  }

  removeAppListener(listener) {
    try {
      if (listener) {
        this._realm.objects(Constants.App).removeListener(listener);
      }
    } catch (err) {
      AppUtil.debug(`Error In add listner`, Module);
    }
  }
}
