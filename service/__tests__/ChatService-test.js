import InCallManager from 'react-native-incall-manager';
import PushNotification from 'react-native-push-notification';
import ChatService from '../ChatService';
import { Application } from '@mongrov/config';

jest.mock('react-native-incall-manager', () => ({
  startRingtone: jest.fn(),
  turnScreenOn: jest.fn(),
  stopRingtone: jest.fn(),
}));

jest.mock('react-native-push-notification', () => ({
  cancelAllLocalNotifications: jest.fn(),
  localNotificationSchedule: jest.fn(),
}));

jest.useFakeTimers();
jest.spyOn(Date, 'now').mockImplementation(() => 1479427200000);

const RC = {
  dataToGroupSchemaConverter: jest.fn((group) => group),
  _room2group: jest.fn((room) => room),
  subscribeToGroups: jest.fn(),
};

class GroupManager {
  constructor() {
    console.log('group manager');
  }
}

class UserManager {
  constructor() {
    console.log('user manager');
  }
}

const groupManager = new GroupManager();
const userManager = new UserManager();

class ChatTaskManager {
  constructor() {
    this._userManager = userManager;
  }
}

const chatTaskManager = new ChatTaskManager(userManager);
const chatService = new ChatService(RC, groupManager, chatTaskManager);

it('chatService is instantiated successfully', () => {
  expect(chatService).toBeTruthy();
  expect(chatService).toBeInstanceOf(ChatService);
  expect(chatService._provider).toEqual(RC);
  expect(chatService._groupManager).toEqual(groupManager);
  expect(chatService._chatTaskManager).toEqual(chatTaskManager);
});

it('chatService is instantiated successfully without provider', () => {
  const chatServiceWithoutProvider = new ChatService();
  expect(chatServiceWithoutProvider).toBeTruthy();
  expect(chatServiceWithoutProvider).toBeInstanceOf(ChatService);
  expect(chatServiceWithoutProvider._provider).toBeUndefined();
  expect(chatServiceWithoutProvider._groupManager).toBeUndefined();
  // expect(chatServiceWithoutProvider._appManager).toBeUndefined();
});

describe('_removeUserFromGroups', () => {
  it('calls deleteGroups', async () => {
    const group = [
      {
        _id: 'ABCDEF',
      },
    ];
    const groupinNO = [
      {
        _id: 'ABCDEFG',
      },
    ];
    RC.getUserRooms = jest.fn(() => groupinNO);
    chatService._groupManager.deleteGroups = jest.fn();
    expect.assertions(1);
    await chatService._removeUserFromGroups(group);
    expect(chatService._groupManager.deleteGroups.mock.calls.length).toBe(1);
  });

  it('no groups to delete', async () => {
    const group = [
      {
        _id: 'ABCDEF',
      },
    ];
    const groupinNO = [
      {
        _id: 'ABCDEF',
      },
    ];
    RC.getUserRooms = jest.fn(() => groupinNO);
    chatService._groupManager.deleteGroups = jest.fn();
    expect.assertions(1);
    await chatService._removeUserFromGroups(group);
    expect(chatService._groupManager.deleteGroups.mock.calls.length).toBe(0);
  });
});

