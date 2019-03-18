import ChatTaskHandler from '../ChatTaskManager';
import ChatService from '../ChatService';
import TaskManager from '../../TaskManager';

const mockError = new Error('test error');
const mockGroups = {
  0: { _id: 'XT87kg1', name: 'furious', title: 'Not Fast, Just Furious' },
  1: { _id: 'L5yh7ip', name: 'heros', title: 'Super Heroes In Training' },
  2: {
    _id: 'Ki3Keo1',
    name: 'miracle-workers',
    title: 'The Miracle Workers',
  },
};
const mockRoomResponse = {
  records: [
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
  ],
};

const mockUserData = [
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

const RC = {
  subscribeToUserChanges: jest.fn(() => Promise.resolve()),
  monitorOnLogin: jest.fn(() => Promise.resolve()),
};

class GroupManager {
  constructor() {
    console.log('Group Manager is initiated');
  }
}
class AppManager {
  constructor() {
    console.log('App Manager is initiated');
  }
}
class UserManager {
  constructor() {
    console.log('User Manager is initiated');
  }
}

const appManager = new AppManager();
const groupManager = new GroupManager();
const userManager = new UserManager();

class Database {
  constructor() {
    this.app = appManager;
    this.group = groupManager;
    this.user = userManager;
  }
}

const DBManager = new Database();

const JOB_CHAT = 'ChatList';
// const JOB_FETCH_USER = 'User';
const JOB_FETCH_MESSAGE = 'FetchMessage';
const JOB_SEND_MESSAGE = 'SendMessage';
const JOB_SEND_TYPING_NOTIFICATION = 'SendTypingNotification';
const JOB_UPLOAD_FILE = 'FileUpload';
const JOB_FETCH_CURRENT_ROOM_MESSAGE = 'FetchCurrentRoomMessage';
const JOB_SEND_UNDELIVERED_MESSAGE = 'SendUndeliveredMessage';
// const JOB_GET_IMAGE_URL = 'GetImageURL';
const JOB_DELETE_MESSAGE = 'DeleteMessage';
const JOB_SEARCH_GROUP = 'SearchGroup';
const JOB_DELETE_OFFLINE_MESSAGE = 'DeleteOfflineMessage';
const JOB_SEND_READ_NOTIFICATION = 'SendReadNotification';
const JOB_LIKE_MESSAGE = 'LikeMessage';

TaskManager.provider = RC;

// const chatTaskManager = new ChatTaskHandler(TaskManager, DBManager);
let chatTaskManager;

beforeAll(async () => {
  await TaskManager.initQueue();
});

beforeEach(() => {
  chatTaskManager = new ChatTaskHandler(TaskManager, DBManager);
});

it('chatTaskManager is instantiated successfully', () => {
  expect(chatTaskManager).toBeTruthy();
  expect(chatTaskManager).toBeInstanceOf(ChatTaskHandler);
  expect(chatTaskManager._dbManager).toEqual(DBManager);
  expect(chatTaskManager._taskManager).toEqual(TaskManager);
  expect(chatTaskManager._provider).toEqual(RC);
  expect(chatTaskManager._groupManager).toEqual(groupManager);
  expect(chatTaskManager._appManager).toEqual(appManager);
  expect(chatTaskManager._userManager).toEqual(userManager);
  expect(chatTaskManager._chatService).toBeInstanceOf(ChatService);
});

it('chatTaskManager is instantiated without managers', () => {
  const chatTaskManagerWithoutManagers = new ChatTaskHandler();
  expect(chatTaskManagerWithoutManagers).toBeTruthy();
  expect(chatTaskManagerWithoutManagers).toBeInstanceOf(ChatTaskHandler);
  expect(chatTaskManagerWithoutManagers._dbManager).toBeUndefined();
  expect(chatTaskManagerWithoutManagers._taskManager).toBeUndefined();
  expect(chatTaskManagerWithoutManagers._provider).toBeUndefined();
  expect(chatTaskManagerWithoutManagers._groupManager).toBeUndefined();
  expect(chatTaskManagerWithoutManagers._appManager).toBeUndefined();
  expect(chatTaskManagerWithoutManagers._userManager).toBeUndefined();
  expect(chatTaskManagerWithoutManagers._chatService).toBeUndefined();
});

it('chatTaskManager calls init method', async () => {
  await chatTaskManager.initChatTaskHandler();
  await expect(TaskManager.queue.isWorkerPresent(JOB_CHAT)).toBe(true);
  // await expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_USER)).toBe(true);
  await expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_MESSAGE)).toBe(true);
  await expect(TaskManager.queue.isWorkerPresent(JOB_SEND_MESSAGE)).toBe(true);
  await expect(TaskManager.queue.isWorkerPresent(JOB_SEND_TYPING_NOTIFICATION)).toBe(true);
});

describe('chatTaskManager sends message', () => {
  it('sends message', async () => {
    RC.sendMessage = jest.fn(() => Promise.resolve());
    chatTaskManager._appManager.app = { isServiceConnected: true };
    const ridX = 'XYZ1235689';
    const messageX = {
      text: 'good evening!',
      _id: 'AAA-111-TTT-7778',
      createdAt: new Date(),
    };

    appManager.logError = jest.fn(() => true);
    groupManager.buildTextMessage = jest.fn(() => messageX);
    groupManager.addMessageToRealmOnly = jest.fn();
    groupManager.unemojifyMessageText = jest.fn(() => messageX.text);

    expect.assertions(5);
    await chatTaskManager._sendMessage({ ridX, messageX });
    expect(groupManager.buildTextMessage.mock.calls.length).toBe(1);
    expect(groupManager.addMessageToRealmOnly.mock.calls.length).toBe(1);
    expect(groupManager.unemojifyMessageText.mock.calls.length).toBe(1);
    expect(RC.sendMessage.mock.calls.length).toBe(1);
    expect(appManager.logError.mock.calls.length).toBe(0);
  });

  it('error on sending message', async () => {
    chatTaskManager._appManager.app = { isServiceConnected: true };
    RC.sendMessage = jest.fn(() => Promise.reject());
    const ridX = 'XYZ1235689';
    const messageX = {
      text: 'good evening!',
      _id: 'AAA-111-TTT-7778',
      createdAt: new Date(),
    };

    chatTaskManager._appManager.logError = jest.fn();
    groupManager.buildTextMessage = jest.fn(() => messageX);
    groupManager.addMessageToRealmOnly = jest.fn();
    groupManager.unemojifyMessageText = jest.fn(() => messageX.text);

    expect.assertions(2);
    await chatTaskManager._sendMessage({ ridX, messageX });
    expect(TaskManager.provider.sendMessage.mock.calls.length).toBe(1);
    expect(chatTaskManager._appManager.logError.mock.calls.length).toBe(1);
  });

  it('no connection', async () => {
    chatTaskManager._appManager.app = { isServiceConnected: false };
    RC.sendMessage = jest.fn(() => Promise.resolve());
    const ridX = 'XYZ1235689';
    const messageX = {
      text: 'good evening!',
      _id: 'AAA-111-TTT-7778',
      createdAt: new Date(),
    };

    chatTaskManager._appManager.logError = jest.fn();
    groupManager.buildTextMessage = jest.fn(() => messageX);
    groupManager.addMessageToRealmOnly = jest.fn();
    groupManager.unemojifyMessageText = jest.fn(() => messageX.text);

    expect.assertions(1);
    await chatTaskManager._sendMessage({ ridX, messageX });
    expect(TaskManager.provider.sendMessage.mock.calls.length).toBe(0);
  });
});

