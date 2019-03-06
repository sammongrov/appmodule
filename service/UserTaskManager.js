import AppUtil from '@utils';
import UserService from './UserService';
import Constants from '../model/constants';

const MODULE = 'UserTaskManager';

export default class UserTaskManager {
  constructor(taskManager, dbManager) {
    if (taskManager && dbManager) {
      this._taskManager = taskManager;
      this._dbManager = dbManager;
      this._userManager = this._dbManager.user;
      this._groupManager = this._dbManager.group;
      this._provider = this._taskManager.provider;
      this._userService = new UserService(this._provider, this._userManager);
      AppUtil.debug(`UserTaskManager initiated`, MODULE);
      // this._provider.monitorOnLogin(this.subscribeAndStatus);
    }
  }

  setUsers = async (results) => {
    const user = this._userService.dataToUser(results);
    const userObj = await this._userManager.createBulkUser(user);
    this._groupManager.updateGroupsStatus();
    return userObj;
  };

  subscribeAndStatus = () => {
    this._provider.subscribeToUserChanges(this.setUsers);
    this.setUserStatus('online');
  };

  setUserStatus = async (status) => {
    let userStatus = Constants.U_OFFLINE;
    switch (status) {
      case 'online':
        userStatus = Constants.U_ONLINE;
        break;
      case 'away':
        userStatus = Constants.U_AWAY;
        break;
      case 'busy':
        userStatus = Constants.U_BUSY;
        break;
      default:
        userStatus = Constants.U_OFFLINE;
    }
    try {
      await this._userManager.setUserStatusLocally(userStatus);
      await this._provider.setUserPresence(userStatus);
    } catch (error) {
      AppUtil.debug(`Error in setting user status, ${error}`);
    }
  };
}
