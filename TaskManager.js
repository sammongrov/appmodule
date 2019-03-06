// import { NetInfo, AppState } from 'react-native';
import AppUtil from '@utils';
import queueFactory from 'react-native-queue';
import AppTaskManager from './service/AppTaskManager';
import ChatTaskManager from './service/ChatTaskManager';
import UserTaskManager from './service/UserTaskManager';
import BoardTaskManager from './service/BoardTaskManager';
import CalenderTaskManager from './service/CalenderTaskManager';

const MODULE = 'TaskManager';

class TaskManager {
  constructor() {
    AppUtil.debug(`TaskManager initiated`, MODULE);
  }

  /* Initiate Queue Handler */
  initQueue = async () => {
    this.queue = await queueFactory();
  };

  initDBManager = (dbManager) => {
    this._dbManager = dbManager;
    this._initTaskManagers();
  };

  _initTaskManagers = () => {
    if (this.provider) {
      // const push = new PushService();
      // PushService.init();
      this._app = new AppTaskManager(this, this._dbManager);
      this._chat = new ChatTaskManager(this, this._dbManager);
      this._user = new UserTaskManager(this, this._dbManager);
      this._board = new BoardTaskManager(this, this._dbManager);
      this._calender = new CalenderTaskManager(this, this._dbManager);
    }
  };

  // need to be async
  // if this.queue is null, it doesn't wait for its init
  createJob = async (jobName, arg, retryCount = 1, priority = 5, timeout = 2000) => {
    if (!this.queue) {
      await this.initQueue();
    }

    this.queue.createJob(jobName, arg, {
      priority,
      timeout,
      retryCount,
    });
  };

  // refer to AppTaskManager for methods that can be accessed
  get app() {
    return this._app;
  }

  get chat() {
    return this._chat;
  }

  get board() {
    return this._board;
  }

  get user() {
    return this._user;
  }

  get provider() {
    return this._provider;
  }

  set provider(provider) {
    this._provider = provider;
  }

  // handlers to update network/app states
}

module.exports = new TaskManager();