describe('_getDeleteMessageRoles', () => {
  it('permission error ', async () => {
    chatTaskManager._userManager = { deleteMessageRoles: null };
    RC.getPermissions = jest.fn(() => Promise.reject(new Error('error')));
    expect.assertions(1);
    const roles = await chatService._getDeleteMessageRoles();
    expect(roles).toBeUndefined();
  });

  it('delete permission present in local db', async () => {
    const permission = [{ _id: 'delete-message', roles: ['owner'] }];
    RC.getPermissions = jest.fn(() => permission);
    chatTaskManager._userManager = { deleteMessageRoles: ['user'] };
    expect.assertions(1);
    const getPermission = await chatService._getDeleteMessageRoles();
    expect(getPermission).toEqual(['user']);
  });

  it('delete permission present', async () => {
    const permission = [{ _id: 'delete-message', roles: ['owner'] }];
    RC.getPermissions = jest.fn(() => permission);
    chatTaskManager._userManager = {
      deleteMessageRoles: null,
      setDeleteMessageRoles: jest.fn(),
    };
    expect.assertions(3);
    const getPermission = await chatService._getDeleteMessageRoles();
    expect(getPermission).toBe(permission[0].roles);
    expect(RC.getPermissions).toBeCalled();
    expect(chatTaskManager._userManager.setDeleteMessageRoles).toBeCalled();
  });

  it('no delete permission ', async () => {
    const permission = [{ _id: 'delete-user', roles: ['admin'] }];
    RC.getPermissions = jest.fn(() => permission);
    chatTaskManager._userManager = {
      deleteMessageRoles: null,
      setDeleteMessageRoles: jest.fn(),
    };
    expect.assertions(1);
    const getPermission = await chatService._getDeleteMessageRoles();
    expect(getPermission).toBeNull();
  });
});

describe('chatService handles subscription changes', () => {
  it('handles a case when the user is removed from a group', () => {
    RC.dataToGroupSchemaConverter.mockClear();
    chatService._removeUserFromGroups = jest.fn();
    const result = {
      eventName: '5X7hf7s98dd/subscriptions-changed',
      args: [
        'removed',
        {
          _id: 'R98765541',
          u: { _id: '5X7hf7s98dd' },
        },
      ],
    };

    chatService.handleSubscriptionChanges(result);
    expect(chatService._removeUserFromGroups.mock.calls.length).toBe(1);
    // expect(RC.dataToGroupSchemaConverter.mock.calls[0][0]).toEqual([result.args[1]]);
    // expect(returnedValue[0]).toEqual(result.args[1]);
  });

  it('handles a case when a group is updated', () => {
    RC.dataToGroupSchemaConverter.mockClear();
    groupManager.addAll = jest.fn();
    const result = {
      eventName: '5X7hf7s98dd/subscriptions-changed',
      args: [
        'updated',
        {
          _id: 'I98765541',
          u: { _id: '5X7hf7s98dd' },
        },
      ],
    };

    chatService.handleSubscriptionChanges(result);
    expect(RC.dataToGroupSchemaConverter.mock.calls.length).toBe(1);
    expect(RC.dataToGroupSchemaConverter.mock.calls[0][0]).toEqual([result.args[1]]);
    expect(groupManager.addAll.mock.calls.length).toBe(1);
    expect(groupManager.addAll.mock.calls[0][0]).toEqual([result.args[1]]);
  });

  it('handles a case when the user is inserted to a group', async () => {
    RC.dataToGroupSchemaConverter.mockClear();
    RC.subscribeToGroups.mockClear();
    groupManager.addAll = jest.fn();
    chatService._chatTaskManager.fetchMessageJob = jest.fn();
    const result = {
      eventName: '5X7hf7s98dd/subscriptions-changed',
      args: [
        'inserted',
        {
          _id: 'I98765541',
          u: { _id: '5X7hf7s98dd' },
        },
      ],
    };

    await chatService.handleSubscriptionChanges(result);
    expect(RC.dataToGroupSchemaConverter.mock.calls.length).toBe(1);
    expect(RC.dataToGroupSchemaConverter.mock.calls[0][0]).toEqual([result.args[1]]);
    expect(groupManager.addAll.mock.calls.length).toBe(1);
    expect(groupManager.addAll.mock.calls[0][0]).toEqual([result.args[1]]);
    expect(RC.subscribeToGroups.mock.calls.length).toBe(1);
    expect(RC.subscribeToGroups.mock.calls[0][0]).toEqual([result.args[1]]);
  });

  // it('handles a case when a group is updated', () => {
  //   RC.dataToGroupSchemaConverter.mockClear();
  //   groupManager.addAll = jest.fn();
  //   const result = {
  //     eventName: '5X7hf7s98dd/subscriptions-changed',
  //     args: [
  //       'updated',
  //       {
  //         _id: 'I98765541',
  //         u: { _id: '5X7hf7s98dd' },
  //       },
  //     ],
  //   };

  //   chatService.handleSubscriptionChanges(result);
  //   expect(RC.dataToGroupSchemaConverter.mock.calls.length).toBe(1);
  //   expect(RC.dataToGroupSchemaConverter.mock.calls[0][0]).toEqual([result.args[1]]);
  //   expect(groupManager.addAll.mock.calls.length).toBe(1);
  //   expect(groupManager.addAll.mock.calls[0][0]).toEqual([result.args[1]]);
  // });
});

