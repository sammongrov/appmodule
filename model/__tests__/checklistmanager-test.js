import 'react-native';
import Realm from './_realm';
import CheckListsManager from '../board/CheckListsManager';
import Constants from '../constants';

// jest.mock('../../../utils/index', () => ({
//   removeEmptyValues: jest.fn((obj) => obj),
// }));
jest.mock('../../../utils/index', () => ({
  removeEmptyValues: jest.fn((obj) => obj),
  debug: jest.fn(),
}));

const AppUtil = require('../../../utils/index');

class TaskManager {
  constructor() {
    console.log('taskmanager intialized');
  }
}

const taskManager = new TaskManager();
const realmObj = Realm;
const checklistManager = new CheckListsManager(realmObj, taskManager);

const transformGroupsToObj = (groupsArr) =>
  groupsArr.reduce((acc, group, index) => {
    acc[index] = group;
    return acc;
  }, {});

const checklist = [
  { _id: 'XT87kg1', text: 'board1', userId: 'EDNFJ78FJ' },
  { _id: 'L5yh7ip', text: 'Super Heroes In Training', userId: 'HJD70SHJ' },
  { _id: 'Ki3Keo1', text: 'The Miracle Workers', userId: 'K79E4GD' },
  { _id: 'CAT7891yi7', text: 'snowWhite', userId: 'I93TEN' },
];

const listener = jest.fn();
it('checklist manager gets list of groups', () => {
  const { list } = checklistManager;
  expect(list).toEqual(expect.anything(Realm.Results));
});

it('checklistmanager finds a group by id', () => {
  // no gid in db
  const notFoundGroup = checklistManager.findByCardIdAsList('XP7T48u');
  expect(notFoundGroup).toBeNull();

  // gid in db
  const foundGroup = checklistManager.findByCardIdAsList(checklist[2]._id);
  expect(foundGroup).toMatchObject(checklist[2]);
});

it('find checklistItem by title', () => {
  checklistManager.findCheckListItem('Not Fast, Just Furious');
  expect(taskManager.checklist.findCheckListItem).toMatchObject(checklist[0]);
});

it('find checklist by title', () => {
  checklistManager.fetchCheckList('Not Fast, Just Furious');
  expect(taskManager.checklist.fetchCheckList).toMatchObject(checklist[0]);
});
it('find CheckListTask by title', () => {
  checklistManager.fetchCheckListTask('Not Fast, Just Furious');
  expect(taskManager.checklist.fetchCheckListTask).toMatchObject(checklist[0]);
});
it('find CheckListTaskItem by title', () => {
  checklistManager.findCheckListItemByCardId('Not Fast, Just Furious');
  expect(taskManager.checklist.fetchCheckListTask).toMatchObject(checklist[0]);
});
// without the db