describe('chatTaskManager getMessage', () => {
  it('chatTaskManager getMessage fails at fetchMessages', async () => {
    RC.fetchCurrentRoomMessages = jest.fn(() => Promise.reject(mockError));
    const createdAt = new Date();
    const lastmessage = { createdAt };
    chatTaskManager._groupManager.getLastMessage = jest.fn(() => lastmessage);
    groupManager.addBulkMessages = jest.fn();
    appManager.logError = jest.fn();
    appManager.app = { lastSync: new Date() };

    expect.assertions(3);
    await chatTaskManager._getMessage([{ _id: 'XT87kg1' }]);
    expect(RC.fetchCurrentRoomMessages.mock.calls.length).toBe(1);
    expect(groupManager.addBulkMessages.mock.calls.length).toBe(0);
    expect(appManager.logError.mock.calls.length).toBe(1);
  });

  it('chatTaskManager getMessage fails at addBulkMessages', async () => {
    RC.fetchCurrentRoomMessages = jest.fn(() => Promise.resolve({ messages: 'Bonjour mon ami!' }));
    groupManager.addBulkMessages = jest.fn(() => Promise.reject(mockError));
    appManager.logError = jest.fn();
    appManager.app = { lastSync: new Date() };

    expect.assertions(3);
    await chatTaskManager._getMessage([{ _id: 'XT87kg1' }]);
    expect(RC.fetchCurrentRoomMessages.mock.calls.length).toBe(1);
    expect(groupManager.addBulkMessages.mock.calls.length).toBe(1);
    expect(appManager.logError.mock.calls.length).toBe(1);
  });

  it('chatTaskManager getMessage returns groupObj', async () => {
    RC.fetchCurrentRoomMessages = jest.fn(() => Promise.resolve());
    groupManager.addBulkMessages = jest.fn(() => Promise.resolve(mockGroups[2]));
    appManager.app = { lastSync: new Date() };

    expect.assertions(3);
    const groupObj = await chatTaskManager._getMessage([{ _id: 'XT87kg1' }]);

    expect(RC.fetchCurrentRoomMessages.mock.calls.length).toBe(1);
    expect(groupManager.addBulkMessages.mock.calls.length).toBe(0);
    expect(groupObj).toBeUndefined();
  });

  it('chatTaskManager getMessage returns groupObj', async () => {
    RC.fetchCurrentRoomMessages = jest.fn(() => Promise.resolve({ messages: 'Bonjour mon ami!' }));
    groupManager.addBulkMessages = jest.fn(() => Promise.resolve(mockGroups[2]));
    const lastMessage = { message: 'hi', createdAt: new Date() };
    chatTaskManager._groupManager.getLastMessage = jest.fn(() => lastMessage);
    chatTaskManager._sendUndeliveredGroupMessages = jest.fn();
    chatTaskManager._handleDeletedOfflineGroupMessages = jest.fn();

    expect.assertions(5);
    const groupObj = await chatTaskManager._getMessage([{ _id: 'XT87kg1' }]);
    expect(RC.fetchCurrentRoomMessages.mock.calls.length).toBe(1);
    expect(groupManager.addBulkMessages.mock.calls.length).toBe(1);
    expect(chatTaskManager._sendUndeliveredGroupMessages).toBeCalled();
    expect(chatTaskManager._handleDeletedOfflineGroupMessages).toBeCalled();
    expect(groupObj).toEqual(mockGroups[2]);
  });

  it('chatTaskManager getMessage fails at fetchMessages last message created at ', async () => {
    RC.fetchCurrentRoomMessages = jest.fn(() => Promise.resolve({ messages: 'kadu' }));
    const createdAt = null;
    const lastmessage = { message: 'hi', createdAt };
    chatTaskManager._groupManager.getLastMessage = jest.fn(() => lastmessage);
    groupManager.addBulkMessages = jest.fn();
    appManager.logError = jest.fn();
    appManager.app = { lastSync: new Date() };

    expect.assertions(2);
    await chatTaskManager._getMessage([{ _id: 'XT87kg1' }]);
    expect(RC.fetchCurrentRoomMessages.mock.calls.length).toBe(1);
    expect(groupManager.addBulkMessages.mock.calls.length).toBe(1);
  });

  it('current room has no messages', async () => {
    appManager.logError = jest.fn();
    RC.fetchCurrentRoomMessages = jest.fn(() => Promise.resolve());
    groupManager.addBulkMessages = jest.fn(() => Promise.resolve(mockGroups[2]));
    chatTaskManager._groupManager.getLastMessage = jest.fn();
    chatTaskManager._sendUndeliveredGroupMessages = jest.fn();

    expect.assertions(4);
    const groupObj = await chatTaskManager._getMessage([{ _id: 'XT87kg1' }]);
    expect(RC.fetchCurrentRoomMessages.mock.calls.length).toBe(1);
    expect(groupManager.addBulkMessages.mock.calls.length).toBe(0);
    expect(chatTaskManager._sendUndeliveredGroupMessages).toBeCalled();
    expect(groupObj).toBeUndefined();
  });
});

describe('chatTaskManager calls chatListMessageSubscription', () => {
  const groupListInDB = {
    '0': { _id: 'abcd' },
    '1': { _id: 'def' },
    '2': { _id: 'ghi' },
  };
  groupManager.sortedList = groupListInDB;
  RC.monitorStreamRoom = jest.fn(() => Promise.resolve());
  RC.subscibToChatListChanges = jest.fn(() => Promise.resolve());
  RC.subscribeToUserChanges = jest.fn(() => Promise.resolve());
  RC.initUserSubscriptions = jest.fn(() => Promise.resolve());

  it('fails to subscribe - rc throws error ', async () => {
    RC.subscribeToGroup = jest.fn(() => {
      throw mockError;
    });
    expect.assertions(1);
    await chatTaskManager._chatListMessageSubscribtion();
    expect(RC.monitorStreamRoom).not.toBeCalled();
  });

  it('calls chatListMessageSubscription', async () => {
    jest.useFakeTimers();
    RC.subscibToChatListChanges = jest.fn(() => Promise.resolve(true));
    RC.subscribeToGroup = jest.fn(() => true);
    RC.subscribeToUserChanges = jest.fn();
    // chatTaskManager._provider.monitorStreamRoom = jest.fn(() => true);
    chatTaskManager.chatListLength = 0;
    chatTaskManager.subscribetoUserChange = false;
    userManager.setAllUserOffline = jest.fn();
    expect.assertions(5);
    await chatTaskManager._chatListMessageSubscribtion();
    expect(RC.monitorStreamRoom).toBeCalled();
    expect(RC.subscribeToGroup.mock.calls.length).toBe(1);
    expect(userManager.setAllUserOffline).toBeCalled();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    jest.runAllTimers();
    expect(RC.subscribeToUserChanges).toHaveBeenCalledTimes(1);
  });

  it('fails to subscribe - chatListLength > 0 ', async () => {
    RC.subscribeToGroup = jest.fn(() => Promise.resolve());
    RC.monitorStreamRoom = jest.fn();
    chatTaskManager.chatListLength = 22;
    expect.assertions(1);
    await chatTaskManager._chatListMessageSubscribtion();
    expect(RC.monitorStreamRoom).not.toBeCalled();
  });

  it('fails to subscribe to user changes - already subscribed ', async () => {
    RC.subscribeToGroup = jest.fn(() => Promise.resolve());
    RC.monitorStreamRoom = jest.fn();
    RC.subscribeToUserChanges = jest.fn();
    userManager.setAllUserOffline = jest.fn();
    chatTaskManager.chatListLength = 0;
    chatTaskManager.subscribetoUserChange = true;
    expect.assertions(1);
    await chatTaskManager._chatListMessageSubscribtion();
    expect(userManager.setAllUserOffline).not.toBeCalled();
  });
});

describe('chatTaskManager getChatList method', () => {
  it('fails with an error in fetchChannels', async () => {
    RC.fetchChannels = jest.fn(() => Promise.reject(mockError));
    appManager.logError = jest.fn();

    expect.assertions(2);
    await chatTaskManager.getChatList();
    expect(RC.fetchChannels.mock.calls.length).toBe(1);
    expect(appManager.logError.mock.calls.length).toBe(1);
  });

  it('fails with an error in addAll', async () => {
    RC.fetchChannels = jest.fn(() => Promise.resolve(mockGroups));
    appManager.logError = jest.fn();
    groupManager.addAll = jest.fn(() => Promise.reject(mockError));

    expect.assertions(3);
    await chatTaskManager.getChatList();
    expect(RC.fetchChannels.mock.calls.length).toBe(1);
    expect(groupManager.addAll.mock.calls.length).toBe(1);
    expect(appManager.logError.mock.calls.length).toBe(1);
  });

  it('subscribes to messages', async () => {
    jest.useFakeTimers();
    const chatTM = new ChatTaskHandler(TaskManager, DBManager);
    chatTM._chatListMessageSubscribtion = jest.fn();
    groupManager.addAll = jest.fn(() => Promise.resolve());
    appManager.setLastSyncOnMessage = jest.fn();
    RC.fetchChannels = jest.fn(() => Promise.resolve(mockGroups));
    RC.subscibToChatListChanges = jest.fn(() => Promise.resolve());
    RC.initUserSubscriptions = jest.fn(() => Promise.resolve());
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_MESSAGE).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await chatTM.getChatList();
    expect(onSuccess.mock.calls.length).toBe(3);
  });
});

