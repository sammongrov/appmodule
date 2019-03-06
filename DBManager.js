import Realm from 'realm';
import md5 from 'react-native-md5';
import AppUtil from '@mongrov/utils';
import App from './model/App';
import Setting from './model/Setting';
import Errors from './model/Errors';
import Login from './model/Login';
import Group from './model/Group';
import Message from './model/Message';
import User from './model/User';
import Wallet from './model/Wallet';

import Calender from './model/events/Calender';
import Board from './model/board/Board';
import Card from './model/board/Card';
import CardComments from './model/board/CardComments';
import CheckListItems from './model/board/CheckListItems';
import CheckLists from './model/board/CheckLists';

import Lists from './model/board/Lists';

import AppManager from './model/AppManager';
import GroupManager from './model/GroupManager';
import UserManager from './model/UserManager';
import BoardManager from './model/board/BoardManager';
import ListsManager from './model/board/ListsManager';
import CardManager from './model/board/CardManager';
import CheckListsManager from './model/board/CheckListsManager';
import CardCommentsManager from './model/board/CardCommentsManager';
import CalenderManager from './model/events/CalenderManager';

const MODULE = 'Database';
const DBSchema = {
  schema: [
    App,
    Setting,
    Errors,
    Login,
    Group,
    Message,
    User,
    Board,
    Lists,
    Card,
    CardComments,
    CheckListItems,
    CheckLists,
    Wallet,
    Calender,
  ],
  schemaVersion: 18,
  migration: () => {},
};

/*
* Todos
*  - need to use realm to handle user and server
*  - use realm authentication?
*  - encryption of data saved to disk
*/

class Database {
  constructor() {
    AppUtil.debug(`Init in Database`, MODULE);
  }

  get appRealm() {
    return this._appRealm;
  }

  // refer to AppManager for methods that can be accessed
  get app() {
    return this._app;
  }

  // refer to GroupManager for methods that can be accessed
  get group() {
    return this._group;
  }

  // refer to UserManager for methods that can be accessed
  get user() {
    return this._user;
  }

  // refer to BoardManager for methods that can be accessed
  get board() {
    return this._board;
  }

  // refer to ListsManager for methods that can be accessed
  get lists() {
    return this._lists;
  }

  // refer to CardManager for methods that can be accessed
  get card() {
    return this._card;
  }

  // refer to ChecklistsManager for methods that can be accessed
  get checklists() {
    return this._checklists;
  }

  // refer to CardCommentsManager for methods that can be accessed
  get cardComments() {
    return this._cardComments;
  }

  get calender() {
    return this._calender;
  }

  initDb(server, user) {
    if (server && user) {
      const path = md5.hex_md5(`${server}:${user}`);
      this.load(path);
    } else {
      throw new Error('Server required');
    }
  }

  // load realm
  load(path) {
    const db = DBSchema;
    db.path = path;
    this._appRealm = new Realm(DBSchema);
    // this.initDBManagers(Database._appRealm);
    // this.initChatTaskManager();
  }

  initTaskManager = (taskManager) => {
    this._taskManager = taskManager;
    this._initDBManagers();
  };

  // This async await changes . need to removed and tested .
  _initDBManagers = () => {
    if (this._appRealm && this._taskManager) {
      this._app = new AppManager(this._appRealm, this._taskManager);
      this._user = new UserManager(this._appRealm, this._taskManager);
      this._group = new GroupManager(this._appRealm, this._user, this._app, this._taskManager);
      this._board = new BoardManager(this._appRealm, this._taskManager);
      this._lists = new ListsManager(this._appRealm, this._taskManager);
      this._card = new CardManager(this._appRealm, this._taskManager);
      this._calender = new CalenderManager(this._appRealm, this._taskManager);
      this._checklists = new CheckListsManager(this._appRealm, this._taskManager);
      this._cardComments = new CardCommentsManager(this._appRealm, this._taskManager);
    } else {
      throw new Error('Realm and Task handler is required');
    }
  };

  // WARNING!!! dangerous method, call only if you are sure about it
  reset() {
    this._appRealm.write(() => {
      this._appRealm.deleteAll();
    });
  }
}

module.exports = new Database();
