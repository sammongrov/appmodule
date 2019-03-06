/*
 * Board model/schema file
 */

import Constants from '../constants';

const CalenderSchema = {
  name: Constants.Calender,
  properties: {
    title: 'string',
    calenderName: 'string',
    day: 'string',
    startTime: { type: 'date', optional: true },
    endTime: { type: 'date', optional: true },
    description: { type: 'string', optional: true },
    repeat: { type: 'bool', optional: true },
    repeatEdit: { type: 'bool', optional: true },
  },
};
export default class Calender {}

Calender.schema = CalenderSchema;