describe('streamNotifyRoomDeletedMessage room changes', () => {
  it('calls deleteMessage', () => {
    const results = [
      {
        eventName: '5X7hf7s98dd/deleteMessage',
        args: [
          'updated',
          {
            _id: 'R98765541',
            rid: 'H57Up98a',
            name: 'room-1',
            u: { _id: '5X7hf7s98dd' },
          },
        ],
      },
    ];
    chatService._groupManager.deleteMessage = jest.fn();
    chatService.streamNotifyRoomDeletedMessage(results);
    expect(chatService._groupManager.deleteMessage.mock.calls.length).toBe(1);
  });

  it('results are empty', () => {
    const results = [];
    chatService._groupManager.deleteMessage = jest.fn();
    chatService.streamNotifyRoomDeletedMessage(results);
    expect(chatService._groupManager.deleteMessage.mock.calls.length).toBe(0);
  });

  it('results have no deleteMessage event', () => {
    const results = [
      {
        eventName: '5X7hf7s98dd/saveMessage',
        args: [
          'updated',
          {
            _id: 'R98765541',
            rid: 'H57Up98a',
            name: 'room-1',
            u: { _id: '5X7hf7s98dd' },
          },
        ],
      },
    ];
    chatService._groupManager.deleteMessage = jest.fn();
    chatService.streamNotifyRoomDeletedMessage(results);
    expect(chatService._groupManager.deleteMessage.mock.calls.length).toBe(0);
  });
});

describe('chatService handles room changes', () => {
  it('updates the room when the room is changed', () => {
    RC._room2group.mockClear();
    groupManager.addAll = jest.fn();
    const result = {
      eventName: '5X7hf7s98dd/rooms-changed',
      args: [
        'updated',
        {
          _id: 'R98765541',
          rid: 'H57Up98a',
          name: 'room-1',
          u: { _id: '5X7hf7s98dd' },
        },
      ],
    };
    chatService.handleRoomChanges(result);
    expect(RC._room2group.mock.calls.length).toBe(1);
    expect(RC._room2group.mock.calls[0][0]).toEqual([result.args[1]]);
    expect(groupManager.addAll.mock.calls.length).toBe(1);
    expect(groupManager.addAll.mock.calls[0][0]).toEqual([result.args[1]]);
  });

  it('doesn\'t updates the room when the room status is not "updated"', () => {
    RC._room2group.mockClear();
    groupManager.addAll = jest.fn();
    const result = {
      eventName: '5X7hf7s98dd/rooms-changed',
      args: [
        'disappeared',
        {
          _id: 'R98765541',
          rid: 'H57Up98a',
          name: 'room-1',
          u: { _id: '5X7hf7s98dd' },
        },
      ],
    };
    chatService.handleRoomChanges(result);
    expect(RC._room2group.mock.calls.length).toBe(0);
    expect(groupManager.addAll.mock.calls.length).toBe(0);
  });
});

it('chatService updates avatar of an existing group', () => {
  groupManager.list = {
    filtered: jest.fn(() => ({
      '0': { _id: 'TY87kg1', name: 'test010203', title: 'test010203' },
    })),
  };
  groupManager.updateAvatar = jest.fn();

  const result = {
    eventName: '5X7hf7s98dd/updateAvatar',
    args: [{ username: 'test010203' }],
  };

  const returnedValue = chatService.avatarUpdates(result);
  expect(groupManager.list.filtered.mock.calls.length).toBe(1);
  expect(groupManager.updateAvatar.mock.calls.length).toBe(1);
  expect(returnedValue).toBeUndefined();
});

