import md5 from 'react-native-md5';
import RC from '@rc';

import DBManager from '../DBManager';

import TaskManager from '../TaskManager';

it('should have constructor name', () => {
  expect(DBManager.constructor.name).toEqual('Database');
});

it('DB Manager to be singleton', () => {
  let db;
  try {
    db = new DBManager();
  } catch (e) {
    expect(e).toEqual(expect.anything());
    console.log('DB error', db);
  }
});

// it('initRc()', () => {
//   DBManager.initRc();
//   expect( this.provider.meteor).toBeDefined();
// })

// it('initService()', () => {
//   DBManager._initService();
//   expect(DBManager._appService).toBeDefined();
// })

// it(' initListeners()', () => {
//   DBManager.initListeners();
//   expect(DBManager._appListener).toBeDefined();
// })

// it('initManagers() withouit realm', () => {
//   try{
//     DBManager.initManagers();
//   }catch(error){
//     expect(error).toEqual(expect.anything());
//     console.log("DB error");
//   }

// //   expect(DBManager.app).toBeDefined();
// //   expect(DBManager.group).toBeDefined();
// //   expect(DBManager.user).toBeDefined();
// })

// it('initManagers()', () => {

//   DBManager.initManagers(DBManager._appRealm,);
//   expect(DBManager.app).toBeDefined();
//   expect(DBManager.group).toBeDefined();
//   expect(DBManager.user).toBeDefined();
// })

it('Init DB() without server', () => {
  try {
    DBManager.initDb();
  } catch (e) {
    expect(e).toEqual(expect.anything());
  }
});

it('_initDBManagers() without realm ', () => {
  try {
    expect(DBManager.initTaskManager().toThrow(Error));
  } catch (e) {
    expect(e).toEqual(expect.anything());
  }
  // DBManager._initDBManagers = jest.fn();

  // expect(DBManager._initDBManagers).toHaveBeenCalled();
});

it('load() ', async () => {
  try {
    const server = 'inst';
    const user = 'falconz';
    const path = md5.hex_md5(`${server}:${user}`);

    //   DBManager.initRc = jest.fn(() =>{

    //   })
    //   DBManager.initAppTaskHandler = jest.fn(() =>{

    //   })
    //   DBManager.initChatTaskHandler = jest.fn(() =>{

    //   })
    //   DBManager.initManagers = jest.fn(() =>{

    //   })
    DBManager.load(path);

    expect(DBManager.appRealm).toBeDefined();
  } catch (err) {
    console.log('ERROR', err);
  }
});

it('Init DB()  server name', () => {
  DBManager.load = jest.fn(() => {});
  DBManager.initDb('inst', 'falconz');
  expect(DBManager.load).toHaveBeenCalled();
});

it('_initDBManagers() ', () => {
  // DBManager._initDBManagers = jest.fn();
  DBManager.initTaskManager(TaskManager);
  // expect(DBManager._initDBManagers).toHaveBeenCalled();
  expect(DBManager._taskManager).toBeDefined();
  expect(DBManager.app).toBeDefined();
  expect(DBManager.group).toBeDefined();
  expect(DBManager.user).toBeDefined();
  expect(DBManager.board).toBeDefined();
  expect(DBManager.lists).toBeDefined();
  expect(DBManager.card).toBeDefined();
  expect(DBManager.checklists).toBeDefined();
  expect(DBManager.cardComments).toBeDefined();
  expect(DBManager.calender).toBeDefined();
});

// it('initTaskManger', () => {

//   DBManager._initDBManagers();

// })

it('initManger() with out realm', async () => {
  try {
    DBManager._initDBManagers();
  } catch (e) {
    expect(e).toEqual(expect.anything());
  }
});

it('reset', async () => {
  const errObj = {
    _id: 'ERROR OBJ',
    desc: 'describtion not found',
    code: '301',
    action: 'false',
  };

  //   //   DBManager._appRealm.write(() => {
  //   //     DBManager._appRealm.create(Constants.Errors, errObj , true)
  //   //   })

  //   await DBManager.load();

  //   DBManager._appRealm = new Realm(AppSchema);
  //   DBManager._appRealm.close = jest.fn(() => {

  //   });

  //   await DBManager.load();

  //   expect(DBManager._appRealm.close).toHaveBeenCalled();
  //   // console.log("ERRORS === ",DBManager._appRealm.objects(Constants.Errors));
  await DBManager.reset();
});

// function newFunction() {
//   return DBManager.initRc;
// }
