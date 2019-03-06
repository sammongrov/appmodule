// import Constants from './model/constants';
// import DBManager from './DBManager';

export default class AppDBListener {
  constructor(realm, taskHandler) {
    this.test = 'TEST';
    if (realm) {
      this._realm = realm;
      this._taskHandler = taskHandler;
      // this._realm.objects(Constants.App).addListener((schema, changes) => {
      //   this._appChange(schema, changes);
      // });
    }
  }

  _appChange() {
    // let currentApp;
    // changes.insertions.forEach((index) => {
    //   currentApp = app[index];
    // });
    // changes.modifications.forEach((index) => {
    //   currentApp = app[index];
    // });
  }
}
