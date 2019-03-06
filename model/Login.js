/*
 * app related data structures
 */
import Constants from './constants';

const LoginSchema = {
  name: Constants.Login,
  primaryKey: 'userName',
  properties: {
    userName: { type: 'string', optional: true },
    userPwd: { type: 'string', optional: true },
  },
};

export default class Login {}

Login.schema = LoginSchema;