it("chatService doesn't update avatar of non-existing group", () => {
  groupManager.list = { filtered: jest.fn(() => [{}]) };
  groupManager.updateAvatar = jest.fn();
  const result = {
    eventName: '5X7hf7s98dd/updateAvatar',
    args: [{ username: 'test010203' }],
  };
  const returnedValue = chatService.avatarUpdates(result);
  expect(groupManager.list.filtered.mock.calls.length).toBe(1);
  expect(groupManager.updateAvatar.mock.calls.length).toBe(0);
  expect(returnedValue).toBeUndefined();
});

// TODO: need to be updated with changes in a corresponding function
it('chatService handles a notification about a new message', () => {
  const result = {
    eventName: '5X7hf7s98dd/notification',
    args: [
      'message',
      {
        _id: 'M98765041',
        msg: 'Hello User!',
        from: '6x57td',
      },
    ],
  };
  const returnedValue = chatService.newNotification(result);
  expect(returnedValue).toBeUndefined();
});

// TODO: need to be updated with changes in a corresponding function
it('chatService handles a notification about a new message', () => {
  const result = {
    eventName: '5X7hf7s98dd/event',
    args: [
      'something changed',
      {
        _id: 'Unknown01',
        change: 'some change',
      },
    ],
  };
  const returnedValue = chatService.streamNotifyUser(result);
  expect(returnedValue).toBeUndefined();
});

it('chatService adds messages', () => {
  const chService = new ChatService(RC, groupManager, chatTaskManager);
  groupManager.addMessage = jest.fn();
  chService._userManager.loggedInUser = { _id: 'X1Z226699' };
  chService.ringtoneStatus = false;
  chService.notificationPush = jest.fn();
  const results = [
    {
      eventName: '5X7hf7s98dd/notification',
      args: [
        {
          _id: 'message1',
          t: 'some text',
          u: { _id: 'C85jO13lP1' },
          unread: true,
        },
      ],
    },
    {
      eventName: '5X7hf7s98dd/notification',
      args: [
        {
          _id: 'message2',
          t: 'mgvc_call_started',
          u: { _id: 'X85jO13lP1' },
          unread: true,
        },
      ],
    },
  ];
  chService.streamNotifyRoomMessage(results);
  expect(groupManager.addMessage.mock.calls.length).toBe(2);
  expect(InCallManager.startRingtone.mock.calls.length).toBe(1);
  expect(InCallManager.turnScreenOn.mock.calls.length).toBe(1);
  expect(chService.ringtoneStatus).toBe(true);
  expect(InCallManager.stopRingtone.mock.calls.length).toBe(0);
  jest.runAllTimers();
  expect(InCallManager.stopRingtone.mock.calls.length).toBe(1);
  expect(chService.notificationPush.mock.calls.length).toBe(1);
});

it('chatService pushes notifications', () => {
  const chService = new ChatService(RC, groupManager, chatTaskManager);
  const message = {
    _id: 'message2',
    rid: 'SOS777777',
    t: 'mgvc_call_started',
    u: { _id: 'X85jO13lP1', username: 'hero' },
    unread: true,
  };
  const expected = {
    message: `Video Calling ${message.u.username}`,
    playSound: true,
    autoCancel: false,
    vcData: {
      groupId: message.rid,
      userId: message.u._id,
      action: 'videoCall',
    },
    date: new Date(Date.now()),
    actions: '["Accept", "Reject"]',
  };
  chService.notificationPush(message);
  // expect(PushNotification.cancelAllLocalNotifications.mock.calls.length).toBe(1);
  expect(PushNotification.localNotificationSchedule.mock.calls.length).toBe(1);
  expect(PushNotification.localNotificationSchedule).toBeCalledWith(expected);
});

