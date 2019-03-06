/*
 * app related data structures
 */
import Constants from './constants';

const SettingSchema = {
  name: Constants.Setting,
  primaryKey: '_id',
  properties: {
    _id: 'string',
    value: { type: 'string', default: '' },
  },
};

export default class Setting {}

Setting.schema = SettingSchema;
