/*
 * Lists model/schema file
 */

import Constants from '../constants';

const ListsSchema = {
  name: Constants.Lists,
  primaryKey: '_id',
  properties: {
    // -- identity
    _id: 'string',
    title: 'string',
    boardId: 'string',
    createdAt: { type: 'date', optional: true },
    sort: { type: 'int', default: 0 },
  },
};
export default class Lists {}

Lists.schema = ListsSchema;
