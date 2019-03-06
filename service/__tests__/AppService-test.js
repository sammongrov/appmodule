import AppService from '../AppService';

const RC = {};
class AppManager {
  constructor() {
    console.log('App Manager is initiated');
  }
}
const appManager = new AppManager();
const appService = new AppService(RC, appManager);
// appService._appManager.setServiceStatus = jest.fn(() => {});

it('appService is instantiated successfully', () => {
  expect(appService).toBeTruthy();
  expect(appService).toBeInstanceOf(AppService);
  expect(appService._provider).toEqual(RC);
  expect(appService._appManager).toEqual(appManager);
});

it('appService is instantiated without provider and manager', () => {
  const appServiceWithoutManagers = new AppService();
  expect(appServiceWithoutManagers).toBeTruthy();
  expect(appServiceWithoutManagers).toBeInstanceOf(AppService);
  expect(appServiceWithoutManagers._provider).toBeUndefined();
  expect(appServiceWithoutManagers._appManager).toBeUndefined();
});

// it('serviceListener called', () => {
//   appService._provider.monitorServiceConnection = jest.fn((callback) => {
//     callback(true);
//   });
//   appService.serviceListener();
//   expect(appService._provider.monitorServiceConnection).toHaveBeenCalled();
//   expect(appService._appManager.setServiceStatus).toHaveBeenCalled();
// });

// it('serviceListener with error', () => {
//   appService._provider.monitorServiceConnection = jest.fn((callback) => {
//     throw new Error('throw error');
//   });
//   try {
//     appService.serviceListener();
//   } catch (e) {
//     expect(e).toEqual(expect.anything());
//   }
// });
