import AppUtil from '@utils';
import Errors from '../../constants/errors';
import { Application } from '@mongrov/config';

const MODULE = 'CalenderTaskManager';
const { FETCH_CALENDER } = Application.JOBNAME;
export default class CalenderTaskManager {
  constructor(taskManager, dbManager) {
    // temp assigning RC here. It need to be passed
    if (taskManager && dbManager) {
      this._taskManager = taskManager;
      this._dbManager = dbManager;
      this._provider = this._taskManager.provider;
      this._initcalenderTaskManager();
    }
  }

  _initcalenderTaskManager() {
    this._initRegisterFetchCalender();
  }

  _initRegisterFetchCalender() {
    this._taskManager.queue.addWorker(
      FETCH_CALENDER,
      async (jobID, calenderUrl) => {
        try {
          if (calenderUrl) {
            const calenderList = await this._taskManager.provider.fetchCalendarICS(calenderUrl);
            this._dbManager.calender.addEvents(calenderList);
          } else {
            this._logError(900, FETCH_CALENDER, 'No url present');
          }
          // this._dbManager.app.addEvents(calenderList);
        } catch (error) {
          this._logError(500, FETCH_CALENDER, error.message);
        }
      },
      {
        concurrency: 1,
      },
    );
  }

  fetchCalender(calenderUrl) {
    this._taskManager.createJob(FETCH_CALENDER, calenderUrl);
  }

  _logError = (errorCode, action, description) => {
    const _description = description || Errors.http.default;
    const errObj = {
      _id: AppUtil.createGuid(),
      desc: `${_description}`,
      code: errorCode ? errorCode.toString() : 418,
      action: action || 'false',
      module: MODULE,
    };
    this._dbManager.app.logError(errObj);
  };
}
