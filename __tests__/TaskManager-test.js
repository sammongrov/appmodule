import queueFactory from 'react-native-queue';
// import RC from '@rc';
// import AppTaskManager from '../service/AppTaskManager';
// import ChatTaskManager from '../service/ChatTaskManager';
import TaskManager from '../TaskManager';
// import BoardTaskManager from '../service/BoardTaskManager';
// import AppManager from '../model/AppManager';
// import GroupManager from '../model/GroupManager';
// import UserTaskManager from '../service/UserTaskManager';

class AppManager {
  constructor() {
    console.log('AppManager MANAGER INTIATED');
  }
}

class GroupManager {
  constructor() {
    console.log('GroupManager MANAGER INTIATED');
  }
}

class DBManager {
  constructor() {
    this.app = new AppManager();
    this.group = new GroupManager();
  }
}

class RC {
  constructor() {
    console.log('RC INTIATED');
  }
}

const TS = TaskManager.constructor;
const rcObj = new RC();
rcObj.monitorOnLogin = jest.fn();
TaskManager.provider = rcObj;

const dbManager = new DBManager();

class AppTaskManager {
  constructor() {
    console.log('APP TASK MANAGER INTIATED');
  }

  montiorChangeInConnection() {
    return true;
  }
}

class ChatTaskManager {
  constructor() {
    console.log('chat TASK MANAGER INTIATED');
  }
}

class UserTaskManager {
  constructor() {
    console.log('usert TASK MANAGER INTIATED');
  }
}

const appTaskManager = new AppTaskManager();
const chatTaskManager = new ChatTaskManager(TaskManager, dbManager);

const userTaskManager = new UserTaskManager(TaskManager, dbManager);

let queue;

const TESTJOBNAME = 'Test';
const TESTJOBNAME1 = 'Test1';

beforeAll(async () => {
  queue = await queueFactory();
  queue.addWorker(TESTJOBNAME, async () => {}, {
    concurrency: 1,
    onSuccess: () => console.log('success is executed'),
  });
  queue.addWorker(TESTJOBNAME1, async () => {}, {
    concurrency: 1,
    onSuccess: () => console.log('success is executed again'),
  });
});

it('TaskManager is instantiated successfully', () => {
  expect(TaskManager).toBeTruthy();
  expect(TaskManager).toBeInstanceOf(TS);
});

it('TaskManager inits queue', async () => {
  expect.assertions(1);
  await TaskManager.initQueue();
  expect(TaskManager.queue).toBeInstanceOf(queue.constructor);
});

it('TaskManager inits DBManager', () => {
  TaskManager.initDBManager(dbManager);
  expect(TaskManager._dbManager).toEqual(dbManager);
});

it("TaskManager doesn't init other TaskManagers", () => {
  TaskManager._provider = null;
  TaskManager._app = null;
  TaskManager._chat = null;
  TaskManager._user = null;

  TaskManager._initTaskManagers();
  expect(TaskManager._app).toBeNull();
  expect(TaskManager._chat).toBeNull();
  expect(TaskManager._user).toBeNull();
});

it('TaskManager inits other TaskManagers', () => {
  TaskManager._provider = RC;
  TaskManager._app = null;
  TaskManager._chat = null;
  TaskManager._user = null;

  TaskManager._initTaskManagers();
  expect(TaskManager._app).toBeInstanceOf(AppTaskManager);
  expect(TaskManager._chat).toBeInstanceOf(ChatTaskManager);
  expect(TaskManager._user).toBeInstanceOf(UserTaskManager);
});

it('TaskManager creates a job with null queue', async () => {
  TaskManager.queue = null;
  expect.assertions(2);
  await TaskManager.createJob(TESTJOBNAME, {});
  expect(TaskManager.queue).toBeDefined();
  expect(TaskManager.queue).toBeInstanceOf(queue.constructor);
});

it('TaskManager creates a job with not null queue', async () => {
  expect.assertions(1);
  await expect(TaskManager.createJob(TESTJOBNAME1, {})).resolves.toBeUndefined();
});

it('TaskManager gets app', () => {
  TaskManager._app = appTaskManager;
  expect(TaskManager.app).toEqual(appTaskManager);
});

it('TaskManager gets chat', () => {
  TaskManager._chat = chatTaskManager;
  expect(TaskManager.chat).toEqual(chatTaskManager);
});

it('TaskManager gets user', () => {
  TaskManager._user = userTaskManager;
  expect(TaskManager.user).toEqual(userTaskManager);
});

it('TaskManager gets board', () => {
  TaskManager._board = userTaskManager;
  expect(TaskManager.board).toEqual(userTaskManager);
});
it('TaskManager gets provider', () => {
  TaskManager._provider = RC;
  expect(TaskManager.provider).toEqual(RC);
});

it('TaskManager sets provider', () => {
  TaskManager.provider = {};
  expect(TaskManager._provider).toEqual({});
});
