// import AppUtil from '@utils';
import icaljs from 'ical.js';
import _ from 'lodash';
import moment from 'moment';
import Constants from '../constants';
import Config from '../../../constants/config';

export default class CalenderManager {
  constructor(realm, taskManager) {
    this._realm = realm;
    this._taskManager = taskManager;
    this._listeners = {};
    this.config = Config;
    this.icaljs = icaljs;
  }

  fetchCalenderEvent(calendarUrl) {
    if (calendarUrl) {
      this._taskManager._calender.fetchCalender(calendarUrl);
    } else {
      return false;
    }
  }

  addEvents = async (responseText) => {
    try {
      let endTime, startTime, repeat, repeatEdit;
      const respCal = this.icaljs.parse(responseText);
      const vcal = new this.icaljs.Component(respCal);
      const calenderName = vcal.getFirstPropertyValue('x-wr-calname');
      // const TimeZone = vcal.getFirstPropertyValue('x-wr-timezone');
      const vevents = vcal.getAllSubcomponents('vevent');
      const events = _.map(vevents, (vevent) => {
        let day;
        // console.log("CALENDER Summary",vevent.getFirstPropertyValue('summary'),"DAY",day);
        if (vevent.getFirstPropertyValue('rrule')) {
          endTime = moment(vevent.getFirstPropertyValue('dtend')._time)
            .subtract(1, 'months')
            .format();
          startTime = moment(vevent.getFirstPropertyValue('dtstart')._time)
            .subtract(1, 'months')
            .format();
          repeat = true;
          repeatEdit = false;
          day = moment(startTime)
            .format('LLLL')
            .split(',');
        }
        if (vevent.getFirstPropertyValue('recurrence-id')) {
          endTime = moment(vevent.getFirstPropertyValue('dtend')._time)
            .subtract(1, 'months')
            .format();
          startTime = moment(vevent.getFirstPropertyValue('dtstart')._time)
            .subtract(1, 'months')
            .format();
          repeat = false;
          repeatEdit = true;
          day = moment(startTime)
            .format('LLLL')
            .split(',');
        }
        if (
          !vevent.getFirstPropertyValue('rrule') &&
          !vevent.getFirstPropertyValue('recurrence-id')
        ) {
          endTime = moment
            .utc(vevent.getFirstPropertyValue('dtend')._time)
            .subtract(1, 'months')
            .format();
          startTime = moment
            .utc(vevent.getFirstPropertyValue('dtstart')._time)
            .subtract(1, 'months')
            .format();
          repeat = false;
          repeatEdit = false;
          day = moment(startTime)
            .format('LLLL')
            .split(',');
        }

        const data = {
          title: vevent.getFirstPropertyValue('summary'),
          startTime,
          endTime,
          day: day[0],
          description: vevent.getFirstPropertyValue('description'),
          calenderName,
          repeat,
          repeatEdit,
        };
        return data;
      });

      await this._deleteCalender(events[0].calenderName);
      this._createNewCalender(events);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  _deleteCalender = async (calenderName) => {
    await this._realm.write(() => {
      const calenderList = this._realm
        .objects(Constants.Calender)
        .filtered(`calenderName="${calenderName}"`);
      this._realm.delete(calenderList);
    });
  };

  _createNewCalender = (events) => {
    events.forEach(async (event) => {
      const calender = {
        calenderName: event.calenderName,
        startTime: event.startTime,
        endTime: event.endTime,
        description: event.description,
        title: event.title,
        day: event.day,
        repeat: event.repeat,
        repeatEdit: event.repeatEdit,
      };
      await this._realm.write(() => {
        this._realm.create(Constants.Calender, calender, true);
      });
    });
  };

  addCalenderListner = (calenderName, listener) => {
    if (calenderName) {
      this._realm.objects(Constants.Calender).addListener(listener);
    }
  };

  removeCalenderListener = (listener) => {
    this._realm.objects(Constants.Calender).removeLIstner(listener);
  };

  getCalenderData = (day, calenderName) =>
    this._realm
      .objects(Constants.Calender)
      .filtered(`calenderName="${calenderName}"`)
      .filtered(`day = $0`, day)
      .sorted('startTime', false);
}
