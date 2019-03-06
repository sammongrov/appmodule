/* global it expect jest */
import 'react-native';

import { Database } from '@db';

import { AppManager, AppService } from '../';

it('app test', () => {
  console.log(Database);
  console.log(AppManager);
  console.log(AppService);
});
