/*
 * group related data structures
 */

import Constants from './constants';
import { Application } from '@mongrov/config';

const GroupSchema = {
  name: Constants.Group,
  primaryKey: '_id',
  properties: {
    // -- identity
    _id: 'string',
    name: { type: 'string', default: '' },
    title: { type: 'string', default: '' },
    // members: { type: 'list', objectType: Constants.User },
    avatar: { type: 'string', default: '' },
    avatarUpdatedAt: { type: 'date', optional: true },

    // -- type & status
    type: { type: 'string', default: Constants.G_PUBLIC }, // direct (1:1), public (open channel), private (group)
    unread: { type: 'int', default: 0 },

    // -- meta data
    updatedAt: { type: 'date', optional: true },
    displayMessage: { type: 'string', optional: true },
    displayLastMessageAt: { type: 'date', optional: true },
    displayMessageUser: { type: 'string', optional: true },
    status: { type: 'string', optional: true },
    calender: { type: 'string', optional: true },
    // lastMessageAt: { type: 'date', optional: true },
    userMuted: { type: 'bool', default: false },
    roles: { type: 'string?[]' },
    announcement: { type: 'string', optional: true },
    // ro: { type: 'bool', optional: true },
    // -- data  ``
    // messages: { type: 'list', objectType: Constants.Message },
    moreMessages: { type: 'bool', default: false },
    readonly: { type: 'bool', default: false },
  },
};

export default class Group {
  get avatarURL() {
    let avatarpath = '';
    if (this.type === 'd') {
      avatarpath = this.avatarUpdatedAt
        ? `${Application.urls.SERVER_URL}/avatar/${this.name}?d=${this.avatarUpdatedAt}`
        : `${Application.urls.SERVER_URL}/avatar/${this.name}`;
    }
    return avatarpath;
  }

  get groupHeading() {
    return this.name || this.title;
  }
}
Group.schema = GroupSchema;
