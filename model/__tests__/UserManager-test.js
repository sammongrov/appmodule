import 'react-native';
import Realm from './_realm';

import Constants from '../constants';
import Application from '../../../constants/config';

// imports for mocked modules

import UserManager from '../UserManager';

const realmObj = Realm;

jest.mock('../../../utils/index', () => ({
  removeEmptyValues: jest.fn((obj) => obj),
}));
const AppUtil = require('../../../utils/index');

const users = [
  { _id: '6x57td', username: 'linux000', name: 'Guess' },
  { _id: '1nbRc6', username: 'megamind16', name: 'MegaMind' },
  { _id: '8sD1rb', username: 'noidea', name: 'Somename' },
  { _id: '5lo6Yt', username: 'snowWite', name: 'Winter' },
];

const usersWithRole = [
  { _id: '6x57td', username: 'linux000', name: 'Guess', roles: ['user'] },
  { _id: '1nbRc6', username: 'megamind16', name: 'MegaMind', roles: ['user'] },
  { _id: '8sD1rb', username: 'noidea', name: 'Somename', roles: ['user'] },
  { _id: '5lo6Yt', username: 'snowWite', name: 'Winter', roles: ['user'] },
];

class RC {
  constructor() {
    console.log('RC created');
  }

  getUserRoles = jest.fn(async () => usersWithRole);
}

class UserTaskManager {
  constructor() {
    console.log('User manager');
  }

  setUsers = jest.fn(() => true);
  setUserStatus = jest.fn(() => true);
}

const userTask = new UserTaskManager();

// const Applications = {
//   APPCONFIG: {
//     CHECK_FOR_DISCOVER: false,
//     DISCOVER_HIDE_ROLE: "user",
//     ATTACH_AUDIO: false,
//     CHANGE_SERVER: true,
//   },
// }

class TaskManager {
  constructor() {
    console.log('TaksManager created');
    const rc = new RC();
    this.provider = rc;
    this.user = userTask;
  }
}

const taskManager = new TaskManager();

const userManager = new UserManager(realmObj, taskManager);

const usersToObj = users.reduce((acc, user, index) => {
  acc[index] = user;
  return acc;
}, {});

const settings = [
  { _id: 'globalTImeZone', value: true },
  { _id: 'isDateAvail', value: "{'id':'global'}" },
];

const login = [
  {
    userName: 'linux000',
    userPwd: '10090',
  },
];

const app = {
  _id: 1231234,
  host: 'cor.mongrov.com',
  lastSync: new Date(),
  userId: '6x57td',
  [settings]: settings,
  [login]: login,
};

const insertUsersAppToDB = () => {
  const db = userManager._realm;
  users.forEach(() => {
    try {
      db.write(() => {
        db.create(Constants.App, app, true);
      });
    } catch (err) {
      console.log(err);
    }
  });
};

const insertUsersToDB = () => {
  const db = userManager._realm;
  users.forEach((user) => {
    try {
      db.write(() => {
        db.create(Constants.User, user, true);
      });
    } catch (err) {
      console.log(err);
    }
  });
};

// const insertAppToDB = () => {
//   const db = userManager._realm;
//   const app = { host, userId: userID };
//   try {
//     db.write(() => {
//       db.create(Constants.App, app);
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };
AppUtil.debug = jest.fn();

const deleteRealmUser = (userId) => {
  const db = userManager._realm;
  db.write(() => {
    const objToDelete = db.objects(Constants.User).filtered(`_id = "${userId}"`);
    db.delete(objToDelete);
  });
};
const listener = jest.fn();