describe('chatTaskManager calls fetchChatListJob', () => {
  it('no logged user', async () => {
    RC.subscribeToUserChanges.mockClear();
    userManager.loggedInUser = null;
    userManager.setAllUserOffline = jest.fn();
    userManager.setUserStatus = jest.fn();

    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CHAT).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(6);
    await chatTaskManager.fetchChatListJob();
    expect(userManager.setAllUserOffline).toBeCalled();
    expect(RC.subscribeToUserChanges).toBeCalled();
    expect(RC.subscribeToUserChanges).toBeCalledWith(userManager.setUserStatus);
    expect(chatTaskManager.subscribetoUserChange).toBe(true);
    expect(chatTaskManager._fetchChatListInProgress).toBe(true);
    expect(onSuccess.mock.calls.length).toBe(1);
  });

  it('logged user', () => {
    userManager.loggedInUser = 'tmRSSha8mp9buXcCA';
    chatTaskManager._fetchChatListInProgress = false;

    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CHAT).options = {
      onSuccess,
      onFailed,
    };
    chatTaskManager.fetchChatListJob();
    expect(chatTaskManager._fetchChatListInProgress).toBe(true);
    expect(onSuccess.mock.calls.length).toBe(1);
  });

  it('logged user & fetchChatListInProgress', () => {
    userManager.loggedInUser = 'tmRSSha8mp9buXcCA';
    chatTaskManager._fetchChatListInProgress = true;

    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CHAT).options = {
      onSuccess,
      onFailed,
    };
    chatTaskManager.fetchChatListJob();
    expect(chatTaskManager._fetchChatListInProgress).toBe(true);
    expect(onSuccess.mock.calls.length).toBe(0);
  });
});

// no worker in ChatTaskManager
// it('chatTaskManager calls getImageUrl', () => {
//   const link = '/local/pictures/dream-vacation.jpg';
//   const messageId = 'UO78hgeO89';

//   const onSuccess = jest.fn();
//   const onFailed = jest.fn();
//   TaskManager.queue.getWorker(JOB_GET_IMAGE_URL).options = {
//     onSuccess,
//     onFailed
//   };
//   chatTaskManager.getImageUrl(link, messageId);
//   expect(onSuccess.mock.calls.length).toBe(1);
// });

it('chatTaskManager calls sendMessageJob', () => {
  const groupId = 'XYZ1235689';
  const message = { text: 'good morning!' };
  const onSuccess = jest.fn();
  const onFailed = jest.fn();
  TaskManager.queue.getWorker(JOB_SEND_MESSAGE).options = {
    onSuccess,
    onFailed,
  };
  chatTaskManager.sendMessageJob(groupId, message);
  expect(onSuccess.mock.calls.length).toBe(1);
});

it('chatTaskManager calls sendThreadedMessageJob', () => {
  const groupObj = { _id: 'x1234569', name: 'SuperMario', type: 'c' };
  const replyMsgId = 'XC002cv89O';
  const messageText = 'Hello';
  const onSuccess = jest.fn();
  const onFailed = jest.fn();
  TaskManager.queue.getWorker(JOB_SEND_MESSAGE).options = {
    onSuccess,
    onFailed,
  };
  chatTaskManager.sendThreadedMessageJob(groupObj, replyMsgId, messageText);
  expect(onSuccess.mock.calls.length).toBe(1);
});

it('chatTaskManager calls sendTypingNotificationJob', () => {
  const groupId = 'x1234569';
  const user = { username: 'userXYZ' };
  const onSuccess = jest.fn();
  const onFailed = jest.fn();
  TaskManager.queue.getWorker(JOB_SEND_TYPING_NOTIFICATION).options = {
    onSuccess,
    onFailed,
  };
  chatTaskManager.sendTypingNotificationJob(groupId, user);
  expect(onSuccess.mock.calls.length).toBe(1);
});

it('chatTaskManager calls sendReadStatusJob', () => {
  const groupId = 'x1234569';
  const onSuccess = jest.fn();
  const onFailed = jest.fn();
  TaskManager.queue.getWorker(JOB_SEND_READ_NOTIFICATION).options = {
    onSuccess,
    onFailed,
  };
  chatTaskManager.sendReadStatusJob(groupId);
  expect(onSuccess.mock.calls.length).toBe(1);
});

it('chatTaskManager calls uploadMediaJob', () => {
  const data = { uri: 'X:/path/to/file' };
  const groupId = 'XYZ1235689';
  const desc = 'good morning!';
  const callback = () => {};
  const onSuccess = jest.fn();
  const onFailed = jest.fn();
  TaskManager.queue.getWorker(JOB_UPLOAD_FILE).options = {
    onSuccess,
    onFailed,
  };
  chatTaskManager.uploadMediaJob(data, groupId, true, desc, callback);
  expect(onSuccess.mock.calls.length).toBe(1);
});

it('chatTaskManager calls _fetchCurrentRoomMessageJob', () => {
  const group = { _id: 'XYZ1235689' };
  const onSuccess = jest.fn();
  const onFailed = jest.fn();
  TaskManager.queue.getWorker(JOB_FETCH_CURRENT_ROOM_MESSAGE).options = {
    onSuccess,
    onFailed,
  };
  chatTaskManager._loadEarlierMessageJob(group);
  expect(onSuccess.mock.calls.length).toBe(1);
});

it('chatTaskManager calls sendUndeliveredJob', () => {
  const onSuccess = jest.fn();
  const onFailed = jest.fn();
  TaskManager.queue.getWorker(JOB_SEND_UNDELIVERED_MESSAGE).options = {
    onSuccess,
    onFailed,
  };
  chatTaskManager.sendUndeliveredMessageJob();
  expect(onSuccess.mock.calls.length).toBe(1);
});

it('chatTaskManager calls deleteMessageJob', () => {
  const groupId = 'XC12589Vb';
  const messageId = 'MSG123456';
  const onSuccess = jest.fn();
  const onFailed = jest.fn();
  TaskManager.queue.getWorker(JOB_DELETE_MESSAGE).options = {
    onSuccess,
    onFailed,
  };
  chatTaskManager.deleteMessageJob(groupId, messageId);
  expect(onSuccess.mock.calls.length).toBe(1);
});

it('chatTaskManager calls searchGroupJob', () => {
  const searchKey = 'Woman-Boss';
  const onSuccess = jest.fn();
  const onFailed = jest.fn();
  TaskManager.queue.getWorker(JOB_SEARCH_GROUP).options = {
    onSuccess,
    onFailed,
  };
  chatTaskManager.searchGroupJob(searchKey);
  expect(onSuccess.mock.calls.length).toBe(1);
});

it('chatTaskManager calls handleDeletedOfflineMessageJob', () => {
  const message = { _id: 'ZF589O1H4t', text: '********Confidential' };
  const onSuccess = jest.fn();
  const onFailed = jest.fn();
  TaskManager.queue.getWorker(JOB_DELETE_OFFLINE_MESSAGE).options = {
    onSuccess,
    onFailed,
  };
  chatTaskManager.handleDeletedOfflineMessageJob(message, true);
  expect(onSuccess.mock.calls.length).toBe(1);
});

it('chatTaskManager calls setLikeOnMessage job', () => {
  const messageId = '5XP9L12k34569s';
  const onSuccess = jest.fn();
  const onFailed = jest.fn();
  TaskManager.queue.getWorker(JOB_LIKE_MESSAGE).options = {
    onSuccess,
    onFailed,
  };
  chatTaskManager.setLikeOnMessage(messageId);
  expect(onSuccess.mock.calls.length).toBe(1);
});

