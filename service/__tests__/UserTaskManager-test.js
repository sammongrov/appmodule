import 'react-native';
import queueFactory from 'react-native-queue';
import UserTaskManager from '../UserTaskManager';

const mockMonitorOnLogin = jest.fn();
const mockSubscribeToUserChanges = jest.fn();
const mockSetUserPresence = jest.fn();
class RocketChat {
  monitorOnLogin = () => mockMonitorOnLogin();

  subscribeToUserChanges = () => mockSubscribeToUserChanges();

  setUserPresence = (status) => mockSetUserPresence(status);
}
const RC = new RocketChat();

const nullObj = null;
class TaskManager {
  constructor() {
    this.provider = RC;
    this.initQueue();
  }

  async initQueue() {
    this.queue = await queueFactory();
  }

  createJob = (jobName, arg, retryCount = 1, priority = 5, timeout = 2000) => {
    if (!this.queue) {
      this.initQueue();
    }

    this.queue.createJob(jobName, arg, {
      priority,
      timeout,
      retryCount,
    });
  };
}

class UserManager {
  constructor() {
    console.log('User Manager initiated');
  }
}

class GroupManager {
  constructor() {
    console.log('Group Manager initiated');
  }
}

class DBManager {
  constructor() {
    this.user = new UserManager();
    this.group = new GroupManager();
  }
}
let userTaskHandler;
let nullUserTaskHandler;

describe(' test after intializing', () => {
  beforeAll(async () => {
    const taskManager = new TaskManager();
    const dbManager = new DBManager();
    await taskManager.initQueue();
    userTaskHandler = new UserTaskManager(taskManager, dbManager);
    nullUserTaskHandler = new UserTaskManager(nullObj);
  });

  it('app task handler constructor with null provoider', () => {
    expect(nullUserTaskHandler._taskManager).toBe(null || undefined);
    expect(nullUserTaskHandler._dbManager).toBe(null || undefined);
  });

  it('app task handler constructor with provoider', () => {
    expect(userTaskHandler._taskManager).not.toBe(null || undefined);
    expect(userTaskHandler._dbManager).not.toBe(null || undefined);
    // expect(appTaskHandler.initTaskManager).toHaveBeenCalled();
  });

  it('set users function to be called', async () => {
    const setUserList = [
      {
        _id: 'tmRSSha8mp9buXcCA',
        emails: [{ address: 'sam@mongrov.com', verified: false }],
        profile: { language: 'en', boardView: 'board-view-lists' },
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

    userTaskHandler._userService.dataToUser = jest.fn(() => {
      const expectedUserSchema = [
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
      return expectedUserSchema;
    });
    userTaskHandler._userManager.createBulkUser = jest.fn();
    userTaskHandler._groupManager.updateGroupsStatus = jest.fn(() => 'hello');
    expect.assertions(3);
    await userTaskHandler.setUsers(setUserList);
    expect(userTaskHandler._userService.dataToUser).toBeCalled();
    expect(userTaskHandler._userManager.createBulkUser).toBeCalled();
    expect(userTaskHandler._groupManager.updateGroupsStatus).toBeCalled();
    // expect(mockMonitorOnLogin).toBeCalled();
  });
});

it('subscribe to user changes and set the user online', () => {
  mockSubscribeToUserChanges.mockClear();
  userTaskHandler.subscribeAndStatus();
  expect(mockSubscribeToUserChanges).toBeCalled();
});

describe('userTaskManager sets user status', () => {
  beforeAll(async () => {
    const taskManager = new TaskManager();
    const dbManager = new DBManager();
    await taskManager.initQueue();
    userTaskHandler = new UserTaskManager(taskManager, dbManager);
    nullUserTaskHandler = new UserTaskManager(nullObj);
    userTaskHandler._userManager.setUserStatusLocally = jest.fn();
  });

  beforeEach(() => {
    mockSetUserPresence.mockClear();
    userTaskHandler._userManager.setUserStatusLocally.mockClear();
  });

  it('to be online', async () => {
    expect.assertions(3);
    await userTaskHandler.setUserStatus('online');
    expect(userTaskHandler._userManager.setUserStatusLocally).toBeCalled();
    expect(mockSetUserPresence).toBeCalled();
    expect(mockSetUserPresence).toBeCalledWith('online');
  });

  it('to be away', async () => {
    expect.assertions(3);
    await userTaskHandler.setUserStatus('away');
    expect(userTaskHandler._userManager.setUserStatusLocally).toBeCalled();
    expect(mockSetUserPresence).toBeCalled();
    expect(mockSetUserPresence).toBeCalledWith('away');
  });

  it('to be busy', async () => {
    expect.assertions(3);
    await userTaskHandler.setUserStatus('busy');
    expect(userTaskHandler._userManager.setUserStatusLocally).toBeCalled();
    expect(mockSetUserPresence).toBeCalled();
    expect(mockSetUserPresence).toBeCalledWith('busy');
  });

  it('to be offline', async () => {
    expect.assertions(3);
    await userTaskHandler.setUserStatus();
    expect(userTaskHandler._userManager.setUserStatusLocally).toBeCalled();
    expect(mockSetUserPresence).toBeCalled();
    expect(mockSetUserPresence).toBeCalledWith('offline');
  });
});
