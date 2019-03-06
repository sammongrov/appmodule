import AppUtil from '@mongrov/utils';

const MODULE = 'UserService';

export default class UserService {
  constructor(provider, userManager) {
    if (provider) {
      // Need to verify with Sami, since the below line throws error.
      // this._provider = provider.meteor;
      this._provider = provider;
      this._userManager = userManager;
      AppUtil.debug(`UserTaskManager intiated`, MODULE);
    }
  }

  dataToUser(results) {
    try {
      const user = results.map((currenUser) => {
        const _currenUser = currenUser;
        let emails = null;
        if (_currenUser.emails) {
          emails =
            typeof currenUser.emails === 'string'
              ? currenUser.emails
              : currenUser.emails[0].address;
        }
        _currenUser.emails = emails || null;
        delete _currenUser.profile;
        return AppUtil.removeEmptyValues(_currenUser);
      });
      return user;
    } catch (error) {
      AppUtil.debug(`ERROR IN DATA TO USER == ${error}`, MODULE);
    }
  }
}
