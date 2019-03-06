import CalenderTaskManager from '../CalenderTaskManager';
import TaskManager from '../../TaskManager';

import { Application } from '@mongrov/config';

const RC = {};
TaskManager.provider = RC;
// const taskManager = new TaskManager();
// const dbManager = new DBManager();
let calenderTaskManager;
const { FETCH_CALENDER } = Application.JOBNAME;

class AppManager {}

class CalenderManager {}
const app = new AppManager();
const calender = new CalenderManager();
class DBManager {
  constructor() {
    this.app = app;
    this.calender = calender;
  }
}

const dbManager = new DBManager();
// const calenderResponse = "BEGIN:VCALENDAR\r\nPRODID:-//Google Inc//Google Calendar 70.9054//EN\r\nVERSION:2.0\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:TEST\r\nX-WR-TIMEZONE:Asia/Kolkata\r\nBEGIN:VEVENT\r\nDTSTART:20190128T100000Z\r\nDTEND:20190128T110000Z\r\nDTSTAMP:20190205T105234Z\r\nUID:6hmj5trqamv0ue6utjn4nshss8@google.com\r\nCREATED:20190204T105905Z\r\nDESCRIPTION:\r\nLAST-MODIFIED:20190204T105905Z\r\nLOCATION:\r\nSEQUENCE:0\r\nSTATUS:CONFIRMED\r\nSUMMARY:Chemistry\r\nTRANSP:OPAQUE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20190128T090000Z\r\nDTEND:20190128T100000Z\r\nDTSTAMP:20190205T105234Z\r\nUID:3c76modjpi26hst4ttagqekb5e@google.com\r\nCREATED:20190204T105845Z\r\nDESCRIPTION:\r\nLAST-MODIFIED:20190204T105845Z\r\nLOCATION:\r\nSEQUENCE:0\r\nSTATUS:CONFIRMED\r\nSUMMARY:English\r\nTRANSP:OPAQUE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20190128T080000Z\r\nDTEND:20190128T090000Z\r\nDTSTAMP:20190205T105234Z\r\nUID:4mk10g119ns7k4m9s765ne139n@google.com\r\nCREATED:20190204T105828Z\r\nDESCRIPTION:\r\nLAST-MODIFIED:20190204T105828Z\r\nLOCATION:\r\nSEQUENCE:0\r\nSTATUS:CONFIRMED\r\nSUMMARY:Lunch\r\nTRANSP:OPAQUE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20190128T070000Z\r\nDTEND:20190128T080000Z\r\nDTSTAMP:20190205T105234Z\r\nUID:6mvnpfgsd2tavrruhjjcd3m5mv@google.com\r\nCREATED:20190204T105803Z\r\nDESCRIPTION:\r\nLAST-MODIFIED:20190204T105803Z\r\nLOCATION:\r\nSEQUENCE:0\r\nSTATUS:CONFIRMED\r\nSUMMARY:tamil\r\nTRANSP:OPAQUE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20190128T060000Z\r\nDTEND:20190128T070000Z\r\nDTSTAMP:20190205T105234Z\r\nUID:1178ih9khqqmu4be22seqvtm5r@google.com\r\nCREATED:20190204T105530Z\r\nDESCRIPTION:\\nClick the following link to join the meeting from your comput\r\n er: https://meet.jit.si/OrangeWorkersIntersectExpectantly\\n\\n=====\\n\\nJust \r\n want to dial in on your phone?\\n\\nCall one of the following numbers: \\nAust\r\n ralia: +61.8.7150.1136\\nBrazil: +55.21.3500.0112\\nFrance: +33.1.84.88.6478\\\r\n nGermany: +49.89.380.38719\\nJapan: +81.3.4510.2372\\nSpain: +34.932.205.409\\\r\n nUK: +44.121.468.3154\\nUS: +1.512.402.2718\\n\\nDial your meeting ID: \'392784\r\n 6824\' and you will be connected!\r\nLAST-MODIFIED:20190204T105530Z\r\nLOCATION:Jitsi Meeting - https://meet.jit.si/OrangeWorkersIntersectExpectan\r\n tly \r\nSEQUENCE:0\r\nSTATUS:CONFIRMED\r\nSUMMARY:Physics\r\nTRANSP:OPAQUE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20190128T050000Z\r\nDTEND:20190128T060000Z\r\nDTSTAMP:20190205T105234Z\r\nUID:0g7110qqftmg6i8docf26c3ca5@google.com\r\nCREATED:20190204T105449Z\r\nDESCRIPTION:\r\nLAST-MODIFIED:20190204T105449Z\r\nLOCATION:\r\nSEQUENCE:0\r\nSTATUS:CONFIRMED\r\nSUMMARY:EVS\r\nTRANSP:OPAQUE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20190128T030000Z\r\nDTEND:20190128T040000Z\r\nDTSTAMP:20190205T105234Z\r\nUID:0u61tcbiuvukpasrta40jk5b34@google.com\r\nCREATED:20190204T105258Z\r\nDESCRIPTION:PT period\r\nLAST-MODIFIED:20190204T105420Z\r\nLOCATION:\r\nSEQUENCE:1\r\nSTATUS:CONFIRMED\r\nSUMMARY:PT\r\nTRANSP:OPAQUE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20190128T040000Z\r\nDTEND:20190128T050000Z\r\nDTSTAMP:20190205T105234Z\r\nUID:6ooer3fqftqfaund5hcrege1e1@google.com\r\nCREATED:20190204T105405Z\r\nDESCRIPTION:\r\nLAST-MODIFIED:20190204T105405Z\r\nLOCATION:\r\nSEQUENCE:0\r\nSTATUS:CONFIRMED\r\nSUMMARY:Moral science\r\nTRANSP:OPAQUE\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n"
// const calenderResponse = "BEGIN:VCALENDAR\r\nPRODID";

