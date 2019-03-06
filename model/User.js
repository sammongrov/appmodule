/*
 * group related data structures
 */

import Constants from './constants';
import { Application } from '@mongrov/config';

const UserSchema = {
  name: Constants.User,
  primaryKey: '_id',
  properties: {
    // -- identity
    _id: 'string',
    username: 'string?',
    name: 'string?',
    emails: { type: 'string', optional: true },

    // -- type & status
    type: { type: 'string', optional: true },
    active: { type: 'string', optional: true },
    status: { type: 'string', default: Constants.U_OFFLINE }, // ONLINE, OFFLINE, AWAY, BUSY
    statusConnection: { type: 'string', default: Constants.U_OFFLINE }, // ONLINE, OFFLINE, AWAY, BUSY
    utcOffset: { type: 'int', optional: true },
    roles: 'string?[]',
    avatar: { type: 'string', default: '' },

    // -- meta data
    lastLogin: { type: 'date', optional: true },
    createdAt: { type: 'date', optional: true },
    deleteMessageRoles: 'string?[]',
  },
};

export default class User {
  get avatarURL() {
    return `${Application.urls.SERVER_URL}/avatar/${this.username}?_dc=undefined`;
  }
}

User.schema = UserSchema;
