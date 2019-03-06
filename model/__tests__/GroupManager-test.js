import 'react-native';
import Realm from './_realm';
import Constants from '../constants';
import GroupManager from '../GroupManager';

import UserManager from '../UserManager';

jest.mock('../../../utils/index', () => ({
  removeEmptyValues: jest.fn((obj) => obj),
}));
const AppUtil = require('../../../utils/index');

const mockFindById = jest.fn();
const mockCreateUser = jest.fn();

jest.mock('node-emoji', () => ({
  unemojify: (text) => text,
  emojify: (text) => text,
}));

jest.mock('../UserManager', () =>
  jest.fn().mockImplementation(() => ({
    findById: mockFindById,
    createUser: mockCreateUser,
    loggedInUser: '6x57td',
  })),
);

const appManager = {
  userId: 'Ri9cohELZeCwxmtvd',
  logError: jest.fn(),
  setLastSyncOnMessage: jest.fn(),
};

const realmObj = Realm;
const userManager = new UserManager();
const groupManager = new GroupManager(realmObj, userManager, appManager);

const groups = [
  { _id: 'XT87kg1', name: 'furious', title: 'Not Fast, Just Furious', unread: 21 },
  { _id: 'L5yh7ip', name: 'heros', title: 'Super Heroes In Training' },
  { _id: 'Ki3Keo1', name: 'miracle-workers', title: 'The Miracle Workers' },
  { _id: 'CAT7891yi7', name: 'snowWhite', title: 'snowWhite', type: 'd' },
];

// const users = [
//   { _id: '6x57td', username: 'linux000', name: 'Guess' },
//   { _id: '1nbRc6', username: 'megamind16', name: 'MegaMind' },
//   { _id: '8sD1rb', username: 'noidea', name: 'Somename' },
//   { _id: '5lo6Yt', username: 'snowWhite', name: 'Winter' },
// ];

// const usersToObj = users.reduce((acc, user, index) => {
//   acc[index] = user;
//   return acc;
// }, {});
AppUtil.debug = jest.fn();

AppUtil.getCurrentRealmDate = jest.fn(() => new Date());

const transformGroupsToObj = (groupsArr) =>
  groupsArr.reduce((acc, group, index) => {
    acc[index] = group;
    return acc;
  }, {});

const insertGroupsToDB = () => {
  const db = groupManager._realm;
  groups.forEach((group) => {
    try {
      db.write(() => {
        db.create(Constants.Group, group);
      });
    } catch (err) {
      console.log(err);
    }
  });
};

// const insertUsersToDB = () => {
//   const db = groupManager._realm;
//   users.forEach((user) => {
//     try {
//       db.write(() => {
//         db.create(Constants.User, user);
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   });
// };

// const insertUsersIntoGroup = () => {
//   const db = groupManager._realm;
//   const group = groupManager.findById('CAT7891yi7');
//   const groupUsers = [users[0], users[3]];
//   groupUsers.forEach((groupUser) => {
//     try {
//       db.write(() => {
//         group.members.push(groupUser);
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   });
// };

// const cleanDB = () => {
//   const db = groupManager._realm;
//   db.write(() => {
//     db.deleteAll();
//   });
// };

const listener = jest.fn();
const groupsToObj = transformGroupsToObj(groups);

// delete realmDB after all the tests
afterAll(() => {
  // delete all groups
  // cleanDB();
  const db = groupManager._realm;
  db.write(() => {
    db.deleteAll();
  });
  // close DB
  realmObj.close();
});

// general tests
it('groupManager is instantiated successfully', () => {
  expect(groupManager).toBeTruthy();
  expect(groupManager).toBeInstanceOf(GroupManager);
  expect(groupManager._realm).toEqual(realmObj);
  expect(groupManager._listeners).toEqual({});
  expect(groupManager.userManager).toEqual(userManager);
});

it('groupManager adds a group listener', () => {
  let addListenerError = null;
  try {
    groupManager.addGroupListener(listener);
  } catch (error) {
    addListenerError = error;
  }
  expect(addListenerError).toBeNull();
});

it('groupManager removes a group listener', () => {
  let removeListenerError = null;
  try {
    groupManager.removeGroupListener(listener);
  } catch (error) {
    removeListenerError = error;
  }
  expect(removeListenerError).toBeNull();
});

it('groupManager removes a user listener', () => {
  let addgroupListenerError = null;
  try {
    groupManager.addGroupMessageListner(listener);
  } catch (error) {
    addgroupListenerError = error;
  }
  expect(addgroupListenerError).toBeNull();
});
it('groupManager removes a user listener', () => {
  let removegroupListenerError = null;
  try {
    groupManager.removeGroupMessageListener(listener);
  } catch (error) {
    removegroupListenerError = error;
  }
  expect(removegroupListenerError).toBeNull();
});

