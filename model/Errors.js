/*
 * app related data structures
 */
import Constants from './constants';

const errorsSchema = {
  name: Constants.Errors,
  primaryKey: '_id',
  properties: {
    _id: 'string',
    createdAt: { type: 'date', default: new Date() },
    desc: { type: 'string', optional: false },
    code: { type: 'string', optional: true },
    action: { type: 'string', default: 'NO_ACTION' },
  },
};

export default class Errors {}

Errors.schema = errorsSchema;
