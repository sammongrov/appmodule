import 'react-native';
import Realm from './_realm';
// import Constants from '../../constants';
import CardManager from '../board/CardManager';
import Constants from '../constants';

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
const cardManager = new CardManager(realmObj, taskManager);

const transformGroupsToObj = (groupsArr) =>
  groupsArr.reduce((acc, group, index) => {
    acc[index] = group;
    return acc;
  }, {});

const card = [
  { _id: 'XT87kg1', text: 'board1', createdAt: '' },
  { _id: 'L5yh7ip', text: 'Super Heroes In Training', createdAt: '' },
  { _id: 'Ki3Keo1', text: 'The Miracle Workers', createdAt: '' },
  { _id: 'CAT7891yi7', text: 'snowWhite', createdAt: '' },
];

const listener = jest.fn();
it('cardManager gets list of groups', () => {
  const { list } = cardManager;
  expect(list).toEqual(expect.anything(Realm.Results));
});

it('cardManager gets card of groups', () => {
  const { card } = cardManager;
  expect(card).toEqual(expect.anything(Realm.Results));
});

it('find board by id', () => {
  cardManager.findById('Not Fast, Just Furious');
  // const { fetchAllBoard } = boardManager;
  expect(taskManager.card.findById).toMatchObject(card[0]);
});

it('find board by id', () => {
  cardManager.findByListId('Not Fast, Just Furious');
  // const { fetchAllBoard } = boardManager;
  expect(taskManager.card.findByListId).toMatchObject(card[0]);
});

it('adds a addCardListener', () => {
  let addListenerError = null;
  try {
    cardManager.addCardListener(listener);
  } catch (error) {
    addListenerError = error;
  }
  expect(addListenerError).toBeNull();
});

it('removes a removeCardListener', () => {
  let removeListenerError = null;
  try {
    cardManager.removeCardListener(listener);
  } catch (error) {
    removeListenerError = error;
  }
  expect(removeListenerError).toBeNull();
});

it('adds a addCardDetailListner', () => {
  let addListenerError = null;
  try {
    cardManager.addCardDetailListner(listener);
  } catch (error) {
    addListenerError = error;
  }
  expect(addListenerError).toBeNull();
});

it('removes a removeCardDetailListner', () => {
  let removeListenerError = null;
  try {
    cardManager.removeCardDetailListner(listener);
  } catch (error) {
    removeListenerError = error;
  }
  expect(removeListenerError).toBeNull();
});

