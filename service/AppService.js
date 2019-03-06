// import AppUtil from '@mongrov/utils';

// const Module = 'AppService';

export default class AppService {
  constructor(provider, manager) {
    if (provider) {
      // Need to verify with Sami, since the below line throws error.
      // this._provider = provider.meteor;
      this._provider = provider;
      this._appManager = manager;
    }
  }

  //   monitorConnectionChange() {
  //     try {
  //       this._provider.monitorServiceConnection((isConnected) => {
  //         this._appManager.setServiceStatus(isConnected);
  //       });
  //     } catch (err) {
  //       throw err;
  //     }
  //   }
}