beforeAll(() => {
  insertUsersToDB();
  insertUsersAppToDB();
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

describe('tests without db', () => {
  const userManagerWithoutRealm = new UserManager();

  it('userManager deleteMessageRoles method throws an error', () => {
    try {
      userManagerWithoutRealm.setDeleteMessageRoles(users[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('userManager loginUserListner method throws an error', () => {
    try {
      userManagerWithoutRealm.loginUserListner(usersWithRole[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
});

it('UserManager is instantiated successfully', () => {
  expect(userManager).toBeTruthy();
  expect(userManager).toBeInstanceOf(UserManager);
  expect(userManager._realm).toEqual(realmObj);
});

it('UserManager gets list of user', () => {
  const { list } = userManager;
  expect(list).toMatchObject(usersToObj);
});

// it('UserManager gets user avatar by id', () => {
//   const avatar1 = userManager.getAvatarById();
//   const avatar2 = userManager.getAvatarById('6x57td');

//   expect(avatar1).toMatch('https://d3iw72m71ie81c.cloudfront.net/female-17.jpg');
//   expect(avatar2).toMatch('https://d3iw72m71ie81c.cloudfront.net/female-17.jpg');
// });
it('setUserStatusLocally', () => {
  try {
    userManager.setUserStatusLocally();
  } catch (e) {
    expect(e).toEqual(expect.anything());
  }
});

it('setDeleteMessageRoles', () => {
  try {
    userManager.setDeleteMessageRoles(usersWithRole[0]._id);
  } catch (e) {
    expect(e).toEqual(expect.anything());
  }
});

it('create user ', async () => {
  const user = {
    _id: `${Math.random().toString()}AvCr`,
    username: 'megamind216',
    name: 'MegaMind2',
  };
  await userManager.createUser(user);
  const searchResult1 = userManager.findByIdAsList(user._id);
  expect(searchResult1).toHaveLength(1);
});

it(`set user offline`, async () => {
  const _IdOffline = `${Math.random().toString()}AvCrOffNe`;
  const user = { _id: _IdOffline, username: 'megamind216', name: 'MegaMind2' };
  await userManager.createUser(user);
  await userManager.setAllUserOffline();
  const searchResult1 = userManager.findByIdAsList(_IdOffline);
  expect(searchResult1[0].status).toBe('offline');
});

it('UserManager finds user by id as list', () => {
  // user in db
  const user = { _id: '1nbRc6', username: 'megamind16', name: 'MegaMind' };
  const searchResult1 = userManager.findByIdAsList(user._id);
  expect(searchResult1).toHaveLength(1);
  expect(searchResult1['0']).toMatchObject(user);

  // user not in db
  const notExistingUser = {
    _id: '3HvCr8',
    username: 'anonymous',
    name: 'NotProvided',
  };
  const searchResult2 = userManager.findByIdAsList(notExistingUser._id);

  expect(searchResult2).toBeNull();
});

it('UserManager finds user by id', () => {
  // user in db
  const user = { _id: '5lo6Yt', username: 'snowWite', name: 'Winter' };
  const searchResult1 = userManager.findById(user._id);

  expect(searchResult1).toMatchObject(user);

  // user not in db
  const notExistingUser = {
    _id: '7Dvrfs',
    username: 'sevenDwarfs',
    name: 'SnowWhiteKnows',
  };
  const searchResult2 = userManager.findById(notExistingUser._id);

  expect(searchResult2).toBeNull();
});

it('UserManager gets a logged in user', () => {
  const { loggedInUser } = userManager;
  expect(loggedInUser).toMatchObject(users[0]);
});

it('UserManager gets a logged in user', () => {
  userManager.loginUserListner();
  //  expect(loggedInUserId).toMatchObject(users[0]._id);
});

it('UserManager gets a logged in user', () => {
  userManager.isCurrentUserAdmin();
  //  expect(loggedInUserId).toMatchObject(users[0]._id);
});

it('UserManager gets a logged in user', () => {
  const { loggedInUserId } = userManager;
  expect(loggedInUserId).toBe(users[0]._id);
});

it('UserManager creates a user', () => {
  const newUser = { _id: '2Yt0pd', username: 'huntsman55', name: 'Killer' };
  const result = userManager.createUser(newUser);

  expect(result).toBeUndefined();
  expect(userManager.findById('2Yt0pd')).toMatchObject(newUser);

  // delete added user
  deleteRealmUser(newUser._id);
});

it('UserManager adds a user listener', () => {
  let addListenerError = null;
  try {
    userManager.addUserListener(listener);
  } catch (error) {
    addListenerError = error;
  }
  expect(addListenerError).toBeNull();
});

it('UserManager removes a user listener', () => {
  let removeListenerError = null;
  try {
    userManager.removeUserListener(listener);
  } catch (error) {
    removeListenerError = error;
  }
  expect(removeListenerError).toBeNull();
});

it('userManager adds a group listener', () => {
  let addGroupMessageListner = null;
  try {
    userManager.loginUserListner(listener);
  } catch (error) {
    addGroupMessageListner = error;
  }
  expect(addGroupMessageListner).toBeNull();
});

it('create bulk user testing', () => {
  const UserList = [
    {
      _id: 'tmRSSha8mp9buXcCA',
      emails: 'sam@mongrov.com',
      username: 'sam',
      _version: 2,
      name: 'Swaminathan',
      status: 'online',
      utcOffset: 5.5,
    },
    {
      _id: '7jrYSSS8EA6y8hXFy',
      name: 'Marina Biletska',
      status: 'online',
      username: 'marina',
      utcOffset: 2,
      _version: 1,
    },
    {
      _id: 'Ri9cohELZeCwxmtvd',
      name: 'Mohanasundaram Jemini',
      status: 'online',
      username: 'mohan',
      utcOffset: 5.5,
      _version: 1,
    },
    {
      _id: '2EknsjL7tEmeZjoPY',
      name: 'ezhilarasu',
      status: 'away',
      username: 'ezhil',
      utcOffset: 5.5,
      _version: 1,
    },
  ];
  userManager.createBulkUser(UserList);
  // console.log('USER LIS IS ', realmObj.objects(Constants.User));
});

it('UserManager sets user status to online', () => {
  const updatedUser = Object.assign({}, users[0]);
  updatedUser.status = 'online';
  expect(userManager.setUserStatusLocally('online')).toMatchObject(updatedUser);
});

it('UserManager sets user status to offline', () => {
  const updatedUser = Object.assign({}, users[0]);
  updatedUser.status = 'offline';
  expect(userManager.setUserStatusLocally('offline')).toMatchObject(updatedUser);
});

// describe('tests without db', () => {
//   const userManagerWithoutRealm = new UserManager();
//   it('UserManager gets an error on setting user status', () => {
//     expect(userManagerWithoutRealm.setUserStatusLocally('online')).toBeUndefined();
//   });
// });

it('UserManager gets user status', () => {
  expect(userManager.getStatus('linux000')).toMatch('offline');
  expect(userManager.getStatus('superMario')).toMatch('');
});

it('UserManager gets user status', () => {
  userManager.setUserStatus();
  expect(userTask.setUsers.mock.calls.length).toBe(1);
});

it('UserManager gets user status', () => {
  userManager.setUserOnlineStatus();
  expect(userTask.setUserStatus.mock.calls.length).toBe(1);
});

it('UserManager gets user status', async () => {
  await userManager.isDiscoverEnabled();
  // expect(userTask.setUsers.mock.calls.length).toBe(1);
});

it('UserManager setDeleteMessageRoles', async () => {
  await userManager.setDeleteMessageRoles(['user', 'admin']);
  // expect(userTask.setUsers.mock.calls.length).toBe(1);
});

it('UserManager deleteMessageRoles', async () => {
  const roles = await userManager.deleteMessageRoles;
  expect(roles.length).toBe(2);
});

it('UserManager userRoles', async () => {
  const roles = await userManager.userRoles;
  expect(roles.length).toBe(0);
});

it('UserManager gets full user data', () => {
  const groupUsers = [
    {
      _id: 'tmRSSha8mp9buXcCA',
      username: 'sam',
      name: 'Swaminathan',
    },
    {
      _id: '7jrYSSS8EA6y8hXFy',
      name: 'Marina Biletska',
      username: 'marina',
    },
    {
      _id: 'Ri9cohELZeCwxmtvd',
      name: 'Mohanasundaram Jemini',
      username: 'mohan',
    },
  ];
  const updatedUsers = [
    {
      _id: 'tmRSSha8mp9buXcCA',
      emails: 'sam@mongrov.com',
      username: 'sam',
      name: 'Swaminathan',
      status: 'online',
    },
    {
      _id: '7jrYSSS8EA6y8hXFy',
      name: 'Marina Biletska',
      status: 'online',
      username: 'marina',
    },
    {
      _id: 'Ri9cohELZeCwxmtvd',
      name: 'Mohanasundaram Jemini',
      status: 'online',
      username: 'mohan',
    },
  ];

  expect(userManager.getFullUserData(groupUsers)).toMatchObject(updatedUsers);
});

it('UserManager isDiscoverEnabled', async () => {
  Application.APPCONFIG = { CHECK_FOR_DISCOVER: true };
  const usersWithRoles = [
    { _id: '6x57td', roles: ['admin', 'user'] },
    { _id: 'USER000015', roles: ['user'] },
    { _id: 'USER000015', roles: ['moderator'] },
  ];
  userManager._taskManager.provider.getUserRoles = jest.fn(() => Promise.resolve(usersWithRoles));
  userManager.createBulkUser = jest.fn();
  expect.assertions(3);
  const isParent = await userManager.isDiscoverEnabled();
  expect(userManager._taskManager.provider.getUserRoles).toBeCalled();
  expect(userManager.createBulkUser).toBeCalled();
  expect(isParent).toBe(true);
});

it('UserManager isDiscoverEnabled', async () => {
  Application.APPCONFIG = {
    CHECK_FOR_DISCOVER: true,
    DISCOVER_HIDE_ROLE: 'parent',
  };
  // insert user roles
  const currentUser = userManager.loggedInUser;
  userManager._realm.write(() => {
    currentUser.roles = ['admin', 'parent'];
  });
});

// it('console.log the text "error"', () => {

//   const log  = log('error');
//   console.log = jest.fn();
//   // The first argument of the first call to the function was 'hello'
//   expect(console.log.mock.calls[0][0]).toBe('ERROR');
// });

it('console.log the text "error"', () => {
  console.log = jest.fn();
  //log('error');
  expect(console.log).toHaveBeenCalledWith('ERROR');
});