describe('tests without db', () => {
  const checklistManagerWithoutRealm = new CheckListsManager();

  it('checklistmanager delete method catches an error', () => {
    AppUtil.removeEmptyValues.mockClear();
    const objToStore = {
      _id: 'XT87kg1',
      checklistId: 'JND67JNS',
      cardId: 'J78DBC',
      title: 'CHECKLIST',
      userId: 'EDNFJ78FJ',
      sort: null,
      isFinished: null,
    };

    try {
      checklistManagerWithoutRealm.deleteChecklist(transformGroupsToObj([objToStore]));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
describe('tests without db', () => {
  const checklistManagerWithoutRealm = new CheckListsManager();

  it('checklistmanager delete method catches an error', () => {
    AppUtil.removeEmptyValues.mockClear();
    const objToStore = {
      _id: 'XT87kg1',
      checklistId: 'JND67JNS',
      cardId: 'J78DBC',
      title: 'CHECKLIST',
      userId: 'EDNFJ78FJ',
      sort: null,
      isFinished: null,
    };

    try {
      checklistManagerWithoutRealm.deleteCheckListItems(transformGroupsToObj([objToStore]));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
it('add addChecklist to db', () => {
  const checklist1 = [
    {
      _id: 'XT87kg1',
      title: 'nice to have this feature',
      userId: 'H7WH0PP',
      cardId: 'J78DBC',
      createdAt: null,
      sort: null,
    },
    {
      _id: 'XT87hr2',
      title: 'I do not think so',
      userId: 'GRn1209PH',
      cardId: 'J78DBC',
      createdAt: null,
      sort: null,
    },
  ];
  AppUtil.removeEmptyValues.mockClear();
  checklistManager.addChecklist(checklist1);
  const addedchecklist1 = realmObj
    .objects(Constants.Checklists)
    .filtered(`_id = "${checklist1[0]._id}"`);
  const addedchecklist2 = realmObj
    .objects(Constants.Checklists)
    .filtered(`_id = "${checklist1[1]._id}"`);
  expect(addedchecklist1[0]._id).toMatch(checklist1[0]._id);
  expect(addedchecklist2[0]._id).toMatch(checklist1[1]._id);
  expect(AppUtil.removeEmptyValues).toBeCalled();
});
it('add addCheckListItems', () => {
  const checklistItems = {
    items: [
      {
        _id: 'CK000012',
        checklistId: 'XT87kg1',
        title: 'nice to have this feature',
        userId: 'H7WH0PP',
        cardId: 'J78DBC',
        sort: 0,
        isFinished: false,
      },
      {
        _id: '',
        checklistId: 'XT87kg1',
        title: 'I do not think so',
        userId: 'GRn1209PH',
        cardId: 'J78DBC',
        sort: 0,
        isFinished: false,
      },
    ],
  };
  AppUtil.removeEmptyValues.mockClear();
  checklistManager.addCheckListItems(checklistItems);
  const addedchecklistItem = realmObj
    .objects(Constants.Checklistitems)
    .filtered(`_id = "${checklistItems.items[0]._id}"`);
  expect(addedchecklistItem[0]._id).toEqual(checklistItems.items[0]._id);
});
//
// general tests
it('checklistmanager is instantiated successfully', () => {
  expect(checklistManager).toBeTruthy();
  expect(checklistManager).toBeInstanceOf(CheckListsManager);
  expect(checklistManager._realm).toEqual(realmObj);
});

it('check checklist with no param', () => {
  const addAllChecklistsRes1 = checklistManager.addChecklist();
  expect(addAllChecklistsRes1).toBeUndefined();
  const addAllChecklistsRes2 = checklistManager.addChecklist({});
  expect(addAllChecklistsRes2).toBeUndefined();
});

it('add addchecklist', () => {
  const addchecklistToBeAdded = checklist[0];
  checklistManager.addChecklist(addchecklistToBeAdded);
  const addedchecklistToBeAdded = realmObj
    .objects(Constants.Checklists)
    .filtered(`_id = "${checklist[0]._id}"`);
  expect(addedchecklistToBeAdded[0]._id).toEqual(addchecklistToBeAdded._id);
});

it('checklistitemsmanager is instantiated successfully', () => {
  expect(checklistManager).toBeTruthy();
  expect(checklistManager).toBeInstanceOf(CheckListsManager);
  expect(checklistManager._realm).toEqual(realmObj);
});

it('check checklist with no param', () => {
  const addAllChecklistsItemsRes1 = checklistManager.addCheckListItems();
  expect(addAllChecklistsItemsRes1).toBeUndefined();
  const addAllChecklistsItemsRes2 = checklistManager.addCheckListItems({});
  expect(addAllChecklistsItemsRes2).toBeUndefined();
});

it('add addchecklist', () => {
  const addchecklistItemsToBeAdded = checklist[0];
  checklistManager.addCheckListItems(addchecklistItemsToBeAdded);
  const addedchecklistItemsToBeAdded = realmObj
    .objects(Constants.Checklists)
    .filtered(`_id = "${checklist[0]._id}"`);
  expect(addedchecklistItemsToBeAdded[0]._id).toEqual(addchecklistItemsToBeAdded._id);
  // const findByName = realmObj.objects(Constants.Board).filtered(`title = "${boards[0].title}"`);
  // expect(findByName[0].title).toEqual(boardToBeAdded.title);
});

it('check checklist with no param', () => {
  const deleteAllChecklistsRes1 = checklistManager.deleteChecklist();
  expect(deleteAllChecklistsRes1).toBeUndefined();
  const deleteAllChecklistsRes2 = checklistManager.deleteChecklist({});
  expect(deleteAllChecklistsRes2).toBeUndefined();
});

it('delete checklist', () => {
  const deletechecklistToBeAdded = checklist[0];
  checklistManager.deleteChecklist(deletechecklistToBeAdded);
  const deletededchecklistToBeAdded = realmObj
    .objects(Constants.checklists)
    .filtered(`_id = "${checklist[0]._id}"`);
  expect(deletededchecklistToBeAdded[0]._id).toEqual(deletechecklistToBeAdded._id);
});
it('check checklist with no param', () => {
  const deleteAllChecklistsItemRes1 = checklistManager.deleteCheckListItems();
  expect(deleteAllChecklistsItemRes1).toBeUndefined();
  const deleteAllChecklistsItemRes2 = checklistManager.deleteCheckListItems({});
  expect(deleteAllChecklistsItemRes2).toBeUndefined();
});

it('add addchecklist', () => {
  const deletechecklistItemToBeAdded = checklist[0];
  checklistManager.addChecklist(deletechecklistItemToBeAdded);
  const deletededchecklistItemToBeAdded = realmObj
    .objects(Constants.Checklists)
    .filtered(`_id = "${checklist[0]._id}"`);
  expect(deletededchecklistItemToBeAdded[0]._id).toEqual(deletechecklistItemToBeAdded._id);
});
it('adds a group listener', () => {
  let addListenerError = null;
  try {
    checklistManager.addCheckListItemListner(listener);
  } catch (error) {
    addListenerError = error;
  }
  expect(addListenerError).toBeNull();
});

it('removes a group listener', () => {
  let removeListenerError = null;
  try {
    checklistManager.removeCheckListItemListner(listener);
  } catch (error) {
    removeListenerError = error;
  }
  expect(removeListenerError).toBeNull();
});

it('adds a group listener', () => {
  let addListenerError = null;
  try {
    checklistManager.addCheckListListner(listener);
  } catch (error) {
    addListenerError = error;
  }
  expect(addListenerError).toBeNull();
});

it('removes a group listener', () => {
  let removeListenerError = null;
  try {
    checklistManager.removeCheckListListner(listener);
  } catch (error) {
    removeListenerError = error;
  }
  expect(removeListenerError).toBeNull();
});
// const   insertCheckListsManager= () => {
//   console.log('INIT APP MANAGERS ==-=');
// };
// beforeAll(() => {
//   insertCheckListsManager();
// });
// afterAll(() => {
//   // delete all groups
//   // cleanDB();
//   const db = realmObj;
//   db.write(() => {
//     db.deleteAll();
//   });
//   // close DB
//   realmObj.close();
// });

it(' checklist with no param', () => {
  const addAllChecklistsRes1 = checklistManager.addChecklist(null);
  expect(addAllChecklistsRes1).toBeUndefined();
  const addAllChecklistsRes2 = checklistManager.addChecklist([]);
  expect(addAllChecklistsRes2).toBeUndefined();
});

it(' checklistitem with no param', () => {
  const addAllCheckListItemsRes1 = checklistManager.addCheckListItems(null);
  expect(addAllCheckListItemsRes1).toBeUndefined();
  const addAllCheckListItemsRes2 = checklistManager.addCheckListItems([]);
  expect(addAllCheckListItemsRes2).toBeUndefined();
});