beforeAll(async () => {
  await TaskManager.initQueue();
  calenderTaskManager = new CalenderTaskManager(TaskManager, dbManager);
});
it('initial test', () => {
  expect(calenderTaskManager).toBeTruthy();
  expect(calenderTaskManager).toBeInstanceOf(CalenderTaskManager);
  expect(calenderTaskManager._dbManager).toEqual(dbManager);
  expect(calenderTaskManager._taskManager).toEqual(TaskManager);
  expect(calenderTaskManager._provider).toEqual(RC);
});

it('app task handler constructor with null provoider', () => {
  calenderTaskManager._initcalenderTaskManager();
  expect(TaskManager.queue.isWorkerPresent(FETCH_CALENDER)).toBe(true);
});

it('to call fetchCalender without URL', () => {
  dbManager.app.logError = jest.fn();
  calenderTaskManager._logError(300, 'FETCH_CALENDER', 'test error');
  expect(dbManager.app.logError).toHaveBeenCalled();
});
it('to call fetchCalender without URL', () => {
  dbManager.app.logError = jest.fn();
  calenderTaskManager._logError();
  expect(dbManager.app.logError).toHaveBeenCalled();
});

it('to call fetchCalender without URL', () => {
  calenderTaskManager._logError = jest.fn();
  calenderTaskManager.fetchCalender(false);
  expect(calenderTaskManager._logError).toHaveBeenCalled();
});

// it('to call fetchCalender with URL', () => {
//   console.log("FETCH URL WITH CORRECT RESULT")
//   TaskManager.provider.fetchCalendarICS = jest.fn(() => new Promise((resolve,reject) => {
//     resolve(calenderResponse);
//   }));
//   dbManager.calender.addEvents = jest.fn();
//   calenderTaskManager.fetchCalender("MOCK_URL");
//   expect(dbManager.calender.addEvents).toHaveBeenCalled();
// });

it('to call fetchCalender with URL', () => {
  TaskManager.provider.fetchCalendarICS = jest.fn();
  calenderTaskManager.fetchCalender('MOCK_URL');
  expect(TaskManager.provider.fetchCalendarICS).toHaveBeenCalled();
});

it('to call fetchCalender with URL', () => {
  console.log('FETCH URL WITH CORRECT RESULT 23');
  TaskManager.provider.fetchCalendarICS = undefined;
  calenderTaskManager.fetchCalender('MOCK_URL');
  expect(calenderTaskManager._logError).toHaveBeenCalled();
});

describe('deleteComment', () => {
  const calenderUrl = 'corp.mongrov.com';
  const error = new Error('error');

  it('fetchCalendarICS ', async () => {
    RC.fetchCalendarICS = jest.fn((id, cb) => cb(error, null));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(FETCH_CALENDER).options = {
      onSuccess,
      onFailed,
    };
    calenderTaskManager.fetchCalender(calenderUrl);
    expect(onSuccess.mock.calls.length).toBe(1);
  });
});
