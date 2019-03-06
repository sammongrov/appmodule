/*
 * User Manager class
 */
import AppUtil from '@utils';
import Constants from './constants';
import Application from '../../constants/config';

// wrapper class for all user related db functions
export default class UserManager {
  constructor(realm, taskmanager) {
    this._realm = realm;
    this._taskManager = taskmanager;
  }

  get list() {
    return this._realm.objects(Constants.User);
  }

  // find user by id
  findById(uid) {
    const res = this.findByIdAsList(uid);
    return res ? res['0'] : null;
  }

  get loggedInUser() {
    const { userId } = this._realm.objects(Constants.App)[0];
    const userObj = this.findById(userId);
    return userObj;
  }

  get loggedInUserId() {
    const { userId } = this._realm.objects(Constants.App)[0];
    return userId;
  }

  // find user by id
  findByIdAsList(uid) {
    const res = this.list.filtered(`_id = "${uid}"`);
    return res && res.length > 0 ? res : null;
  }

  createUser = (user) => {
    // const userObj = user;
    // userObj.avatar = this.getAvatarById(user._id);
    this._realm.write(() => {
      const obj = this._realm.create(Constants.User, user);
      return obj;
    });
  };

  setAllUserOffline = () => {
    this._realm.write(() => {
      const existingUserList = this._realm.objects(Constants.User);
      existingUserList.forEach((existingUser) => {
        const _existingUser = existingUser;
        _existingUser.status = Constants.U_OFFLINE;
        this._realm.create(Constants.User, _existingUser, true);
      });
    });
  };

  createBulkUser = (userList) => {
    let userSchema;
    if (userList.length > 0) {
      this._realm.write(() => {
        // const existingUserList = this._realm.objects(Constants.User);
        // existingUserList.forEach((existingUser) => {
        //   const _existingUser = existingUser;
        //   _existingUser.status = Constants.U_OFFLINE;
        //   this._realm.create(Constants.User, _existingUser, true);
        // });
        userList.forEach((user) => {
          userSchema = this._realm.create(Constants.User, user, true);
        });
      });
    }
    return userSchema;
  };

  addUserListener(listener) {
    this._realm.objects(Constants.User).addListener(listener);
  }

  removeUserListener(listener) {
    this._realm.objects(Constants.User).removeListener(listener);
  }

  loginUserListner(listener) {
    try {
      const { userId } = this._realm.objects(Constants.App)[0];
      if (userId) {
        const loggedInUser = this._realm.objects(Constants.User).filtered(`_id = "${userId}"`);
        if (loggedInUser.length > 0) {
          loggedInUser.addListener(listener);
        } else {
          setTimeout(this.loginUserListner(listener), 10000);
        }
      }
    } catch (error) {
      AppUtil.debug(`Logged In User ERROR ON LISTNER ${error}`);
    }
  }

  setUserStatusLocally(userStatus) {
    const currentUserObj = this.loggedInUser;
    try {
      if (currentUserObj) {
        this._realm.write(() => {
          currentUserObj.status = userStatus;
        });
      }
      return currentUserObj;
    } catch (error) {
      AppUtil.debug(`User status is not updated, ${error}`);
    }
  }

  getStatus(userName) {
    const user = this.list.filtered(`username = "${userName}"`);
    return user['0'] ? user['0'].status : '';
  }

  getFullUserData(groupUsers) {
    const users = this.list;
    const groupUsersIds = groupUsers.map((user) => user._id);
    return Object.keys(users).reduce((acc, key) => {
      if (groupUsersIds.includes(users[key]._id)) {
        return acc.concat([users[key]]);
      }
      return acc;
    }, []);
  }

  setUserStatus = async (results) => {
    await this._taskManager.user.setUsers(results);
  };

  setUserOnlineStatus = async (status) => {
    await this._taskManager.user.setUserStatus(status);
  };