it('chatTaskManager calls loadEarlierMessage with groupId', () => {
  const groupId = 'XT87kg1';
  groupManager.findById = jest.fn(() => mockGroups['0']);
  chatTaskManager._loadEarlierMessageJob = jest.fn();
  chatTaskManager.loadEarlierMessage(groupId);
  expect(groupManager.findById).toBeCalled();
  expect(chatTaskManager._loadEarlierMessageJob).toBeCalled();
});

it('chatTaskManager calls loadEarlierMessage without groupId', () => {
  const groupId = null;
  groupManager.findById = jest.fn();
  chatTaskManager.loadEarlierMessage(groupId);
  expect(groupManager.findById).not.toBeCalled();
});

describe('chatTaskManager _sendUndeliveredGroupMessages message', () => {
  it('_sendUndeliveredGroupMessages no message', async () => {
    try {
      const message = [];
      chatTaskManager._groupManager.getUndeliveredMessages = jest.fn(() => message);
      chatTaskManager.sendUndeliveredMessageJob = jest.fn(() => true);
      await chatTaskManager._sendUndeliveredGroupMessages('GENERAL');

      expect(chatTaskManager.sendUndeliveredMessageJob.mock.calls.length).toBe(message.length);
    } catch (error) {
      // console.log('ERROR ON SEND THREADED MESSAGE', error);
    }
  });

  it('_sendUndeliveredGroupMessages', async () => {
    try {
      const messages = [{ a: '' }, { b: '' }, { c: '' }];
      // chatTaskManager._groupManager.getUndeliveredMessages.mockClear();
      chatTaskManager._groupManager.getUndeliveredMessages = jest.fn(() => messages);
      chatTaskManager.sendUndeliveredMessageJob = jest.fn(() => true);
      await chatTaskManager._sendUndeliveredGroupMessages('GENERAL');

      expect(chatTaskManager.sendUndeliveredMessageJob.mock.calls.length).toBe(messages.length);
    } catch (error) {
      // console.log('ERROR ON SEND THREADED MESSAGE', error);
    }
  });

  it('_sendUndeliveredGroupMessages is already sending', () => {
    chatTaskManager._sendingUndelivered.ADV555566 = {};
    chatTaskManager.sendUndeliveredMessageJob = jest.fn();
    expect.assertions(1);
    chatTaskManager._sendUndeliveredGroupMessages('ADV555566');
    expect(chatTaskManager.sendUndeliveredMessageJob.mock.calls.length).toBe(0);
  });

  it('_sendUndeliveredGroupMessages gets error', () => {
    const error = new Error('Worker is busy. Have patience and stop texting.');
    chatTaskManager._sendingUndelivered = {};
    chatTaskManager.sendUndeliveredMessageJob = jest.fn(() => {
      throw error;
    });
    groupManager.getUndeliveredMessages = jest.fn(() => [{ _id: 'MSG123456' }]);
    expect.assertions(1);
    chatTaskManager._sendUndeliveredGroupMessages('ADV555566');
    expect(chatTaskManager.sendUndeliveredMessageJob.mock.calls.length).toBe(1);
  });
});

describe('chatTaskManager _loadEarlierMessageWorker message', () => {
  it('no first message && no messages on server', async () => {
    const args = [{ _id: 'ABCDEF', group: null }];
    const firstMessage = {
      group: null,
      createdAt: new Date(),
      text: 'hello',
    };
    chatTaskManager._groupManager.getFirstMessage = jest.fn(() => firstMessage);
    RC.fetchCurrentRoomMessages = jest.fn(() => ({ messages: [] }));
    chatTaskManager._groupManager.updateNoMoreMessages = jest.fn();
    expect.assertions(4);
    const groupObj = await chatTaskManager._loadEarlierMessageWorker(args);
    expect(chatTaskManager._groupManager.getFirstMessage).toBeCalled();
    expect(RC.fetchCurrentRoomMessages).toBeCalled();
    expect(chatTaskManager._groupManager.updateNoMoreMessages).toBeCalled();
    expect(groupObj).toBeUndefined();
  });

  it('first message & messages on server', async () => {
    const args = [{ _id: 'ABCDEF', group: 'XCV025689' }];
    const firstMessage = {
      group: 'XCV025689',
      createdAt: new Date(),
      text: 'hello',
    };
    const messages = {
      messages: [
        {
          _id: 'VoyP894251q',
          msg: 'Test',
        },
      ],
    };
    const groupObj = {
      _id: 'BVJ7DK0Y1564865456',
      name: 'ALL TESTS',
    };
    chatTaskManager._groupManager.getFirstMessage = jest.fn(() => firstMessage);
    RC.fetchOldMessages = jest.fn(() => messages);
    chatTaskManager._groupManager.addEarlierMessage = jest.fn(() => groupObj);
    expect.assertions(4);
    const result = await chatTaskManager._loadEarlierMessageWorker(args);
    expect(chatTaskManager._groupManager.getFirstMessage).toBeCalled();
    expect(RC.fetchOldMessages).toBeCalled();
    expect(chatTaskManager._groupManager.addEarlierMessage).toBeCalled();
    expect(result).toEqual(groupObj);
  });

  it('fails with an error', async () => {
    const args = [{ _id: 'ABCDEF', group: null }];
    const firstMessage = null;
    const rcError = new Error('server is off');
    chatTaskManager._groupManager.getFirstMessage = jest.fn(() => firstMessage);
    RC.fetchCurrentRoomMessages = jest.fn(() => Promise.reject(rcError));
    chatTaskManager._appManager.logError = jest.fn();
    expect.assertions(4);
    const groupObj = await chatTaskManager._loadEarlierMessageWorker(args);
    expect(chatTaskManager._groupManager.getFirstMessage).toBeCalled();
    expect(RC.fetchCurrentRoomMessages).toBeCalled();
    expect(chatTaskManager._appManager.logError).toBeCalled();
    expect(groupObj).toBeUndefined();
  });
});

it('chatTaskManager file upload rejects with error', async () => {
  appManager.getSettingsValue = () => ({ value: '62428899' });
  RC.uploadFile = jest.fn(() => Promise.reject());
  const data = { uri: 'X:/path/to/file' };
  const rid = 'XYZ1235689';
  const desc = 'good morning!';
  const messageX = {
    text: 'good evening!',
    _id: 'AAA-111-TTT-7778',
    createdAt: new Date(),
  };
  appManager.logError = jest.fn(() => true);
  groupManager.buildFileMessage = jest.fn(() => messageX);
  appManager.app = { isServiceConnected: true };
  expect.assertions(1);
  await chatTaskManager.uploadMedia([{ data, rid, isImage: true, desc }]);
  expect(RC.uploadFile.mock.calls.length).toBe(1);
});

it('chatTaskManager uploads a file', async () => {
  appManager.getSettingsValue = () => ({ value: null });
  RC.uploadFile = jest.fn(() => Promise.resolve());
  const data = { uri: 'X:/path/to/file' };
  const rid = 'XYZ1235689';
  const desc = 'good morning!';
  const messageX = {
    text: 'good evening!',
    _id: 'AAA-111-TTT-7778',
    createdAt: new Date(),
  };
  appManager.logError = jest.fn(() => true);
  groupManager.buildFileMessage = jest.fn(() => messageX);
  groupManager.addMessageToRealmOnly = jest.fn();
  appManager.app = { isServiceConnected: true };
  expect.assertions(3);
  await chatTaskManager.uploadMedia([{ data, rid, isImage: true, desc }]);
  expect(groupManager.buildFileMessage).toBeCalled();
  expect(groupManager.addMessageToRealmOnly).toBeCalled();
  expect(RC.uploadFile.mock.calls.length).toBe(1);
});