describe('canDeleteMessageFromGroup', () => {
  const ChService = new ChatService(RC, groupManager, chatTaskManager);

  it('failed with an error', async () => {
    const error = new Error('nobody can delete messages');
    Application.APPCONFIG = { CHECK_FOR_DISCOVER: true };
    ChService._getDeleteMessageRoles = jest.fn(() => Promise.reject(error));
    ChService._groupManager.getGroupRoles = jest.fn();
    // userManager.userRoles = [];
    // userManager.isCurrentUserAdmin = jest.fn(() => Promise.resolve(true));
    expect.assertions(3);
    const canDelete = await ChService.canDeleteMessageFromGroup('123456XXX');
    expect(ChService._getDeleteMessageRoles).toBeCalled();
    expect(ChService._groupManager.getGroupRoles).not.toBeCalled();
    expect(canDelete).toBeUndefined();
  });

  it('returns false with discover === true', async () => {
    const deleteMessageRoles = ['admin', 'super-user', 'Santa-Claus'];
    const groupRoles = [];
    Application.APPCONFIG = { CHECK_FOR_DISCOVER: true };
    chatTaskManager._userManager.userRoles = [];
    ChService._getDeleteMessageRoles = jest.fn(() => Promise.resolve(deleteMessageRoles));
    groupManager.getGroupRoles = jest.fn(() => groupRoles);
    expect.assertions(3);
    const canDelete = await ChService.canDeleteMessageFromGroup('123456XXX');
    expect(ChService._getDeleteMessageRoles).toBeCalled();
    expect(groupManager.getGroupRoles).toBeCalled();
    expect(canDelete).toBe(false);
  });

  it('returns true with discover === true', async () => {
    const deleteMessageRoles = ['admin', 'super-user', 'Santa-Claus'];
    const groupRoles = ['user', 'guest', 'naughty-junior'];
    Application.APPCONFIG = { CHECK_FOR_DISCOVER: true };
    chatTaskManager._userManager.userRoles = ['super-user'];
    ChService._getDeleteMessageRoles = jest.fn(() => Promise.resolve(deleteMessageRoles));
    groupManager.getGroupRoles = jest.fn(() => groupRoles);
    expect.assertions(3);
    const canDelete = await ChService.canDeleteMessageFromGroup('123456XXX');
    expect(ChService._getDeleteMessageRoles).toBeCalled();
    expect(groupManager.getGroupRoles).toBeCalled();
    expect(canDelete).toBe(true);
  });

  it('returns false with discover === false', async () => {
    const deleteMessageRoles = ['admin', 'super-user', 'Santa-Claus'];
    const groupRoles = null;
    Application.APPCONFIG = { CHECK_FOR_DISCOVER: false };
    chatTaskManager._userManager.isCurrentUserAdmin = jest.fn(() => Promise.resolve(false));
    ChService._getDeleteMessageRoles = jest.fn(() => Promise.resolve(deleteMessageRoles));
    groupManager.getGroupRoles = jest.fn(() => groupRoles);
    expect.assertions(4);
    const canDelete = await ChService.canDeleteMessageFromGroup('123456XXX');
    expect(ChService._getDeleteMessageRoles).toBeCalled();
    expect(groupManager.getGroupRoles).toBeCalled();
    expect(chatTaskManager._userManager.isCurrentUserAdmin).toBeCalled();
    expect(canDelete).toBe(false);
  });

  it('returns true with discover === false', async () => {
    const deleteMessageRoles = ['admin', 'super-user', 'Santa-Claus'];
    const groupRoles = ['owner'];
    Application.APPCONFIG = { CHECK_FOR_DISCOVER: false };
    chatTaskManager._userManager.isCurrentUserAdmin = jest.fn(() => Promise.resolve(true));
    ChService._getDeleteMessageRoles = jest.fn(() => Promise.resolve(deleteMessageRoles));
    groupManager.getGroupRoles = jest.fn(() => groupRoles);
    expect.assertions(4);
    const canDelete = await ChService.canDeleteMessageFromGroup('123456XXX');
    expect(ChService._getDeleteMessageRoles).toBeCalled();
    expect(groupManager.getGroupRoles).toBeCalled();
    expect(chatTaskManager._userManager.isCurrentUserAdmin).toBeCalled();
    expect(canDelete).toBe(true);
  });
});