  isDiscoverEnabled = async () => {
    try {
      if (Application.APPCONFIG.CHECK_FOR_DISCOVER) {
        const { loggedInUser } = this;
        let isparent = false;
        let currentUser;
        if (loggedInUser && Object.keys(loggedInUser.roles).length <= 0) {
          const users = await this._taskManager.provider.getUserRoles();
          this.createBulkUser(users);
          for (let i = 0; i < users.length; i += 1) {
            if (users[i]._id === loggedInUser._id) {
              currentUser = users[i];
            }
          }
          if (currentUser) {
            currentUser.roles.forEach((index) => {
              if (currentUser.roles[index] === Application.APPCONFIG.DISCOVER_HIDE_ROLE) {
                isparent = true;
              }
            });
          }
        } else if (loggedInUser && loggedInUser.roles) {
          Object.keys(loggedInUser.roles).forEach((index) => {
            if (loggedInUser.roles[index] === Application.APPCONFIG.DISCOVER_HIDE_ROLE) {
              isparent = true;
            }
          });
        }
        return isparent;
      }
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  isCurrentUserAdmin = async () => {
    const { loggedInUser } = this;
    let isAdmin = false;
    // console.log('USER MANAGER loggedInUser & roles', loggedInUser, loggedInUser.roles);
    try {
      if (loggedInUser && Object.keys(loggedInUser.roles).length <= 0) {
        const admins = await this._taskManager.provider.getUserRoles();
        const userAdmin = admins.find(
          (user) => user._id === loggedInUser._id && user.roles[0] === 'admin',
        );

        if (userAdmin) {
          this.createBulkUser([userAdmin]);
        }

        // this.setUserRole(userAdmin);
        isAdmin = !!userAdmin;
      }
      if (loggedInUser && loggedInUser.roles) {
        Object.keys(loggedInUser.roles).forEach((index) => {
          if (loggedInUser.roles[index] === 'admin') {
            isAdmin = true;
          }
        });
      }
      return isAdmin;
    } catch (error) {
      AppUtil.debug(`ERROR GETTING ADMIN ROLES, ${JSON.stringify(error)}`);
    }
  };

  setDeleteMessageRoles = (roles) => {
    const { loggedInUser } = this;
    if (loggedInUser && roles && roles.length > 0) {
      // console.log('MAR - SETTING DELETE MESSAGE ROLES', roles);
      try {
        this._realm.write(() => {
          loggedInUser.deleteMessageRoles = roles;
        });
        // check
        // console.log('MAR - DELETE MESSAGE ROLES', this.loggedInUser.deleteMessageRoles);
      } catch (error) {
        AppUtil.debug(`DELETE MESSAGE ROLES ARE NOT UPDATED, ${error}`);
      }
    }
  };

  get deleteMessageRoles() {
    const { loggedInUser } = this;
    const roles = Array.from(
      Object.keys(loggedInUser.deleteMessageRoles),
      (role) => loggedInUser.deleteMessageRoles[role],
    );
    // console.log('MAR - roles from getter', roles);
    return roles && roles.length > 0 ? roles : null;
  }

  get userRoles() {
    const { loggedInUser } = this;
    const roles = Array.from(Object.keys(loggedInUser.roles), (role) => loggedInUser.roles[role]);
    // console.log('Roles from getter', roles);
    return roles;
  }

  // setUserRole = (userObj) => {
  //   // console.log('SET USER ROLE', userObj);
  //   const { loggedInUserId } = this;
  //   const _userObj = userObj || { _id: loggedInUserId, roles: ['user'] };

  //   const { _id, roles } = _userObj;
  //   if (_id && roles) {
  //     try {
  //       const user = this.findById(_id);
  //       this._realm.write(() => {
  //         user.roles = roles;
  //       });
  //       // check
  //       console.log('setUserRole', this.findById(_id));
  //     } catch (error) {
  //       AppUtil.debug(`USER ROLES ARE NOT UPDATED, ${error}`);
  //     }
  //   }
  // };
}