it('chatTaskManager cannot upload a file, no connection', async () => {
  appManager.app = { isServiceConnected: false };
  appManager.getSettingsValue = () => ({ value: null });
  RC.uploadFile = jest.fn(() => Promise.resolve());
  const data = { uri: 'X:/path/to/file' };
  const rid = 'XYZ1235689';
  const desc = 'good morning!';
  const messageX = {
    text: 'good evening!',
    _id: 'AAA-111-TTT-7778',
    createdAt: new Date(),
  };
  appManager.logError = jest.fn(() => true);
  groupManager.buildFileMessage = jest.fn(() => messageX);
  groupManager.addMessageToRealmOnly = jest.fn();
  await chatTaskManager.uploadMedia([{ data, rid, isImage: true, desc }]);
  expect(RC.uploadFile.mock.calls.length).toBe(0);
});

it('chatTaskManager uploads a file reply', async () => {
  appManager.getSettingsValue = () => ({ value: null });
  RC.uploadFile = jest.fn(() => Promise.resolve());
  const data = { uri: 'X:/path/to/file' };
  const rid = 'XYZ1235689';
  const desc = 'good morning!';
  const replyMessageId = 'OOO125894n';
  const messageX = {
    text: 'good evening!',
    _id: 'AAA-111-TTT-7778',
    createdAt: new Date(),
    isReply: true,
  };
  appManager.logError = jest.fn(() => true);
  groupManager.buildFileMessage = jest.fn(() => messageX);
  groupManager.addMessageToRealmOnly = jest.fn();
  groupManager.findById = jest.fn(() => ({ _id: '78NpI89X236fy' }));
  groupManager.buildReplyTemplate = jest.fn();
  appManager.app = { isServiceConnected: true, host: 'demo.mongrov.com' };
  expect.assertions(3);
  await chatTaskManager.uploadMedia([{ data, rid, isImage: true, desc, replyMessageId }]);
  expect(groupManager.findById).toBeCalled();
  expect(groupManager.buildReplyTemplate).toBeCalled();
  expect(RC.uploadFile.mock.calls.length).toBe(1);
});

it('chatTaskManager uploads a file reply - no group object', async () => {
  appManager.getSettingsValue = () => ({ value: null });
  RC.uploadFile = jest.fn(() => Promise.resolve());
  const data = { uri: 'X:/path/to/file' };
  const rid = 'XYZ1235689';
  const desc = 'good morning!';
  const replyMessageId = 'OOO125894n';
  const messageX = {
    text: 'good evening!',
    _id: 'AAA-111-TTT-7778',
    createdAt: new Date(),
    isReply: true,
  };
  appManager.logError = jest.fn(() => true);
  groupManager.buildFileMessage = jest.fn(() => messageX);
  groupManager.addMessageToRealmOnly = jest.fn();
  groupManager.findById = jest.fn(() => null);
  groupManager.buildReplyTemplate = jest.fn();
  appManager.app = { isServiceConnected: true, host: 'demo.mongrov.com' };
  expect.assertions(3);
  await chatTaskManager.uploadMedia([{ data, rid, isImage: true, desc, replyMessageId }]);
  expect(groupManager.findById).toBeCalled();
  expect(groupManager.buildReplyTemplate).not.toBeCalled();
  expect(RC.uploadFile.mock.calls.length).toBe(1);
});

describe('chatTaskManager sends typing notification', () => {
  it('notification rejected', async () => {
    RC.notifyRoomAboutTyping = jest.fn(() => Promise.reject(mockError));
    const rid = 'XYZ1235689';
    const user = { username: 'userXYZ' };

    expect.assertions(1);
    await chatTaskManager._sendTypingNotification([{ rid, user, flag: true }]);
    expect(RC.notifyRoomAboutTyping.mock.calls.length).toBe(1);
  });

  it('notification succeeded', async () => {
    RC.notifyRoomAboutTyping = jest.fn(() => Promise.resolve());
    const rid = 'XYZ1235689';
    const user = { username: 'userXYZ' };

    expect.assertions(1);
    await chatTaskManager._sendTypingNotification([{ rid, user }]);
    expect(RC.notifyRoomAboutTyping.mock.calls.length).toBe(1);
  });
});

describe('chatTaskManager sends user message', () => {
  it('calls sendThreadedMessage', () => {
    appManager.app = { host: 'demo.mongrov.com', isServiceConnected: true };
    chatTaskManager._sendThreadedMessage = jest.fn(() => Promise.resolve());
    const payload = {
      groupObj: { _id: 'x1234569', name: 'SuperMario', type: 'c' },
      replyMsgId: 'XC002cv89O',
      messageText: 'Hello',
    };
    chatTaskManager._sendUserMessage([{ thread: true, ...payload }]);
    expect(chatTaskManager._sendThreadedMessage.mock.calls.length).toBe(1);
  });

  it('calls sendMessage', () => {
    chatTaskManager._sendMessage = jest.fn(() => Promise.resolve());
    groupManager.findMessageById = () => ({
      _id: 'AAA-111-TTT-7777',
      status: 0,
    });
    appManager.app = { isServiceConnected: true, isNetworkConnected: true };
    const payload = {
      groupId: 'XYZ1235689',
      message: {
        text: 'good morning!',
        _id: 'AAA-111-TTT-7777',
        createdAt: new Date(),
      },
    };
    chatTaskManager._sendUserMessage([{ thread: false, ...payload }]);
    expect(chatTaskManager._sendMessage.mock.calls.length).toBe(1);
  });
});

