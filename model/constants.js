/**
 * Database constants
 */

export default {
  MODULE: 'Database',

  // tables
  App: 'falconz',
  Setting: 'setting',
  Login: 'login',
  Errors: 'errors',
  Group: 'Group',
  Message: 'Message',
  User: 'User',
  Board: 'Board',
  Members: 'Members',
  Lists: 'Lists',
  Card: 'Card',
  CardComments: 'CardComments',
  Checklists: 'Checklists',
  Checklistitems: 'Checklistitems',
  Wallet: 'Wallet',
  Calender: 'Calender',
  CalenderEvents: 'CalenderEvents',

  // group types
  G_PUBLIC: 'c', // 'public',
  G_PRIVATE: 'private',
  G_DIRECT: 'd', // 'direct',

  // Message status
  M_LOCAL: 0,
  M_DELIVERED: 10,
  M_READ: 100,
  M_DELETED: -1,

  // User status
  U_ONLINE: 'online',
  U_OFFLINE: 'offline',
  U_AWAY: 'away',
  U_BUSY: 'busy',

  // Message type
  M_TYPE_TEXT: 0,
  M_TYPE_IMAGE: 1,
  M_TYPE_VIDEO: 2,
  M_TYPE_AUDIO: 3,
  M_TYPE_LOCATION: 4,

  // common date fields
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  DISPLAY_MESSAGE_AT: 'displayLastMessageAt',
};
