import Constants from '../constants';

const CalenderEventsSchema = {
  name: Constants.CalenderEvents,
  primaryKey: '_id',
  properties: {
    // -- identity
    _id: 'string',
    startTime: { type: 'date', optional: true },
    endTime: { type: 'date', optional: true },
    description: { type: 'string', optional: true },
  },
};
export default class CalenderEvents {}

CalenderEvents.schema = CalenderEventsSchema;