describe('chatTaskManager sends _sendUndeliveredFile', () => {
  it('chatTaskManager sends image', async () => {
    const messageObj = {
      _id: 'GENERAL',
      group: 'hinji',
      type: 1,
      image: '/gallery/my-photo.jpg',
      text: 'Nice photo of me',
    };
    const rcArgs = {
      data: { uri: messageObj.image },
      rid: messageObj.group,
      isImage: true,
      desc: messageObj.text,
      maxFileSize: 1234,
      message: { _id: messageObj._id, text: '' },
    };
    chatTaskManager._appManager.app = { isServiceConnected: true };
    chatTaskManager._appManager.getSettingsValue = jest.fn(() => ({
      value: 1234,
    }));
    RC.uploadFile = jest.fn(() => Promise.resolve(true));
    const result = await chatTaskManager._sendUndeliveredFile(messageObj);
    expect.assertions(3);
    expect(RC.uploadFile.mock.calls.length).toBe(1);
    expect(RC.uploadFile).toBeCalledWith(rcArgs, chatTaskManager._groupManager);
    expect(result).toBe(true);
  });

  it('chatTaskManager failed to send audio, no connection', async () => {
    const messageObj = {
      _id: 'GENERAL',
      group: 'hinji',
      type: 3,
      remoteFile: '/music/my-song-for-you.mp3',
    };
    chatTaskManager._appManager.app = { isServiceConnected: false };
    chatTaskManager._appManager.getSettingsValue = jest.fn(() => ({}));
    RC.uploadFile = jest.fn(() => Promise.resolve(true));
    const result = await chatTaskManager._sendUndeliveredFile(messageObj);
    expect.assertions(2);
    expect(RC.uploadFile.mock.calls.length).toBe(0);
    expect(result).toBe(false);
  });

  it('chatTaskManager failed to send video, rc error', async () => {
    const messageObj = {
      _id: 'GENERAL',
      group: 'hinji',
      type: 2,
      remoteFile: '/video/birthday-cake.mp4',
    };
    chatTaskManager._appManager.app = { isServiceConnected: true };
    chatTaskManager._appManager.getSettingsValue = jest.fn(() => 1234);
    chatTaskManager._groupManager.setMessageDelivered = jest.fn((id) => id);
    chatTaskManager._appManager.logError = jest.fn();
    const error = { error: '500' };
    RC.uploadFile = jest.fn(() => Promise.reject(error));
    expect.assertions(3);
    const result = await chatTaskManager._sendUndeliveredFile(messageObj);
    expect(RC.uploadFile.mock.calls.length).toBe(1);
    expect(chatTaskManager._groupManager.setMessageDelivered).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('chatTaskManager failed to send pdf file', async () => {
    const messageObj = {
      _id: 'GENERAL',
      group: 'hinji',
      type: 75,
      remoteFile: '/MyDocuments/monthly-report.pdf',
    };
    chatTaskManager._appManager.app = { isServiceConnected: true };
    chatTaskManager._appManager.getSettingsValue = jest.fn(() => 1234);
    chatTaskManager._groupManager.setMessageDelivered = jest.fn((id) => id);
    chatTaskManager._appManager.logError = jest.fn();
    const error = { error: '502' };
    RC.uploadFile = jest.fn(() => Promise.reject(error));
    expect.assertions(2);
    await chatTaskManager._sendUndeliveredFile(messageObj);
    expect(RC.uploadFile.mock.calls.length).toBe(1);
    expect(chatTaskManager._groupManager.setMessageDelivered).not.toHaveBeenCalled();
  });
});

describe('chatTaskManager sends _sendUndeliveredText', () => {
  it('sending undelivered text succeeded', async () => {
    const messageObj = { _id: 'GENERAL', group: 'hinji', text: 'text is' };
    chatTaskManager._appManager.app = { isServiceConnected: true };
    chatTaskManager._sendingUndelivered = [];
    chatTaskManager._groupManager.unemojifyMessageText = jest.fn((text) => text);
    RC.sendMessage = jest.fn(() => Promise.resolve());
    expect.assertions(1);
    chatTaskManager._sendUndeliveredText(messageObj);
    expect(RC.sendMessage.mock.calls.length).toBe(1);
  });

  it('sending undelivered threaded message succeeded', async () => {
    const messageObj = {
      _id: 'GENERAL',
      group: 'hinji',
      text: 'text is',
      isReply: true,
      replyMessageId: 'L123456789x',
    };
    chatTaskManager._appManager.app = {
      isServiceConnected: true,
      host: 'demo.mongrov.com',
    };
    chatTaskManager._sendingUndelivered = [];
    chatTaskManager._groupManager.unemojifyMessageText = jest.fn((text) => text);
    chatTaskManager._groupManager.findById = jest.fn(() => {});
    chatTaskManager._groupManager.buildReplyTemplate = jest.fn((text) => text);
    RC.sendMessage = jest.fn(() => Promise.resolve());
    expect.assertions(4);
    await chatTaskManager._sendUndeliveredText(messageObj);
    expect(chatTaskManager._groupManager.findById.mock.calls.length).toBe(1);
    expect(chatTaskManager._groupManager.buildReplyTemplate.mock.calls.length).toBe(1);
    expect(chatTaskManager._groupManager.unemojifyMessageText.mock.calls.length).toBe(1);
    expect(RC.sendMessage.mock.calls.length).toBe(1);
  });

  it('sending undelivered text failed', async () => {
    const messageObj = { _id: 'GENERAL', group: 'hinji', text: 'text is' };
    chatTaskManager._appManager.app = { isServiceConnected: true };
    chatTaskManager._sendingUndelivered = [];
    chatTaskManager._groupManager.unemojifyMessageText = jest.fn((text) => text);
    const error = { error: 500 };
    RC.sendMessage = jest.fn(() => Promise.reject(error));
    chatTaskManager._appManager.logError = jest.fn(() => true);
    expect.assertions(1);
    chatTaskManager._sendUndeliveredText(messageObj);
    expect(RC.sendMessage.mock.calls.length).toBe(1);
  });

  it('sending undelivered text failed', async () => {
    const messageObj = { _id: 'GENERAL', group: 'hinji', text: 'text is' };
    chatTaskManager._appManager.app = { isServiceConnected: true };
    chatTaskManager._sendingUndelivered = [];
    chatTaskManager._groupManager.unemojifyMessageText = jest.fn((text) => text);
    const error = { error: 503 };
    RC.sendMessage = jest.fn(() => Promise.reject(error));
    chatTaskManager._appManager.logError = jest.fn(() => true);
    expect.assertions(1);
    chatTaskManager._sendUndeliveredText(messageObj);
    expect(RC.sendMessage.mock.calls.length).toBe(1);
  });

  it('chatTaskManager sends _sendUndeliveredText no connection', async () => {
    const messageObj = { _id: 'GENERAL', group: 'hinji', text: 'text is' };
    chatTaskManager._appManager.app = { isServiceConnected: false };
    chatTaskManager._sendingUndelivered = [];
    chatTaskManager._groupManager.unemojifyMessageText = jest.fn((text) => text);
    const error = { error: '500' };
    RC.sendMessage = jest.fn(() => Promise.reject(error));
    expect.assertions(1);
    chatTaskManager._sendUndeliveredText(messageObj);
    expect(RC.sendMessage.mock.calls.length).toBe(0);
  });
});

describe('chatTaskManager sends threaded message', () => {
  const messageObj = { _id: 'GENERAL', group: 'hinji', text: 'text is' };

  it('message sending failed', async () => {
    const chatTM = new ChatTaskHandler(TaskManager, DBManager);
    chatTM._appManager.app = {
      isServiceConnected: true,
      host: 'demo.mongrov.com',
    };
    groupManager.buildThreadedMessage = jest.fn(() => messageObj);
    groupManager.addMessageToRealmOnly = jest.fn();
    groupManager.buildReplyTemplate = jest.fn((text) => text);
    groupManager.unemojifyMessageText = jest.fn((text) => text);
    appManager.logError = jest.fn();
    RC.sendMessage = jest.fn(() => Promise.reject(mockError));
    const payload = {
      groupObj: { _id: 'x1234569', name: 'SuperGroup', type: 'private' },
      replyMessageId: 'XC002cv89O',
      messageText: 'Hello',
    };

    expect.assertions(6);
    await chatTM._sendThreadedMessage(payload);
    expect(groupManager.buildThreadedMessage.mock.calls.length).toBe(1);
    expect(groupManager.addMessageToRealmOnly.mock.calls.length).toBe(1);
    expect(groupManager.buildReplyTemplate.mock.calls.length).toBe(1);
    expect(groupManager.unemojifyMessageText.mock.calls.length).toBe(1);
    expect(RC.sendMessage.mock.calls.length).toBe(1);
    expect(appManager.logError.mock.calls.length).toBe(1);
  });

  it('message sending succeeded', async () => {
    const chatTM = new ChatTaskHandler(TaskManager, DBManager);
    chatTM._appManager.app = {
      isServiceConnected: true,
      host: 'demo.mongrov.com',
    };
    groupManager.buildThreadedMessage = jest.fn(() => messageObj);
    groupManager.addMessageToRealmOnly = jest.fn();
    groupManager.buildReplyTemplate = jest.fn((text) => text);
    groupManager.unemojifyMessageText = jest.fn((text) => text);
    RC.sendMessage = jest.fn(() => Promise.resolve());
    const payload = {
      groupObj: { _id: 'x1234569', name: 'SuperMario', type: 'd' },
      replyMsgId: 'XC002cv89O',
      messageText: 'Hello',
    };

    expect.assertions(1);
    await chatTM._sendThreadedMessage(payload);
    expect(RC.sendMessage.mock.calls.length).toBe(1);
  });

  it('message sending failed, no connection', async () => {
    const chatTM = new ChatTaskHandler(TaskManager, DBManager);
    chatTM._appManager.app = {
      isServiceConnected: false,
      host: 'demo.mongrov.com',
    };
    groupManager.buildThreadedMessage = jest.fn(() => messageObj);
    groupManager.addMessageToRealmOnly = jest.fn();
    groupManager.buildReplyTemplate = jest.fn((text) => text);
    groupManager.unemojifyMessageText = jest.fn((text) => text);
    RC.sendMessage = jest.fn(() => Promise.resolve());
    const payload = {
      groupObj: { _id: 'x1234569', name: 'SuperMario', type: 'c' },
      replyMsgId: 'XC002cv89O',
      messageText: 'Hello',
    };

    expect.assertions(1);
    await chatTM._sendThreadedMessage(payload);
    expect(RC.sendMessage.mock.calls.length).toBe(0);
  });
});

describe('chatTaskManager _sendUndelivered messages', () => {
  const chatTM = new ChatTaskHandler(TaskManager, DBManager);
  chatTM._sendUndeliveredText = jest.fn(() => Promise.resolve());
  chatTM._sendUndeliveredFile = jest.fn(() => Promise.resolve());
  chatTM.sendUndeliveredMessageJob = jest.fn();

  beforeEach(() => {
    chatTM._sendUndeliveredText.mockClear();
    chatTM._sendUndeliveredFile.mockClear();
    chatTM.sendUndeliveredMessageJob.mockClear();
  });

  it('all undelivered messages sent', async () => {
    const args = [{ messages: [], group: 'Theta' }];
    chatTM._sendingUndelivered[args[0].group] = true;
    expect.assertions(4);
    await chatTM._sendUndelivered(args);
    expect(chatTM._sendingUndelivered[args[0].group]).toBe(false);
    expect(chatTM._sendUndeliveredText).not.toBeCalled();
    expect(chatTM._sendUndeliveredFile).not.toBeCalled();
    expect(chatTM.sendUndeliveredMessageJob).not.toBeCalled();
  });

  it('calls _sendUndeliveredText ', async () => {
    const args = [
      {
        messages: [
          {
            _id: 'CcCc12895220',
            text: 'message1',
            type: 0,
          },
          {
            _id: 'CxCx12895220',
            text: 'message2',
            type: 0,
          },
        ],
        group: 'Theta',
      },
    ];
    chatTM._sendingUndelivered[args[0].group] = true;
    expect.assertions(4);
    await chatTM._sendUndelivered(args);
    expect(chatTM._sendingUndelivered[args[0].group]).toBe(true);
    expect(chatTM._sendUndeliveredText).toBeCalled();
    expect(chatTM._sendUndeliveredFile).not.toBeCalled();
    expect(chatTM.sendUndeliveredMessageJob).toBeCalled();
  });

  it('calls _sendUndeliveredFile ', async () => {
    const args = [
      {
        messages: [
          {
            _id: 'CcCc12895220',
            text: 'Video Message',
            type: 2,
            remoteFile: '/video/funny-kittens.mp4',
          },
          {
            _id: 'CxCx12895220',
            text: 'message2',
            type: 0,
          },
        ],
        group: 'Theta',
      },
    ];
    chatTM._sendingUndelivered[args[0].group] = true;
    expect.assertions(4);
    await chatTM._sendUndelivered(args);
    expect(chatTM._sendingUndelivered[args[0].group]).toBe(true);
    expect(chatTM._sendUndeliveredText).not.toBeCalled();
    expect(chatTM._sendUndeliveredFile).toBeCalled();
    expect(chatTM.sendUndeliveredMessageJob).toBeCalled();
  });
});

describe('chatTaskManager gets users of a group', () => {
  const groupId = 'XYZ1235689';
  userManager.getFullUserData = jest.fn(() => mockUserData);

  beforeEach(() => {
    userManager.getFullUserData.mockClear();
  });

  it('getting group messages is failed', async () => {
    RC.getAllRoomUsers = jest.fn(() => Promise.reject(mockError));
    expect.assertions(1);
    await chatTaskManager.getGroupUsers(groupId);
    expect(RC.getAllRoomUsers.mock.calls.length).toBe(1);
  });

  it('getting a group with no users', async () => {
    RC.getAllRoomUsers = jest.fn(() => Promise.resolve({ records: [] }));
    expect.assertions(3);
    const users = await chatTaskManager.getGroupUsers(groupId);
    expect(users).toEqual([]);
    expect(RC.getAllRoomUsers.mock.calls.length).toBe(1);
    expect(userManager.getFullUserData.mock.calls.length).toBe(0);
  });

  it('getting a group with with users', async () => {
    RC.getAllRoomUsers = jest.fn(() => Promise.resolve(mockRoomResponse));
    expect.assertions(3);
    await expect(chatTaskManager.getGroupUsers(groupId)).resolves.toEqual(mockUserData);
    expect(RC.getAllRoomUsers.mock.calls.length).toBe(1);
    expect(userManager.getFullUserData.mock.calls.length).toBe(1);
  });
});

describe('chatTaskManager sets a group as read', () => {
  const groupId = 'XYZ1235689';
  groupManager.setGroupAsRead = jest.fn();

  beforeEach(() => {
    groupManager.setGroupAsRead.mockClear();
  });

  it("setting group's messages as read failed", async () => {
    RC.setRoomAsRead = jest.fn(() => Promise.reject(mockError));
    expect.assertions(2);
    await chatTaskManager.setGroupMessagesAsRead(groupId);
    expect(RC.setRoomAsRead.mock.calls.length).toBe(1);
    expect(groupManager.setGroupAsRead.mock.calls.length).toBe(0);
  });

  it("setting group's messages as read succeeded", async () => {
    RC.setRoomAsRead = jest.fn(() => Promise.resolve());
    expect.assertions(2);
    await chatTaskManager.setGroupMessagesAsRead(groupId);
    expect(RC.setRoomAsRead.mock.calls.length).toBe(1);
    expect(groupManager.setGroupAsRead.mock.calls.length).toBe(1);
  });
});

describe('chatTaskManager searches for a user or a group', () => {
  const chatTM = new ChatTaskHandler(TaskManager, DBManager);
  const data = [{ _id: '1234567X', username: 'test' }];
  chatTM._chatService.getAllUsersAndRooms = jest.fn(() => data);

  it('returns callback with error', () => {
    RC.loggedInUser = { _id: 'U782K658g', username: 'marina' };
    RC.searchUserOrRoom = jest.fn((key, config, cb) => cb('error', null));
    const callback = jest.fn();
    chatTM.searchUserOrGroup('admin', callback);
    expect(callback.mock.calls.length).toBe(1);
    expect(callback).toBeCalledWith('error', 'failure');
  });

  it('returns callback with null & failure', () => {
    RC.loggedInUser = null;
    RC.searchUserOrRoom = jest.fn((key, config, cb) => cb(null, []));
    const callback = jest.fn();
    chatTM.searchUserOrGroup('test', callback);
    expect(callback.mock.calls.length).toBe(1);
    expect(callback).toBeCalledWith(null, 'failure');
  });

  it('returns callback with data & success - empty keyword', () => {
    const results = {
      users: [{ _id: '1234567X', username: 'test' }],
      rooms: [{ _id: '1234567XY', username: 'support' }],
    };
    const expectedResult = [...results.users, ...results.rooms];
    groupManager.list = mockGroups;
    RC.loggedInUser = { _id: 'U782K658g', username: 'marina' };
    RC.searchUserOrRoom = jest.fn((key, config, cb) => cb(null, results));
    const callback = jest.fn();
    chatTM.searchUserOrGroup('', callback);
    expect(callback.mock.calls.length).toBe(1);
    expect(callback).toBeCalledWith(expectedResult, 'success');
  });
});

it('chatTaskManager creates a direct message', () => {
  RC.createDirectMessage = jest.fn();
  const username = 'test';
  const callback = () => {};
  chatTaskManager.createDirectMessage(username, callback);
  expect(RC.createDirectMessage).toBeCalled();
  expect(RC.createDirectMessage).toBeCalledWith(username, callback);
});

it('chatTaskManager lets user join a group', () => {
  RC.joinRoom = jest.fn();
  const groupId = 'top_secrets';
  const callback = () => {};
  chatTaskManager.joinGroup(groupId, callback);
  expect(RC.joinRoom).toBeCalled();
  expect(RC.joinRoom).toBeCalledWith(groupId, callback);
});

describe('chatTaskManager deletes a message', () => {
  const chatTM = new ChatTaskHandler(TaskManager, DBManager);
  it('deletes message', async () => {
    RC.deleteMessage = jest.fn(() => Promise.resolve());
    chatTM._appManager.app = { isServiceConnected: true };
    const roomId = 'XYZ1235689';
    const messageId = 'AAA-111-TTT-7788';
    groupManager.setMessageDeleted = jest.fn();

    expect.assertions(2);
    await chatTM._deleteMessage([{ _id: messageId, group: roomId }]);
    expect(groupManager.setMessageDeleted.mock.calls.length).toBe(1);
    expect(RC.deleteMessage.mock.calls.length).toBe(1);
  });

  it('no connection - no deletion', async () => {
    RC.deleteMessage = jest.fn(() => Promise.resolve());
    chatTM._appManager.app = { isServiceConnected: false };
    const roomId = 'XYZ1235689';
    const messageId = 'AAA-111-TTT-7788';
    groupManager.setMessageDeleted = jest.fn();

    expect.assertions(2);
    await chatTM._deleteMessage([{ _id: messageId, group: roomId }]);
    expect(groupManager.setMessageDeleted.mock.calls.length).toBe(1);
    expect(RC.deleteMessage.mock.calls.length).toBe(0);
  });

  it('error in RC method', async () => {
    RC.deleteMessage = jest.fn(() => Promise.reject());
    chatTM._appManager.app = { isServiceConnected: true };
    const roomId = 'XYZ1235689';
    const messageId = 'AAA-111-TTT-7788';
    groupManager.setMessageDeleted = jest.fn();

    expect.assertions(2);
    await chatTM._deleteMessage([{ _id: messageId, group: roomId }]);
    expect(groupManager.setMessageDeleted.mock.calls.length).toBe(1);
    expect(RC.deleteMessage.mock.calls.length).toBe(1);
  });
});

describe('chatTaskManager deletes an offline message', () => {
  const chatTM = new ChatTaskHandler(TaskManager, DBManager);

  it('deletes a last message', async () => {
    const args = [
      {
        messageObj: { _id: 'XOR256T', group: 'ALIENS' },
        isLast: true,
      },
    ];
    chatTM._chatService.canDeleteMessageFromGroup = jest.fn(() => Promise.resolve(true));
    chatTaskManager._appManager.app = { isServiceConnected: true };
    RC.deleteMessage = jest.fn(() => Promise.resolve());
    chatTM._appManager.app = { isServiceConnected: true };
    chatTM._sendingDeleted = { ALIENS: true };

    expect.assertions(3);
    await chatTM._deleteOfflineMessage(args);
    expect(chatTM._chatService.canDeleteMessageFromGroup.mock.calls.length).toBe(1);
    expect(RC.deleteMessage.mock.calls.length).toBe(1);
    expect(chatTM._sendingDeleted.ALIENS).toBe(false);
  });

  it('deletes a not last message', async () => {
    const args = [
      {
        messageObj: { _id: 'XOR256T', group: 'ALIENS' },
        isLast: false,
      },
    ];
    chatTM._chatService.canDeleteMessageFromGroup = jest.fn(() => Promise.resolve(true));
    chatTaskManager._appManager.app = { isServiceConnected: true };
    RC.deleteMessage = jest.fn(() => Promise.resolve());
    chatTM._sendingDeleted = { ALIENS: true };

    expect.assertions(3);
    await chatTM._deleteOfflineMessage(args);
    expect(chatTM._chatService.canDeleteMessageFromGroup.mock.calls.length).toBe(1);
    expect(RC.deleteMessage.mock.calls.length).toBe(1);
    expect(chatTM._sendingDeleted.ALIENS).toBe(true);
  });

  it('user cannot delete a message, no permission', async () => {
    const args = [
      {
        messageObj: { _id: 'XOR256T', group: 'ALIENS' },
        isLast: false,
      },
    ];
    chatTM._chatService.canDeleteMessageFromGroup = jest.fn(() => Promise.resolve(false));
    RC.deleteMessage = jest.fn(() => Promise.resolve());
    chatTM._appManager.app = { isServiceConnected: true };
    chatTM._sendingDeleted = { ALIENS: true };

    expect.assertions(3);
    await chatTM._deleteOfflineMessage(args);
    expect(chatTM._chatService.canDeleteMessageFromGroup.mock.calls.length).toBe(1);
    expect(RC.deleteMessage.mock.calls.length).toBe(0);
    expect(chatTM._sendingDeleted.ALIENS).toBe(false);
  });

  it('user cannot delete a message, no connection', async () => {
    const args = [
      {
        messageObj: { _id: 'XOR256T', group: 'ALIENS' },
        isLast: false,
      },
    ];
    chatTM._chatService.canDeleteMessageFromGroup = jest.fn(() => Promise.resolve(true));
    RC.deleteMessage = jest.fn(() => Promise.resolve());
    chatTM._appManager.app = { isServiceConnected: false };
    chatTM._sendingDeleted = { ALIENS: true };

    expect.assertions(3);
    await chatTM._deleteOfflineMessage(args);
    expect(chatTM._chatService.canDeleteMessageFromGroup.mock.calls.length).toBe(1);
    expect(RC.deleteMessage.mock.calls.length).toBe(0);
    expect(chatTM._sendingDeleted.ALIENS).toBe(false);
  });

  it('rejects with an error', async () => {
    const args = [
      {
        messageObj: { _id: 'XOR256T', group: 'ALIENS' },
        isLast: false,
      },
    ];
    const error = new Error('error');
    chatTM._chatService.canDeleteMessageFromGroup = jest.fn(() => Promise.resolve(true));
    RC.deleteMessage = jest.fn(() => Promise.reject(error));
    chatTM._appManager.app = { isServiceConnected: true };
    chatTM._sendingDeleted = { ALIENS: true };

    expect.assertions(3);
    await chatTM._deleteOfflineMessage(args);
    expect(chatTM._chatService.canDeleteMessageFromGroup.mock.calls.length).toBe(1);
    expect(RC.deleteMessage.mock.calls.length).toBe(1);
    expect(chatTM._sendingDeleted.ALIENS).toBe(true);
  });
});

describe('chatTaskManager calls _handleDeletedOfflineGroupMessages', () => {
  const chatTM = new ChatTaskHandler(TaskManager, DBManager);

  it('already sending', () => {
    const group = 'ALIENS';
    chatTM._sendingDeleted = { ALIENS: true };
    expect(chatTM._handleDeletedOfflineGroupMessages(group)).toBeUndefined();
    expect(chatTM._sendingDeleted.ALIENS).toBe(true);
  });

  it('no messages', () => {
    const group = 'ALIENS';
    chatTM._sendingDeleted = { ALIENS: false };
    chatTM._groupManager.getDeletedMessages = jest.fn(() => []);
    expect(chatTM._handleDeletedOfflineGroupMessages(group)).toBeUndefined();
    expect(chatTM._sendingDeleted.ALIENS).toBe(false);
  });

  it('adds a job for a corresponding worker', () => {
    const group = 'ALIENS';
    const message = { _id: 'XOR256T', group: 'ALIENS' };
    chatTM._sendingDeleted = { ALIENS: false };
    chatTM._groupManager.getDeletedMessages = jest.fn(() => [message]);
    chatTM.handleDeletedOfflineMessageJob = jest.fn();

    chatTM._handleDeletedOfflineGroupMessages(group);
    expect(chatTM.handleDeletedOfflineMessageJob).toBeCalled();
    expect(chatTM._sendingDeleted.ALIENS).toBe(true);
  });

  it('fails with an error', () => {
    const error = new Error('error');
    const group = 'ALIENS';
    const message = { _id: 'XOR256T', group: 'ALIENS' };
    chatTM._sendingDeleted = { ALIENS: false };
    chatTM._groupManager.getDeletedMessages = jest.fn(() => [message]);
    chatTM.handleDeletedOfflineMessageJob = jest.fn(() => {
      throw error;
    });

    chatTM._handleDeletedOfflineGroupMessages(group);
    expect(chatTM.handleDeletedOfflineMessageJob).toBeCalled();
    // expect(chatTM._sendingDeleted.ALIENS).toBe(true);
  });
});

it('chatTaskManager gets message info', () => {
  const messageId = 'BYE123567';
  const callback = () => {};
  RC.getMessageInfo = jest.fn();
  chatTaskManager.getMessageInfo(messageId, callback);
  expect(RC.getMessageInfo).toBeCalled();
  expect(RC.getMessageInfo).toBeCalledWith({ messageId }, callback);
});

describe('chatTaskManager starts video conference', () => {
  it('conference started', async () => {
    const groupId = 'N78GIop98aD';
    RC.startVideoConference = jest.fn();
    expect.assertions(1);
    await chatTaskManager.startVideoConference(groupId);
    expect(RC.startVideoConference.mock.calls.length).toBe(1);
  });

  it('conference failed', async () => {
    const groupId = 'N78GIop98aD';
    RC.startVideoConference = jest.fn(() => Promise.reject(mockError));
    expect.assertions(1);
    await chatTaskManager.startVideoConference(groupId);
    expect(RC.startVideoConference.mock.calls.length).toBe(1);
  });
});
