import UserService from '../UserService';

class RC {
  constructor() {
    console.log('RC INTIATED');
  }
}

class UserManger {
  constructor() {
    console.log('RC UserManger');
  }
}

const rc = new RC();
const userManager = new UserManger();
const userService = new UserService(rc, userManager);

describe(' test after intializing', () => {
  it('UserService is instantiated successfully', () => {
    expect(userService).toBeTruthy();
    expect(userService).toBeInstanceOf(UserService);
    expect(userService._provider).toEqual(rc);
    expect(userService._userManager).toEqual(userManager);
  });

  it('UserService is instantiated without provider', () => {
    const userServiceWithoutProvider = new UserService(null, userManager);
    expect(userServiceWithoutProvider).toBeTruthy();
    expect(userServiceWithoutProvider).toBeInstanceOf(UserService);
    expect(userServiceWithoutProvider._provider).toBeUndefined();
    expect(userServiceWithoutProvider._userManager).toBeUndefined();
  });

  it('dataToUser to be called', () => {
    const setUserList = [
      {
        _id: 'tmRSSha8mp9buXcCA',
        emails: [{ address: 'sam@mongrov.com', verified: false }],
        profile: { language: 'en', boardView: 'board-view-lists' },
        username: 'sam',
        _version: 2,
        name: 'Swaminathan',
        status: 'online',
        utcOffset: 5.5,
      },
      {
        _id: '7jrYSSS8EA6y8hXFy',
        name: 'Marina Biletska',
        emails: 'marina@mongrov.com',
        status: 'online',
        username: 'marina',
        utcOffset: 2,
        _version: 1,
      },
      {
        _id: 'Ri9cohELZeCwxmtvd',
        name: 'Mohanasundaram Jemini',
        status: 'online',
        username: 'mohan',
        utcOffset: 5.5,
        _version: 1,
      },
      {
        _id: '2EknsjL7tEmeZjoPY',
        name: 'ezhilarasu',
        status: 'away',
        username: 'ezhil',
        utcOffset: 5.5,
        _version: 1,
      },
    ];
    const expectedUserSchema = [
      {
        _id: 'tmRSSha8mp9buXcCA',
        emails: 'sam@mongrov.com',
        username: 'sam',
        _version: 2,
        name: 'Swaminathan',
        status: 'online',
        utcOffset: 5.5,
      },
      {
        _id: '7jrYSSS8EA6y8hXFy',
        name: 'Marina Biletska',
        emails: 'marina@mongrov.com',
        status: 'online',
        username: 'marina',
        utcOffset: 2,
        _version: 1,
      },
      {
        _id: 'Ri9cohELZeCwxmtvd',
        name: 'Mohanasundaram Jemini',
        status: 'online',
        username: 'mohan',
        utcOffset: 5.5,
        _version: 1,
      },
      {
        _id: '2EknsjL7tEmeZjoPY',
        name: 'ezhilarasu',
        status: 'away',
        username: 'ezhil',
        utcOffset: 5.5,
        _version: 1,
      },
    ];
    const userSchema = userService.dataToUser(setUserList);

    expect(userSchema).toEqual(expectedUserSchema);
  });
});