// without the db
describe('tests without db', () => {
  const groupManagerWithoutRealm = new GroupManager();

  it('groupManager is instantiated without realm', () => {
    expect(groupManagerWithoutRealm).toBeTruthy();
    expect(groupManagerWithoutRealm).toBeInstanceOf(GroupManager);
    expect(groupManagerWithoutRealm._realm).toBeUndefined();
    expect(groupManagerWithoutRealm._listeners).toBeUndefined();
    expect(groupManagerWithoutRealm.userManager).toBeUndefined();
  });

  it('groupManager addAll method catches an error', () => {
    AppUtil.removeEmptyValues.mockClear();
    const groupToAdd = {
      _id: '00c789b',
      name: 'ProblemSolver',
      type: 'd',
      avatar: 'http://problem-solver/avatar.png',
      avatarUpdatedAt: new Date(),
      roles: ['role2', 'roles3'],
    };

    try {
      groupManagerWithoutRealm.addAll(transformGroupsToObj([groupToAdd]));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('groupManager addMessage method throws an error', async () => {
    const messageToAdd = {
      _id: 'M112233',
      rid: 'M112232',
      u: { _id: '6x57td', username: 'linux000', name: 'Guess' },
      msg: 'Hello @all!',
      ts: Date.now(),
      _updatedAt: Date.now(),
    };

    try {
      await groupManagerWithoutRealm.addMessage(messageToAdd);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  //   // it('groupManager addMember method throws an error', () => {
  //   //   AppUtil.debug.mockClear();

  //   //   try {
  //   //     groupManagerWithoutRealm.addMember(groups[0]._id, users[0]._id);
  //   //   } catch (err) {
  //   //     expect(err).toBeInstanceOf(Error);
  //   //     expect(AppUtil.debug.mock.calls.length).toBe(2);
  //   //   }
  //   // });

  it('groupManager deleteGroup method throws an error', () => {
    try {
      groupManagerWithoutRealm.deleteGroup(groups[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
  it('groupManager updateNoMoreMessages method throws an error', () => {
    try {
      groupManagerWithoutRealm.updateNoMoreMessages(groups[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('groupManager setFileUploadPercent method throws an error', () => {
    try {
      groupManagerWithoutRealm.setFileUploadPercent(groups[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
  it('groupManager getNumOfMessageReplies method throws an error', () => {
    try {
      groupManagerWithoutRealm.getNumOfMessageReplies(groups[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
  it('groupManager addEarlierMessage method throws an error', () => {
    try {
      groupManagerWithoutRealm.addEarlierMessage(groups[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('groupManager deleteMessage method throws an error', () => {
    try {
      groupManagerWithoutRealm.deleteMessage(groups[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('groupManager deleteGroups method throws an error', () => {
    try {
      groupManagerWithoutRealm.deleteGroups(groups[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('groupManager updateAvatar method throws an error', () => {
    try {
      groupManagerWithoutRealm.updateAvatar(groups[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('groupManager setRoomAsRead method throws an error', () => {
    try {
      groupManagerWithoutRealm.setGroupAsRead(groups[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('groupManager addEarlierMessage method throws an error', () => {
    try {
      groupManagerWithoutRealm.addEarlierMessage(groups[0]._id);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('groupManager updates group status', () => {
    try {
      groupManagerWithoutRealm.updateGroupsStatus();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
});

// // with the empty db
describe('tests with empty db', () => {
  it('groupManager gets list of groups', () => {
    const { list } = groupManager;
    expect(list).toEqual(expect.anything(Realm.Results));
  });

  it('groupManager gets a current group', () => {
    // no groups in db
    const { currentGroup } = groupManager;
    expect(currentGroup).toBeNull();
  });
});

// // with the non-empty db
describe('tests with non-empty db', () => {
  beforeAll(() => {
    insertGroupsToDB();
  });

  it('groupManager gets list of groups', () => {
    const { list } = groupManager;
    expect(list).toMatchObject(groupsToObj);
  });

  it('groupManager gets a current group', () => {
    const { currentGroup } = groupManager;
    expect(currentGroup).toMatchObject(groupsToObj[0]);
  });

  it('groupManager finds a group by id', () => {
    // no gid in db
    const notFoundGroup = groupManager.findById('XP7T48u');
    expect(notFoundGroup).toBeNull();

    // gid in db
    const foundGroup = groupManager.findById(groups[2]._id);
    expect(foundGroup).toMatchObject(groupsToObj[2]);
  });

  it("groupManager doesn't add groups if called with no arg or with {}", () => {
    const result1 = groupManager.addAll();
    const result2 = groupManager.addAll({});

    expect(result1).toBeUndefined();
    expect(result2).toBeUndefined();
  });

  it("groupManager doesn't add a group without _id", () => {
    AppUtil.removeEmptyValues.mockClear();
    const groupToAdd = { name: 'funnyRoom', title: 'A room full of fun' };

    groupManager.addAll(transformGroupsToObj([groupToAdd]));
    const searchResult = groupManager.list.filtered(`name = "${groupToAdd.name}"`);
    const addedGroup = searchResult && searchResult.length > 0 ? searchResult['0'] : null;
    expect(AppUtil.removeEmptyValues.mock.calls.length).toBe(0);
    expect(addedGroup).toBeNull();
  });

  it('groupManager adds a new group', () => {
    AppUtil.removeEmptyValues.mockClear();
    const groupToAdd = {
      _id: 'C4Irt9x',
      name: 'privateChat',
      title: 'Top Secret Chat 23',
      type: 'private',
      lastMessage: {
        ts: new Date(),
        msg: 'start misile attack',
        u: {
          name: 'general',
        },
        file: {
          type: 'image',
        },
        bot: true,
        attachments: [
          {
            title: '42996316_911373412400673_3227746340456890368_o.jpg',
            title_link:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            title_link_download: true,
            image_url:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            type: 'file',
            description: '',
          },
        ],
      },
    };
    userManager.getStatus = jest.fn();
    groupManager.addAll(transformGroupsToObj([groupToAdd]));
    const addedGroup = groupManager.findById('C4Irt9x');
    expect(AppUtil.removeEmptyValues.mock.calls.length).toBe(1);
    expect(userManager.getStatus.mock.calls.length).toBe(0);
    expect(addedGroup).toBeTruthy();
    // expect(addedGroup).toMatchObject(groupToAdd);
  });

  it('groupManager adds a new group with reply message', () => {
    AppUtil.removeEmptyValues.mockClear();
    const groupToAdd = {
      _id: 'C4Irt9x',
      name: 'privateChat',
      title: 'Top Secret Chat 23',
      type: 'private',
      lastMessage: {
        ts: new Date(),
        msg: '(height)?msg=',
        u: {
          name: 'general',
        },
        bot: true,
      },
    };
    userManager.getStatus = jest.fn();
    groupManager.addAll(transformGroupsToObj([groupToAdd]));
    const addedGroup = groupManager.findById('C4Irt9x');
    expect(AppUtil.removeEmptyValues.mock.calls.length).toBe(1);
    expect(userManager.getStatus.mock.calls.length).toBe(0);
    expect(addedGroup).toBeTruthy();
    // expect(addedGroup).toMatchObject(groupToAdd);
  });

  it('groupManager adds new groups with different types', () => {
    AppUtil.removeEmptyValues.mockClear();
    const groupsToAdd = [
      {
        _id: '00c789b',
        name: 'ProblemSolver',
        title: 'Solve all your problems.Expensive.',
        type: 'd',
      },
      {
        _id: '01S881b',
        name: 'jest',
        title: 'Jest is cool!',
        type: 'c',
      },
      {
        _id: '0200010',
        name: 'realm-secret-chat',
        title: 'Confidential!',
        type: 'private',
      },
    ];
    const transformedGroups = transformGroupsToObj(groupsToAdd);
    const expectedOnline = Object.assign({}, transformedGroups[0]);
    expectedOnline.status = 'online';
    userManager.getStatus = jest.fn(() => 'online');
    groupManager.addAll(transformedGroups);
    const addedGroups = groupManager.list.sorted('_id');

    expect(AppUtil.removeEmptyValues.mock.calls.length).toBe(3);
    expect(addedGroups).toBeTruthy();
    expect(addedGroups[0]).toMatchObject(expectedOnline);
    expect(addedGroups[1]).toMatchObject(transformedGroups[1]);
    expect(addedGroups[2]).toMatchObject(transformedGroups[2]);
  });

  it('groupManager updates an existing group', () => {
    AppUtil.removeEmptyValues.mockClear();
    const groupToAdd = {
      _id: '00c789b',
      name: 'ProblemSolver',
      type: 'd',
      avatar: 'http://problem-solver/avatar.png',
      avatarUpdatedAt: new Date(),
      roles: ['staff'],
    };

    const expectedGroup = Object.assign({}, groupToAdd);
    expectedGroup.title = 'Solve all your problems.Expensive.';
    expectedGroup.roles = { '0': 'staff' };
    groupManager.addAll(transformGroupsToObj([groupToAdd]));
    const addedGroup = groupManager.findById('00c789b');
    expect(AppUtil.removeEmptyValues.mock.calls.length).toBe(1);
    expect(addedGroup).toBeTruthy();
    expect(addedGroup).toMatchObject(expectedGroup);
  });

  it('groupManager deletes a group', () => {
    const group = { _id: 'T111111', name: 'testGroup', title: 'Test them all' };
    const groupToAdd = transformGroupsToObj([group]);
    groupManager.addAll(groupToAdd);

    groupManager.deleteGroups([group._id]);
    const deletedGroup = groupManager.findById(group._id);

    expect(deletedGroup).toBeNull();
  });

  it('groupManager updatesAvatar of a group', () => {
    groupManager.updateAvatar(groups[0]._id);
    const updatedGroup = groupManager.findById(groups[0]._id);
    expect(updatedGroup.avatarUpdatedAt).toEqual(expect.any(Date));
  });

  it('add bulk messages to groups with updating message', async () => {
    const messages = [
      {
        _id: '3TCbKtGNiRPsg6GxH',
        rid: 'yYBi36Mj6ihDimPZw',
        msg: 'Test @viswa ',
        ts: new Date(),
        u: {
          _id: 'Ri9cohELZeCwxmtvd',
          username: 'mohan',
          name: 'Mohanasundaram Jemini',
        },
        _updatedAt: new Date(),
        editedBy: null,
        editedAt: null,
        emoji: null,
        avatar: null,
        alias: null,
        customFields: null,
        attachments: null,
        mentions: [{ _id: 'zBprpnQD3DHPEuhQ3', username: 'viswa', name: 'viswa' }],
        channels: [],
      },
      {
        _id: 'dZnEXguAuY26tbnra',
        rid: 'yYBi36Mj6ihDimPZw',
        msg: 'hi ',
        ts: new Date(),
        u: {
          _id: 'tmRSSha8mp9buXcCA',
          username: 'sam',
          name: 'Swaminathan',
        },
        _updatedAt: new Date(),
        editedBy: null,
        editedAt: null,
        emoji: null,
        avatar: null,
        alias: null,
        customFields: null,
        attachments: null,
        mentions: [],
        channels: [],
      },
      {
        _id: 'dZnEXguAuY26tbnBa',
        rid: 'yYBi36Mj6ihDimPZw',
        msg: '',
        ts: new Date(),
        u: {
          _id: 'tmRSSha8mp9buXcCA',
          username: 'sam',
          name: 'Swaminathan',
        },
        _updatedAt: new Date(),
        editedBy: null,
        editedAt: null,
        emoji: null,
        avatar: null,
        alias: null,
        customFields: null,
        file: {
          _id: 'MTzAwLodSC3xbC5rE',
          name: '42996316_911373412400673_3227746340456890368_o.jpg',
          type: 'image/jpeg',
        },
        attachments: [
          {
            title: '42996316_911373412400673_3227746340456890368_o.jpg',
            title_link:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            title_link_download: true,
            image_url:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            type: 'file',
            text: 'this is description ?msg=(fHyUjkIjN)this is reply message',
            author_name: 'sam',
          },
        ],
        bot: true,
        mentions: [],
        channels: [],
      },
      {
        _id: 'dZnEXguAuY26tbnMMa',
        rid: 'yYBi36Mj6ihDimPZw',
        msg: '',
        ts: new Date(),
        u: {
          _id: 'tmRSSha8mp9buXcCA',
          username: 'sam',
          name: 'Swaminathan',
        },
        _updatedAt: new Date(),
        editedBy: null,
        editedAt: null,
        emoji: null,
        avatar: null,
        alias: null,
        customFields: null,
        file: {
          _id: 'MTzAwLodSC3xbC5rE',
          name: '42996316_911373412400673_3227746340456890368_o.jpg',
          type: 'image/jpeg',
        },
        attachments: [
          {
            title: '42996316_911373412400673_3227746340456890368_o.jpg',
            title_link:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            title_link_download: true,
            image_url:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            type: 'file',
            description: 'this is non bot description ?msg=(fHyUjkIjN)this is reply message',
            author_name: 'sam',
          },
        ],
        bot: false,
        mentions: [],
        channels: [],
      },
    ];
    console.log('ADD BULK MESSAGE CALLED');
    await groupManager.addBulkMessages(messages);
    const messageList = realmObj.objects(Constants.Message);
    expect(Object.keys(messageList).length).not.toBeLessThan(messages.length - 1); // one message is repeated
  });

  it('add earlier message ', async () => {
    const messages = [
      {
        _id: '3TCbKtGNiRPsg6GxHGY',
        rid: 'yYBi36Mj6ihDimPZw',
        msg: 'Test @viswa ',
        ts: new Date(),
        u: {
          _id: 'Ri9cohELZeCwxmtvd',
          username: 'mohan',
          name: 'Mohanasundaram Jemini',
        },
        _updatedAt: new Date(),
        editedBy: null,
        editedAt: null,
        emoji: null,
        avatar: null,
        alias: null,
        customFields: null,
        file: {
          _id: 'MTzAwLodSC3xbC5rE',
          name: '42996316_911373412400673_3227746340456890368_o.jpg',
          type: 'image/jpeg',
        },
        groupable: false,
        attachments: [
          {
            title: '42996316_911373412400673_3227746340456890368_o.jpg',
            title_link:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            title_link_download: true,
            image_url:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            type: 'file',
            description: '',
          },
        ],
        mentions: [{ _id: 'zBprpnQD3DHPEuhQ3', username: 'viswa', name: 'viswa' }],
        channels: [],
      },
      {
        _id: 'dZnEXguAuY26tbnraER',
        rid: 'yYBi36Mj6ihDimPZw',
        msg: 'hi ',
        ts: new Date(),
        u: {
          _id: 'tmRSSha8mp9buXcCA',
          username: 'sam',
          name: 'Swaminathan',
        },
        _updatedAt: new Date(),
        editedBy: null,
        editedAt: null,
        emoji: null,
        avatar: null,
        alias: null,
        customFields: null,
        attachments: null,
        mentions: [],
        channels: [],
      },
      {
        _id: 'dZnEXguAuY26tbnra',
        rid: 'yYBi36Mj6ihDimPZw',
        msg: 'hi updated',
        ts: new Date(),
        u: {
          _id: 'tmRSSha8mp9buXcCA',
          username: 'sam',
          name: 'Swaminathan',
        },
        _updatedAt: new Date(),
        editedBy: null,
        editedAt: null,
        emoji: null,
        avatar: null,
        alias: null,
        customFields: null,
        attachments: null,
        mentions: [],
        channels: [],
      },
      {
        _id: 'dZnEXguAuY26tbnBa',
        rid: 'yYBi36Mj6ihDimPZw',
        msg: '',
        ts: new Date(),
        u: {
          _id: 'tmRSSha8mp9buXcCA',
          username: 'sam',
          name: 'Swaminathan',
        },
        _updatedAt: new Date(),
        editedBy: null,
        editedAt: null,
        emoji: null,
        avatar: null,
        alias: null,
        customFields: null,
        file: {
          _id: 'MTzAwLodSC3xbC5rE',
          name: '42996316_911373412400673_3227746340456890368_o.jpg',
          type: 'image/jpeg',
        },
        attachments: [
          {
            title: '42996316_911373412400673_3227746340456890368_o.jpg',
            title_link:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            title_link_download: true,
            image_url:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            type: 'file',
            text: 'this is description ?msg=(fHyUjkIjN)this is reply message',
            author_name: 'sam',
          },
        ],
        bot: true,
        mentions: [],
        channels: [],
      },
      {
        _id: 'dZnEXguAuY26tbnBa',
        rid: 'yYBi36Mj6ihDimPZw',
        msg: '',
        ts: new Date(),
        u: {
          _id: 'tmRSSha8mp9buXcCA',
          username: 'sam',
          name: 'Swaminathan',
        },
        _updatedAt: new Date(),
        editedBy: null,
        editedAt: null,
        emoji: null,
        avatar: null,
        alias: null,
        customFields: null,
        file: {
          _id: 'MTzAwLodSC3xbC5rE',
          name: '42996316_911373412400673_3227746340456890368_o.jpg',
          type: 'image/jpeg',
        },
        attachments: [
          {
            title: '42996316_911373412400673_3227746340456890368_o.jpg',
            title_link:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            title_link_download: true,
            image_url:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            type: 'file',
            text: 'this is description 34 ?msg=(fHyUjkIjN)this is reply message',
            author_name: 'sam',
          },
        ],
        bot: true,
        mentions: [],
        channels: [],
      },
      {
        _id: 'dZnEXguAuY26tbnMMa',
        rid: 'yYBi36Mj6ihDimPZw',
        msg: '',
        ts: new Date(),
        u: {
          _id: 'tmRSSha8mp9buXcCA',
          username: 'sam',
          name: 'Swaminathan',
        },
        _updatedAt: new Date(),
        editedBy: null,
        editedAt: null,
        emoji: null,
        avatar: null,
        alias: null,
        customFields: null,
        file: {
          _id: 'MTzAwLodSC3xbC5rE',
          name: '42996316_911373412400673_3227746340456890368_o.jpg',
          type: 'image/jpeg',
        },
        attachments: [
          {
            title: '42996316_911373412400673_3227746340456890368_o.jpg',
            title_link:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            title_link_download: true,
            image_url:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            type: 'file',
            description: 'this is non bot description ?msg=(fHyUjkIjN)this is reply message',
            author_name: 'sam',
          },
        ],
        bot: false,
        mentions: [],
        channels: [],
      },
    ];
    console.log('ADD EARLIER MESSAGE with exsting message CALLED');
    await groupManager.addEarlierMessage(messages);
    const lastmessage = realmObj.objects(Constants.Message).filtered(`_id = "${messages[1]._id}"`);
    expect(lastmessage[0].text).toEqual(messages[1].msg);
    realmObj.write(() => {
      realmObj.delete(lastmessage);
    });
  });

  it('add earlier message with existing message', async () => {
    const messages = [
      {
        _id: 'dZnEXguAuY26tbnJUa',
        rid: 'yYBi36Mj6ihDimPZw',
        msg: '',
        ts: new Date(),
        u: {
          _id: 'tmRSSha8mp9buXcCA',
          username: 'sam',
          name: 'Swaminathan',
        },
        _updatedAt: new Date(),
        editedBy: null,
        editedAt: null,
        emoji: null,
        avatar: null,
        alias: null,
        customFields: null,
        file: {
          _id: 'MTzAwLodSC3xbC5rE',
          name: '42996316_911373412400673_3227746340456890368_o.jpg',
          type: 'image/jpeg',
        },
        attachments: [
          {
            title: '42996316_911373412400673_3227746340456890368_o.jpg',
            title_link:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            title_link_download: true,
            image_url:
              '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
            type: 'file',
            text: 'this is description 34 ?msg=(fHyUjkIjN)this is reply message',
            author_name: 'sam',
          },
        ],
        bot: true,
        mentions: [],
        channels: [],
      },
    ];
    console.log('ADD EARLIER MESSAGE WITH EXSITING CALLED');
    await groupManager.addEarlierMessage(messages);
    const lastmessage = realmObj.objects(Constants.Message).filtered(`_id = "${messages[0]._id}"`);
    expect(lastmessage[0].text).toEqual('this is reply message');
    realmObj.write(() => {
      realmObj.delete(lastmessage);
    });
  });
});

it('add message to realm Only ', async () => {
  const message = {
    _id: '3TCbKtGNiRPsg6GxV',
    rid: 'yYBi36Mj6ihDimPZw',
    group: 'XT87kg1',
    text: 'Test @viswa ',
    msg: 'Test @viswa ',
    ts: new Date(),
    u: {
      _id: 'Ri9cohELZeCwxmtvd',
      username: 'mohan',
      name: 'Mohanasundaram Jemini',
    },
    updatedAt: new Date(),
    editedBy: null,
    editedAt: new Date(),
    emoji: null,
    avatar: null,
    alias: null,
    customFields: null,
    attachments: null,
    mentions: [{ _id: 'zBprpnQD3DHPEuhQ3', username: 'viswa', name: 'viswa' }],
    channels: [],
    status: -1,
  };

  await groupManager.addMessageToRealmOnly(message);
  const lastmessage = realmObj.objects(Constants.Message).filtered(`_id = "${message._id}"`);
  expect(lastmessage[0].text).toEqual(message.msg);
  realmObj.write(() => {
    realmObj.delete(lastmessage);
  });
});

it('add message ', async () => {
  const message = {
    _id: '3TCbKtGNiRPsg6GxH',
    rid: 'yYBi36Mj6ihDimPZw',
    msg: 'Test @viswa ',
    ts: new Date(),
    u: {
      _id: 'Ri9cohELZeCwxmtvd',
      username: 'mohan',
      name: 'Mohanasundaram Jemini',
    },
    _updatedAt: new Date(),
    editedBy: null,
    editedAt: null,
    emoji: null,
    avatar: null,
    alias: null,
    customFields: null,
    attachments: null,
    mentions: [{ _id: 'zBprpnQD3DHPEuhQ3', username: 'viswa', name: 'viswa' }],
    channels: [],
  };

  await groupManager.addMessage(message);
  const lastmessage = realmObj.objects(Constants.Message).filtered(`_id = "${message._id}"`);
  expect(lastmessage[0].text).toEqual(message.msg);
  realmObj.write(() => {
    realmObj.delete(lastmessage);
  });
});

it('add message with attachment', async () => {
  const msg = {
    _id: '8dmJpGiqJSc7iTmyt',
    rid: '2FEAiSH4ezbFYW2jXtmRSSha8mp9buXcCA',
    ts: 'Wed Oct 31 2018 16:16:44 GMT+0530 (IST)',
    msg: '',
    file: {
      _id: 'MTzAwLodSC3xbC5rE',
      name: '42996316_911373412400673_3227746340456890368_o.mp3',
      type: 'video/mp3',
    },
    groupable: false,
    attachments: [
      {
        title: '42996316_911373412400673_3227746340456890368_o.mp3',
        title_link:
          '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.mp3',
        title_link_download: true,
        image_url:
          '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.mp3',
        type: 'file',
        description: '',
      },
    ],
    u: {
      _id: 'tmRSSha8mp9buXcCA',
      username: 'sam',
      name: 'Swaminathan',
    },
    unread: true,
    _updatedAt: 'Wed Oct 31 2018 16:16:44 GMT+0530 (IST)',
    editedBy: null,
    editedAt: null,
    emoji: null,
    avatar: null,
    alias: null,
    customFields: null,
    mentions: [],
    channels: [],
  };

  await groupManager.addMessage(msg);
  const lastmessage = realmObj.objects(Constants.Message).filtered(`_id = "${msg._id}"`);
  expect(lastmessage[0].text).toEqual(msg.msg);
  realmObj.write(() => {
    realmObj.delete(lastmessage);
  });
});

it('add message with attachment existing message', async () => {
  const msg = {
    _id: '8dmJpGiqJSc7iTmyt',
    rid: '2FEAiSH4ezbFYW2jXtmRSSha8mp9buXcCA',
    ts: 'Wed Oct 31 2018 16:16:44 GMT+0530 (IST)',
    msg: '',
    file: {
      _id: 'MTzAwLodSC3xbC5rE',
      name: '42996316_911373412400673_3227746340456890368_o.mp3',
      type: 'video/mp3',
    },
    groupable: false,
    attachments: [
      {
        title: '42996316_911373412400673_3227746340456890368_o.mp3',
        title_link:
          '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.mp3',
        title_link_download: true,
        image_url:
          '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.mp3',
        type: 'file',
        text: 'this is description ?msg=(fHyUjkIjN)this is reply message',
        author_name: 'sam',
      },
    ],
    u: {
      _id: 'tmRSSha8mp9buXcCA',
      username: 'sam',
      name: 'Swaminathan',
    },
    unread: true,
    _updatedAt: 'Wed Oct 31 2018 16:16:44 GMT+0530 (IST)',
    editedBy: null,
    editedAt: null,
    emoji: null,
    avatar: null,
    alias: null,
    bot: true,
    customFields: null,
    mentions: [],
    channels: [],
  };

  await groupManager.addMessage(msg);
  const lastmessage = realmObj.objects(Constants.Message).filtered(`_id = "${msg._id}"`);
  expect(lastmessage[0].text).toEqual('this is reply message');
  realmObj.write(() => {
    realmObj.delete(lastmessage);
  });
});

it('add message with image', async () => {
  const msg = {
    _id: '8dmJpGiqJSc7iTmyB',
    rid: '2FEAiSH4ezbFYW2jXtmRSSha8mp9buXcCA',
    ts: 'Wed Oct 31 2018 16:16:44 GMT+0530 (IST)',
    msg: 'with file',
    file: {
      _id: 'MTzAwLodSC3xbC5rE',
      name: '42996316_911373412400673_3227746340456890368_o.jpg',
      type: 'image/jpeg',
    },
    groupable: false,
    attachments: [
      {
        title: '42996316_911373412400673_3227746340456890368_o.jpg',
        title_link:
          '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
        title_link_download: true,
        image_url:
          '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
        type: 'file',
        description: '',
      },
    ],
    u: {
      _id: 'tmRSSha8mp9buXcCA',
      username: 'sam',
      name: 'Swaminathan',
    },
    unread: true,
    _updatedAt: 'Wed Oct 31 2018 16:16:44 GMT+0530 (IST)',
    editedBy: null,
    editedAt: null,
    emoji: null,
    avatar: null,
    alias: null,
    customFields: null,
    mentions: [],
    channels: [],
  };

  await groupManager.addMessage(msg);
  const lastmessage = realmObj.objects(Constants.Message).filtered(`_id = "${msg._id}"`);
  expect(lastmessage[0].text).toEqual(msg.msg);
  realmObj.write(() => {
    realmObj.delete(lastmessage);
  });
});

// it('add message with image', async () => {
//   const msg = {
//     _id: '8dmJpGiqJSc7iThYu',
//     rid: '2FEAiSH4ezbFYW2jXtmRSSha8mp9buXcCA',
//     ts: 'Wed Oct 31 2018 16:16:44 GMT+0530 (IST)',
//     msg: 'with file',
//     file: {
//       _id: 'MTzAwLodSC3xbC5rE',
//       name: '42996316_911373412400673_3227746340456890368_o.jpg',
//       type: 'image/jpeg',
//     },
//     groupable: false,
//     attachments: [
//       {
//         title: '42996316_911373412400673_3227746340456890368_o.jpg',
//         title_link:
//           '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
//         title_link_download: true,
//         image_url:
//           '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
//         type: 'file',
//         description: '',
//       },
//     ],
//     u: {
//       _id: 'tmRSSha8mp9buXcCA',
//       username: 'sam',
//       name: 'Swaminathan',
//     },
//     unread: true,
//     _updatedAt: 'Wed Oct 31 2018 16:16:44 GMT+0530 (IST)',
//     editedBy: null,
//     editedAt: null,
//     emoji: null,
//     avatar: null,
//     alias: null,
//     customFields: null,
//     mentions: [],
//     channels: [],
//   };

//   await groupManager.addEarlierMessage(msg);
//   const lastmessage = realmObj.objects(Constants.Message).filtered(`_id = "${msg._id}"`);
//   expect(lastmessage[0].text).toEqual(msg.msg);
//   realmObj.write(() => {
//     realmObj.delete(lastmessage);
//   });
// });

it('update message ', async () => {
  const message = {
    _id: '3TCbKtGNiRPsg6GxH',
    rid: 'yYBi36Mj6ihDimPZw',
    msg: 'Test @viswa ',
    // ts: new Date(),
    u: {
      _id: 'Ri9cohELZeCwxmtvd',
      username: 'mohan',
      name: 'Mohanasundaram Jemini',
    },
    // _updatedAt: new Date(),
    editedBy: null,
    editedAt: null,
    emoji: null,
    avatar: null,
    attachments: [
      {
        title: '42996316_911373412400673_3227746340456890368_o.jpg',
        title_link:
          '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
        title_link_download: true,
        image_url:
          '/file-upload/MTzAwLodSC3xbC5rE/42996316_911373412400673_3227746340456890368_o.jpg',
        type: 'file',
        description: '',
      },
    ],
    bot: true,
    mentions: [{ _id: 'zBprpnQD3DHPEuhQ3', username: 'viswa', name: 'viswa' }],
    channels: [],
  };

  const messageTwo = {
    _id: '3TCbKtGNiRPsg6GxH',
    rid: 'yYBi36Mj6ihDimPZw',
    msg: 'Test @viswa sws',
    ts: new Date(),
    u: {
      _id: 'Ri9cohELZeCwxmtvd',
      username: 'mohan',
      name: 'Mohanasundaram Jemini',
    },
    _updatedAt: new Date(),
    editedBy: null,
    editedAt: null,
    emoji: null,
    avatar: null,
    alias: null,
    customFields: null,
    attachments: null,
    mentions: [{ _id: 'zBprpnQD3DHPEuhQ3', username: 'viswa', name: 'viswa' }],
    channels: [],
  };
  await groupManager.addMessage(message);
  await groupManager.addMessage(messageTwo);
  const lastmessage = realmObj.objects(Constants.Message).filtered(`_id = "${message._id}"`);
  expect(lastmessage[0].text).toEqual(messageTwo.msg);
});

it('adds unread message', async () => {
  const messageToAdd = {
    _id: 'fsdfsf34547',
    rid: 'CAT7891yi7',
    u: { _id: '6x57tfs', username: 'linux000', name: 'Guess' },
    msg: 'Good night!',
    ts: new Date(),
    // _updatedAt: new Date(),
    unread: true,
  };
  //  expect.assertions(1);
  await groupManager.addMessage(messageToAdd);
  // const groupWithUnreadMessage = realmObj
  //   .objects(Constants.Group)
  //   .filtered(`_id = "${messageToAdd.rid}"`);
  // expect(groupWithUnreadMessage[0].unread).toBe(1);
});

it('adds unread messages', async () => {
  const messageToAdd1 = {
    _id: 'Iop872Gp002',
    rid: 'CAT7891yi7',
    u: { _id: '6x57td', username: 'linux000', name: 'Guess' },
    msg: 'Are you here?',
    ts: new Date(),
    // _updatedAt: new Date(),
    unread: true,
  };
  const messageToAdd2 = {
    _id: 'Iop872Gp003',
    rid: 'CAT7891yi9',
    u: { _id: '6x57td', username: 'linux000', name: 'Guess' },
    msg: '@SnowWhite',
    // ts: new Date(),
    // _updatedAt: new Date(),
    unread: true,
  };

  const messageToAdd3 = {
    _id: 'Iop872Gp004',
    rid: 'CAT7891yi9',
    u: { _id: '6x57td', username: 'linux000', name: 'Guess' },
    msg: '@SnowWhite2',
    status: -1,
    // ts: new Date(),
    // _updatedAt: new Date(),
    unread: true,
  };

  const messageToAdd4 = {
    _id: 'Iop872Gp005',
    rid: 'CAT7891yi9',
    u: { _id: '6x57td', username: 'linux000', name: 'Guess' },
    msg: '@SnowWhite3',
    status: 0,
    // ts: new Date(),
    // _updatedAt: new Date(),
    unread: true,
  };

  const bulkMessages = {
    '0': messageToAdd1,
    '1': messageToAdd2,
    '2': messageToAdd3,
    '3': messageToAdd4,
  };
  await groupManager.addBulkMessages(bulkMessages);
  const lastmessageID = groupManager.getLastMessage('CAT7891yi7');

  const { sortedList } = groupManager;
  sortedList.filtered(`_id = "${lastmessageID.group}"`);

  // expect(groupWithUnredMessage[0].unread).toBe(1);
});

it('get group messages', async () => {
  const groupMessages = groupManager.getGroupMessages('CAT7891yi9');
  const lastmessageID = groupManager.getLastMessage('CAT7891yi9');
  expect(groupMessages[groupMessages.length - 1]._id === lastmessageID._id);
});

it('get group messages ascending', async () => {
  const groupMessages = groupManager.getGroupMessagesAscending('CAT7891yi9');
  const lastmessageID = groupManager.getFirstMessage('CAT7891yi9');
  expect(groupMessages[groupMessages.length - 1]._id === lastmessageID._id);
});

it('groupManager sets group as read', () => {
  groupManager.setGroupAsRead(groups[0]._id);
  const updatedGroup = groupManager.findById(groups[0]._id);
  expect(updatedGroup.unread).toBe(0);
});

it('groupManager updates group status', () => {
  userManager.getStatus = jest.fn(() => 'online');
  groupManager.updateGroupsStatus();
  const updatedGroup1 = groupManager.findById('CAT7891yi7');
  const updatedGroup2 = groupManager.findById('00c789b');
  expect(updatedGroup1.status).toMatch('online');
  expect(updatedGroup2.status).toMatch('online');
});

it('groupManager setAllGroupsOffline ', () => {
  userManager.getStatus = jest.fn(() => 'offline');
  groupManager.setAllGroupsOffline();
  const updatedGroup1 = groupManager.findById('CAT7891yi7');
  const updatedGroup2 = groupManager.findById('00c789b');
  expect(updatedGroup1.status).toMatch('offline');
  expect(updatedGroup2.status).toMatch('offline');
});

it('groupManager gets undelivered messages', async () => {
  const message = {
    _id: '3TCbKtGNiRPsg6GrU',
    rid: 'yYBi36Mj6ihDimPZw',
    group: 'XT87kg1',
    text: 'Test @viswa 4367',
    msg: 'Test @viswa 4367',
    ts: new Date(),
    user: {
      _id: 'Ri9cohELZeCwxmtvd',
      username: 'mohan',
      name: 'Mohanasundaram Jemini',
    },
    updatedAt: new Date(),
    editedBy: null,
    editedAt: new Date(),
    emoji: null,
    avatar: null,
    alias: null,
    customFields: null,
    attachments: null,
    mentions: [{ _id: 'zBprpnQD3DHPEuhQ3', username: 'viswa', name: 'viswa' }],
    channels: [],
    status: 0,
  };

  await groupManager.addMessageToRealmOnly(message);

  const undelivered = await groupManager.getUndeliveredMessages('XT87kg1');
  expect(undelivered).toBeInstanceOf(Array);
  expect(undelivered.length).toBeGreaterThan(0);
});

it('groupManager gets deleted messages', async () => {
  const message = {
    _id: '3TCbKtGNiRPsg6GVb',
    rid: 'yYBi36Mj6ihDimPZw',
    group: 'XT87kg1',
    text: 'Test @viswa 2345',
    msg: 'Test @viswa 2345',
    ts: new Date(),
    user: {
      _id: 'Ri9cohELZeCwxmtvd',
      username: 'mohan',
      name: 'Mohanasundaram Jemini',
    },
    updatedAt: new Date(),
    editedBy: null,
    editedAt: new Date(),
    emoji: null,
    avatar: null,
    alias: null,
    customFields: null,
    attachments: null,
    mentions: [{ _id: 'zBprpnQD3DHPEuhQ3', username: 'viswa', name: 'viswa' }],
    channels: [],
    status: -1,
  };

  await groupManager.addMessageToRealmOnly(message);

  const undeleted = await groupManager.getDeletedMessages('XT87kg1');
  expect(undeleted).toBeInstanceOf(Array);
  expect(undeleted.length).toBeGreaterThan(0);
});

it('groupManager getGroupRoles', async () => {
  const getGroupRoles = await groupManager.getGroupRoles('00c789b');
  expect(getGroupRoles).toBeInstanceOf(Object);
  expect(Object.keys(getGroupRoles).length).toBeGreaterThan(0);
});

it('groupManager buildFileMessage', () => {
  const args = {
    data: {
      uri: '',
    },
    rid: 'RtbgJUHM7&GHNJ',
    isImage: true,
  };
  const buildFileMessage = groupManager.buildFileMessage(args);
  expect(buildFileMessage).toBeInstanceOf(Object);
});

it('groupManager buildTextMessage', () => {
  const args = {
    data: {
      uri: '',
    },
    groupId: 'RtbgJUHM7&GHNJ',
    message: {
      text: 'build text message',
    },
  };
  const buildTextMessage = groupManager.buildTextMessage(args);
  expect(buildTextMessage).toBeInstanceOf(Object);
});

it('groupManager buildThreadedMessage', () => {
  const args = {
    data: {
      uri: '',
    },
    groupId: 'RtbgJUHM7&GHNJ',
    groupObj: {
      type: 'private',
    },
    replyMsgId: 'YhFnMkiklLJjhj',
    message: {
      text: 'build text message',
    },
    serverURL: 'corp.mng.com',
  };
  const buildThreadedMessage = groupManager.buildThreadedMessage(args);
  expect(buildThreadedMessage).toBeInstanceOf(Object);
});

it('groupManager buildThreadedMessage with group obj c', () => {
  const args = {
    data: {
      uri: '',
    },
    groupId: 'RtbgJUHM7&GHNJ',
    groupObj: {
      type: 'c',
    },
    replyMsgId: 'YhFnMkiklLJjhj',
    message: {
      text: 'build text message',
    },
    serverURL: 'corp.mng.com',
  };
  const buildThreadedMessage = groupManager.buildThreadedMessage(args);
  expect(buildThreadedMessage).toBeInstanceOf(Object);
});

it('groupManager buildThreadedMessage with group obj c', () => {
  const args = {
    data: {
      uri: '',
    },
    groupId: 'RtbgJUHM7&GHNJ',
    groupObj: {
      type: 'd',
    },
    replyMsgId: 'YhFnMkiklLJjhj',
    message: {
      text: 'build text message',
    },
    serverURL: 'corp.mng.com',
  };
  const buildThreadedMessage = groupManager.buildThreadedMessage(args);
  expect(buildThreadedMessage).toBeInstanceOf(Object);
});

it('groupManager finds a messages by id', () => {
  // message is in db
  const msgId1 = '3TCbKtGNiRPsg6GxH';
  const msgId2 = '3TCbKtGNiRPsg6GxY';

  const message1 = groupManager.findMessageById(msgId1);
  expect(message1).toBeInstanceOf(Object);
  expect(message1._id).toMatch(msgId1);

  const message2 = groupManager.findMessageById(msgId2);
  expect(message2).toBeNull();
});

it('groupManager finds a findRootMessage', () => {
  // message is in db
  const msgId1 = '3TCbKtGNiRPsg6GxH';
  const msgId2 = '3TCbKtGNiRPsg6GxY';

  const message1 = groupManager.findRootMessage(msgId1);
  expect(message1).toBeInstanceOf(Object);
  expect(message1._id).toMatch(msgId1);

  const message2 = groupManager.findRootMessage(msgId2);
  expect(message2).toBeInstanceOf(Object);
  expect(message2._id).toMatch(msgId2);
});

it('groupManager gets first message', () => {
  const firstMessage = groupManager.getFirstMessage('CAT7891yi9');
  expect(firstMessage).toBeInstanceOf(Object);
});

it('groupManager gets group members', () => {
  const members = groupManager.getMembers();
  expect(members.length).toBeGreaterThan(0);
});

it('groupManager changes a message status to delivered', async () => {
  const message = {
    _id: '123-XXX-234-YYY',
    rid: 'CAT7891yi7',
    u: { _id: '6x57td', username: 'linux000', name: 'Guess' },
    msg: 'Happy to see you today :))',
    ts: new Date(),
    _updatedAt: new Date(),
    unread: false,
    status: 0,
  };
  await groupManager.addMessage(message);
  await groupManager.setMessageDelivered(message._id);
  const updatedMessage = groupManager.findMessageById(message._id);
  expect(updatedMessage.status).toBe(10);
});

it('groupManager does not changes a message status to delivered', () => {
  const message = {
    _id: '123-XXX-234-YYZ',
    rid: 'CAT7891yi7',
    u: { _id: '6x57td', username: 'linux000', name: 'Guess' },
    msg: 'Happy to see you today :))',
    ts: new Date(),
    _updatedAt: new Date(),
    unread: false,
    status: 0,
  };
  groupManager.setMessageDelivered(message._id);
  const updatedMessage = groupManager.findMessageById(message._id);
  expect(updatedMessage).toBeNull();
});

it('groupManager set message as deleted', () => {
  const message = {
    _id: '123-XXX-234-YYY',
    rid: 'CAT7891yi7',
    u: { _id: '6x57td', username: 'linux000', name: 'Guess' },
    msg: 'Happy to see you today :))',
    ts: new Date(),
    _updatedAt: new Date(),
    unread: false,
    status: 0,
  };
  groupManager.setMessageDeleted(message._id, 'CAT7891yi7');
  const updatedMessage = groupManager.findMessageById(message._id);
  expect(updatedMessage.status).toBe(-1);
});

it('groupManager setFileUploadPercent', () => {
  groupManager.setFileUploadPercent('123-XXX-234-YYY', '67');
  const updatedMessage = groupManager.findMessageById('123-XXX-234-YYY');
  expect(updatedMessage.uploadFilePercent).toBe(67);
});

it('groupManager getNumOfMessageReplies', () => {
  groupManager.getNumOfMessageReplies('message._id', 'CAT7891yi7');
  const updatedMessage = groupManager.getGroupMessages('message._id');
  const findmessage = groupManager.findMessageById('123-XXX-234-YYY');

  expect(updatedMessage).toBe('CAT7891yi7');
  expect(findmessage).toBe('CAT7891yi7');
});
it('groupManager emojiText', () => {
  const emojiText = groupManager.unemojifyMessageText('123-XXX-234-YYY');
  expect(emojiText).toBe('123-XXX-234-YYY');
});

it('groupManager delete message', () => {
  groupManager.deleteMessage('CAT7891yi7', '123-XXX-234-YYY');
  const updatedMessage = groupManager.findMessageById('123-XXX-234-YYY');
  expect(updatedMessage).toBeNull();
});

it('groupManager get goup by ID', () => {
  const group = groupManager.getGroupById('CAT7891yi7');
  // const updatedMessage = groupManager.getGroupById("CAT7891yi7");
  expect(group).toBeTruthy();
});

it('groupManager updateNoMoreMessages of a group', () => {
  groupManager.updateNoMoreMessages('CAT7891yi7');
  const updatedMessage = groupManager.findMessageById('CAT7891yi7');
  // expect(updatedGroup.avatarUpdatedAt).toEqual(expect.any(Date));
  expect(updatedMessage).toBeTruthy();
});
