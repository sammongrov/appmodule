import 'react-native';
import Realm from './_realm';
// import Constants from '../../constants';
import ListsManager from '../board/ListsManager';
import Constants from '../constants';

jest.mock('../../../utils/index', () => ({
  removeEmptyValues: jest.fn((obj) => obj),
}));
const AppUtil = require('../../../utils/index');

// jest.mock('../../../utils/index', () => ({
//   removeEmptyValues: jest.fn((obj) => obj),
// }));
// const AppUtil = require('../../../utils/index');

class TaskManager {
  constructor() {
    console.log('taskmanager intialized');
  }
}

const taskManager = new TaskManager();
const realmObj = Realm;
const listManager = new ListsManager(realmObj, taskManager);

const transformGroupsToObj = (groupsArr) =>
  groupsArr.reduce((acc, group, index) => {
    acc[index] = group;
    return acc;
  }, {});

const list = [
  { _id: 'XT87kg1', title: 'LIST', boardId: 'FJSDS6H' },
  { _id: 'L5yh7ip', title: 'Super Heroes In Training', boardId: 'KTW45WM' },
  { _id: 'Ki3Keo1', title: 'The Miracle Workers', boardId: 'K79E4GD' },
  { _id: 'CAT7891yi7', title: 'snowWhite', boardId: 'I93TEN' },
];

const listener = jest.fn();
it('listManager manager gets list of groups', () => {
  const { lists } = listManager;
  expect(lists).toEqual(expect.anything(Realm.Results));
});

it('listmanager finds a group by id', () => {
  // no gid in db
  const notFoundGroup = listManager.findById('FHY7854');
  expect(notFoundGroup).toBeNull();

  // gid in db
  const foundGroup = listManager.findById(list[2]._id);
  expect(foundGroup).toMatchObject(list[2]);
});

it('listmanager finds a group by id', () => {
  // no gid in db
  const notFoundGroup = listManager.findByBoardIdAsList('XP7T48u');
  expect(notFoundGroup).toBeNull();

  // gid in db
  const foundGroup = listManager.findByBoardIdAsList(list[2]._id);
  expect(foundGroup).toMatchObject(list[2]);
});
// without the db
it('add addCardComments to db', () => {
  const listsList = [
    {
      _id: 'XT87kg1',
      title: 'nice to have this feature',
      boardId: 'H7WH0PP',
      createdAt: null,
    },
    {
      _id: 'XT87hr2',
      title: 'I do not think so',
      boardId: 'H7WH0PP',
      createdAt: null,
    },
  ];
  AppUtil.removeEmptyValues.mockClear();
  listManager.addLists(listsList);
  const addedList1 = realmObj.objects(Constants.Lists).filtered(`_id = "${listsList[0]._id}"`);
  const addedList2 = realmObj.objects(Constants.Lists).filtered(`_id = "${listsList[1]._id}"`);
  expect(addedList1[0]._id).toMatch(listsList[0]._id);
  expect(addedList2[0]._id).toMatch(listsList[1]._id);
  expect(AppUtil.removeEmptyValues).toBeCalled();
});
describe('tests without db', () => {
  const listManagerWithoutRealm = new ListsManager();

  it('listManager delete method catches an error', () => {
    AppUtil.removeEmptyValues.mockClear();
    const objToStore = {
      _id: 'XT87hr2',
      title: 'I do not think so',
      boardId: 'H7WH0PP',
      createdAt: null,
    };

    try {
      listManagerWithoutRealm.deleteList(transformGroupsToObj([objToStore]));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

// general tests
it('check addboard with no param', () => {
  const addAlllistsRes1 = listManager.addLists(null);
  expect(addAlllistsRes1).toBeUndefined();
});

it('add listmanager', () => {
  const addlistToBeAdded = list[0];
  listManager.addLists(addlistToBeAdded);
  const addedlistToBeAdded = realmObj.objects(Constants.list).filtered(`_id = "${list[0]._id}"`);
  expect(addedlistToBeAdded[0]._id).toEqual(addlistToBeAdded._id);
});
it('check deleteList with no param', () => {
  const deleteAlllistManagerItemRes1 = listManager.deleteList();
  expect(deleteAlllistManagerItemRes1).toBeUndefined();
  const deleteAlllistManagerItemRes2 = listManager.deleteList({});
  expect(deleteAlllistManagerItemRes2).toBeUndefined();
});

it('adds a group listener', () => {
  let addListenerError = null;
  try {
    listManager.addListsListener(listener);
  } catch (error) {
    addListenerError = error;
  }
  expect(addListenerError).toBeNull();
});

it('removes a group listener', () => {
  let removeListenerError = null;
  try {
    listManager.removeListsListener(listener);
  } catch (error) {
    removeListenerError = error;
  }
  expect(removeListenerError).toBeNull();
});

it('find list by boardname', () => {
  listManager.fetchAllBoardByName('Not Fast, Just Furious');
  expect(taskManager.list.fetchAllBoardByName).toMatchObject(list[0]);
});
it('find board by id', () => {
  listManager.findById('Not Fast, Just Furious');
  expect(taskManager.list.findById).toMatchObject(list[0]);
});
it('find board by id', () => {
  listManager.fetchBoardList('Not Fast, Just Furious');
  expect(taskManager.list.fetchBoardList).toMatchObject(list[0]);
});