// without the db
describe('tests without db', () => {
  const cardManagerWithoutRealm = new CardManager();

  it('cardmanager addAll method catches an error', () => {
    AppUtil.removeEmptyValues.mockClear();
    const objToStore = {
      _id: 'XT87kg1',
      title: 'card',
      boardId: 'FJSDS6H',
      createdAt: null,
    };

    try {
      cardManagerWithoutRealm.addCards(transformGroupsToObj([objToStore]));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
describe('tests without db', () => {
  const cardManagerWithoutRealm = new CardManager();

  it('cardmanager deleteCard method catches an error', () => {
    AppUtil.removeEmptyValues.mockClear();
    const objToStore = {
      _id: 'XT87kg1',
      title: 'card',
      boardId: 'FJSDS6H',
      createdAt: null,
    };

    try {
      cardManagerWithoutRealm.deleteCard(transformGroupsToObj([objToStore]));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('tests without db', () => {
  const cardManagerWithoutRealm = new CardManager();

  it('cardmanager deleteCard method catches an error', () => {
    AppUtil.removeEmptyValues.mockClear();
    const objToStore = {
      _id: 'XT87kg1',
      title: 'card',
      boardId: 'FJSDS6H',
      createdAt: null,
    };

    try {
      cardManagerWithoutRealm.deleteListCard(transformGroupsToObj([objToStore]));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
// general tests
it('check addboard with no param', () => {
  const addAllcardRes1 = cardManager.addCards();
  expect(addAllcardRes1).toBeUndefined();
  const addAllcardRes2 = cardManager.addCards({});
  expect(addAllcardRes2).toBeUndefined();
});

it('add cardmanager', () => {
  const addcardToBeAdded = card[0];
  cardManager.addCards(addcardToBeAdded);
  const addedcardToBeAdded = realmObj.objects(Constants.card).filtered(`_id = "${card[0]._id}"`);
  expect(addedcardToBeAdded[0]._id).toEqual(addedcardToBeAdded._id);
});

it('check cardManager with no param', () => {
  const deleteCardRes1 = cardManager.deleteCard();
  expect(deleteCardRes1).toBeUndefined();
  const deleteCardRes2 = cardManager.deleteCard({});
  expect(deleteCardRes2).toBeUndefined();
});
it('check cardManager with no param', () => {
  const deleteListCardRes1 = cardManager.deleteListCard();
  expect(deleteListCardRes1).toBeUndefined();
  const deleteListCardRes2 = cardManager.deleteListCard({});
  expect(deleteListCardRes2).toBeUndefined();
});
it('addUserTasks', () => {
  const taskList = [
    {
      _id: 'dsfsdf',
      title: 'Title one',
      userId: 'jerVEdfsfd',
      boardId: 'BoardId',
      listId: 'LisitDI',
      description: 'This is an description',
      members: ['dhsfbsd'],
      certificateUUID: 'fsdsd',
      listSort: ['fsdgdf', 'gdfgdf'],
      boardTitle: 'jerVEdfsfd-Serui',
      customFields: [{ name: 'certificateUUID', value: 'fhjbsdj' }],
      sort: 1,
    },
  ];
  const currentUser = {
    username: 'jerVEdfsfd',
  };
  // const cardManager =  new CardManager();
  cardManager.addUserTasks(taskList, 'jerVEdfsfd', currentUser);
});

// without the db
describe('tests without db', () => {
  const cardManagerWithoutRealm = new CardManager();

  it('cardmanager addUserTasks method catches an error', () => {
    AppUtil.removeEmptyValues.mockClear();
    const cardToStore = {
      _id: 'XT87kg1',
      title: 'card',
      boardId: 'FJSDS6H',
      createdAt: null,
    };

    try {
      cardManagerWithoutRealm.addUserTasks(transformGroupsToObj([cardToStore]));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

it('cardManager-get htmlurlof card', async () => {
  let obj = {
    id: '1234',
    certificateUUID: 'sfgghh',
    title: 'tittles',
    boardList: [122],
    boardId: 'XT87kg1',
  };

  const card = cardManager.htmlURL(obj);
  expect(card).not.toBe(null);
});
it('cardManager-htmlurl without object', async () => {
  const card = cardManager.htmlURL();
  expect(card).toBe(undefined);
});

it('cardManager-jsonurl', async () => {
  let obj = {
    id: '1234',
    certificateUUID: 'rtyhg',
    title: 'titles',
    boardList: [172],
    boardId: 'XT87kg1',
  };
  const card = cardManager.jsonURL(obj);
  expect(card).not.toBe(null);
});
it('cardManager-jsonURL without object', async () => {
  const card = cardManager.jsonURL();
  expect(card).toBe(undefined);
});

it('ChatMessageList - updateJsonOrHtmlData url ends with json', async () => {
  let card = {
    _id: 'XT87kg1,',
    title: 'card title',
    userId: '12gggd',
    boardId: 'XT87kg1',
    listId: 'fgtyh',
    members: 'ghtyyu',
  };
  cardManager.findById = jest.fn(() => card);
  let data = 'ghtjj';
  let url = 'url.json';
  cardManager.updateJsonOrHtmlData('XT87kg1', url, data);
});

it('ChatMessageList - updateJsonOrHtmlData url ends with html', async () => {
  let card = {
    _id: 'XT87kg1,',
    title: 'card title',
    userId: 'rtyhsg',
    boardId: 'XT87kg1',
    listId: 'fgtyh',
    members: 'ghtyyu',
  };
  cardManager.findById = jest.fn(() => card);
  let data = 'ghtjj';

  let url = 'url.html';

  cardManager.updateJsonOrHtmlData('XT87kg1', url, data);
});

// general tests
it('check addboard with no param', () => {
  const addAllcardRes1 = cardManager.addUserTasks(null);
  expect(addAllcardRes1).toBeUndefined();
  const addAllcardRes2 = cardManager.addUserTasks({});
  expect(addAllcardRes2).toBeUndefined();
});

it('add cardmanager', () => {
  const addcardToBeAdded = card[0];
  cardManager.addUserTasks(addcardToBeAdded);
  const addedcardToBeAdded = realmObj.objects(Constants.card).filtered(`_id = "${card[0]._id}"`);
  expect(addedcardToBeAdded[0]._id).toEqual(addcardToBeAdded._id);
});
it('cardmanager for json stringify', () => {
  const taskList = [
    {
      _id: 'dsfsdf',
      title: 'Title one',
      userId: 'jerVEdfsfd',
      boardId: 'BoardId',
      listId: 'LisitDI',
      description: 'This is an description',
      members: null,
      certificateUUID: 'fsdsd',
      listSort: 0,
      boardTitle: 'jerVEdfsfd-Serui',
      listTitle: 'Title Of the List',
      customFields: [{ name: 'certificateUUID', value: 'fhjbsdj' }],
      sort: 1,
    },
  ];
  const catdList = {
    members: ['dhsfbsd'],
  };
  const cardList = {
    members: null,
  };
  const Res1 = cardManager.addCards(catdList);
  expect(Res1).toBe();
  const Res2 = cardManager.addCards(cardList);
  expect(Res2).toBe();
});
it('check for cardsToFetchJsonData', () => {
  const taskList = [
    {
      _id: 'dsfsdf',
      title: 'Title one',
      userId: 'jerVEdfsfd',
      boardId: 'BoardId',
      listId: 'LisitDI',
      description: 'This is an description',
      members: ['dhsfbsd'],
      certificateUUID: 'fsdsd',
      listSort: 0,
      boardTitle: 'jerVEdfsfd-Serui',
      listTitle: 'Title Of the List',
      customFields: [{ name: 'certificateUUID', value: 'fhjbsdj' }],
      sort: 1,
    },
  ];
  const currentUser = {
    _id: 'jerVEdfsfd',
    username: 'user120',
  };
  const userId = 'jerVEdfsfd';
  cardManager._taskManager._board = { fetchURL: jest.fn() };
  cardManager.addUserTasks(taskList, userId, currentUser);
  expect(cardManager._taskManager._board.fetchURL).toBeCalledTimes(2);
});
