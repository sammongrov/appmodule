import 'react-native';
import moment from 'moment';
import Realm from './_realm';
// import Constants from '../../constants';
import CalenderManager from '../events/CalenderManager';

jest.mock('../../../utils/index', () => ({
  removeEmptyValues: jest.fn((obj) => obj),
}));
const AppUtil = require('../../../utils/index');

class CalenderTaskManager {
  constructor() {
    console.log('Calener task manager');
  }
}
class TaskManager {
  constructor() {
    console.log('taskmanager intialized');
    this._calender = new CalenderTaskManager();
  }
}
const transformGroupsToObj = (groupsArr) =>
  groupsArr.reduce((acc, group, index) => {
    acc[index] = group;
    return acc;
  }, {});

let recurrenceID = true;
let rrule = true;
const vevent = [
  {
    getFirstPropertyValue: (id) => {
      if (id === 'recurrence-id') {
        return recurrenceID;
      }
      if (id === 'rrule') {
        return rrule;
      }
      return true;
    },
  },
];

const vcal = {
  getFirstPropertyValue: (value) => value,
  getAllSubcomponents: () => vevent,
};

const icaljs = {
  parse: (responseText) => responseText,
  Component: () => vcal,
};
const listener = jest.fn();
const taskManager = new TaskManager();
const realmObj = Realm;
const calender = new CalenderManager(realmObj, taskManager);
// const vevent= [{
//   getFirstPropertyValue :(value) =>value
// }]

console.log('MOMENT', moment);
calender.icaljs = icaljs;
it('fetch calender event', () => {
  calender.config = {};
  // calender.fetchCalenderEvent();
  expect(calender.fetchCalenderEvent()).toBe(false);
});

it('fetch calender event', () => {
  taskManager._calender.fetchCalender = jest.fn(() => {
    console.log('FETCH CALENDER');
  });
  calender.config = {
    CALENDER_URL: ['mock_url'],
  };
  calender.fetchCalenderEvent();
  expect(taskManager._calender.fetchCalender).toHaveBeenCalled();
});

it('getCalenderData', () => {
  calender.getCalenderData('Sunday', 'Mongrov calender');
});

// without the db
describe('tests without db', () => {
  const calenderWithoutRealm = new CalenderManager();

  it('cardmanager addAll method catches an error', () => {
    AppUtil.removeEmptyValues.mockClear();
    const calenderlist = {
      title: 'calender',
      calenderName: 'Mongrov calender',
      day: 'monday',
      startTime: '22.02.2019',
      endTime: '22.02.2019',
      description: 'GOOD DAY',
    };

    try {
      calenderWithoutRealm._createNewCalender(transformGroupsToObj([calenderlist]));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
// general tests

it('calendermanager with no param', () => {
  const deletellcalender1 = calender._deleteCalender(null);
  expect(deletellcalender1).toBeUndefined();
});
it('adds a group listener', () => {
  let addListenerError = null;
  try {
    calender.addCalenderListner(listener);
  } catch (error) {
    addListenerError = error;
  }
  expect(addListenerError).toBeNull();
});
it('adds a group listener', () => {
  let addListenerError = null;
  try {
    calender.removeCalenderListener(listener);
  } catch (error) {
    addListenerError = error;
  }
  expect(addListenerError).toBeNull();
});

it('fetch calender event with recurence id true', () => {
  // taskManager._calender.fetchCalender = jest.fn(() => {
  //   console.log('FETCH CALENDER');
  // });
  // calender.config = {
  //   CALENDER_URL: ['mock_url'],
  // };
  // const vcal  =jest.fn(() => {
  //   const getFirstPropertyValue = (() => {

  //   })
  // })
  // vcal.getFirstPropertyValue = jest.fn((value) => value)
  // vcal.getAllSubcomponents = jest.fn((value) => value)

  calender._deleteCalender = jest.fn(() => new Promise((resolve) => resolve(true)));

  calender._createNewCalender = jest.fn(() => true);

  calender.addEvents();
  expect(calender._deleteCalender).toHaveBeenCalled();
});

it('fetch calender event with recurence id false', () => {
  // taskManager._calender.fetchCalender = jest.fn(() => {
  //   console.log('FETCH CALENDER');
  // });
  // calender.config = {
  //   CALENDER_URL: ['mock_url'],
  // };
  // const vcal  =jest.fn(() => {
  //   const getFirstPropertyValue = (() => {

  //   })
  // })
  // vcal.getFirstPropertyValue = jest.fn((value) => value)
  // vcal.getAllSubcomponents = jest.fn((value) => value)

  recurrenceID = false;
  rrule = false;
  calender.addEvents();
  calender._deleteCalender = jest.fn(() => true);
  calender._createNewCalender = jest.fn(() => true);
  // expect(calender._createNewCalender).toHaveBeenCalled();
});
