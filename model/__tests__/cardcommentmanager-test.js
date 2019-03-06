import 'react-native';
import Realm from './_realm';
// import Constants from '../../constants';
import CardCommentsManager from '../board/CardCommentsManager';
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
const cardCommentsManager = new CardCommentsManager(realmObj, taskManager);

const transformGroupsToObj = (groupsArr) =>
  groupsArr.reduce((acc, group, index) => {
    acc[index] = group;
    return acc;
  }, {});

const comment = [
  { _id: 'XT87kg1', text: 'board1', createdAt: '' },
  { _id: 'L5yh7ip', text: 'Super Heroes In Training', createdAt: '' },
  { _id: 'Ki3Keo1', text: 'The Miracle Workers', createdAt: '' },
  { _id: 'CAT7891yi7', text: 'snowWhite', createdAt: '' },
];

const listener = jest.fn();
it('cardcommentmanager gets list of groups', () => {
  const { list } = cardCommentsManager;
  expect(list).toEqual(expect.anything(Realm.Results));
});

it('cardcommentmanager finds a group by id', () => {
  // no gid in db
  const notFoundGroup = cardCommentsManager.findByCardIdAsList('XP7T48u');
  expect(notFoundGroup).toBeNull();

  // gid in db
  const foundGroup = cardCommentsManager.findByCardIdAsList(comment[2]._id);
  expect(foundGroup).toMatchObject(comment[2]);
});
// without the db
it('add addCardComments to db', () => {
  const commentList = [
    {
      _id: 'XT87kg1',
      comment: 'nice to have this feature',
      authorId: 'EDNFJ78FJ',
      boardId: 'H7WH0PP',
      cardId: 'J78DBC',
      createdAt: null,
    },
    {
      _id: 'XT87hr2',
      comment: 'I do not think so',
      authorId: 'GRn1209PH',
      boardId: 'H7WH0PP',
      cardId: 'J78DBC',
      createdAt: null,
    },
  ];
  AppUtil.removeEmptyValues.mockClear();
  cardCommentsManager.addCardComments(commentList);
  const addedComment1 = realmObj
    .objects(Constants.CardComments)
    .filtered(`_id = "${commentList[0]._id}"`);
  const addedComment2 = realmObj
    .objects(Constants.CardComments)
    .filtered(`_id = "${commentList[1]._id}"`);
  expect(addedComment1[0]._id).toMatch(commentList[0]._id);
  expect(addedComment2[0]._id).toMatch(commentList[1]._id);
  expect(AppUtil.removeEmptyValues).toBeCalled();
});
it('add addCardComments to db', () => {
  const commentList = [
    {
      _id: 'XT87kg1',
      comment: 'nice to have this feature',
      authorId: 'EDNFJ78FJ',
      boardId: 'H7WH0PP',
      cardId: 'J78DBC',
      createdAt: null,
    },
    {
      _id: null,
      comment: 'I do not think so',
      authorId: 'GRn1209PH',
      boardId: 'H7WH0PP',
      cardId: 'J78DBC',
      createdAt: null,
    },
  ];
  AppUtil.removeEmptyValues.mockClear();
  cardCommentsManager.addCardComments(commentList);
  const addedComment1 = realmObj
    .objects(Constants.CardComments)
    .filtered(`_id = "${commentList[0]._id}"`);
  const addedComment2 = realmObj
    .objects(Constants.CardComments)
    .filtered(`_id = "${commentList[1]._id}"`);
  expect(addedComment1[0]._id).toMatch(commentList[0]._id);
  expect(addedComment2[0]._id).toMatch(commentList[1]._id);
  expect(AppUtil.removeEmptyValues).toBeCalled();
});
describe('tests without db', () => {
  const cardcommentManagerWithoutRealm = new CardCommentsManager();

  it('cardcommentmanager addAll method catches an error', () => {
    AppUtil.removeEmptyValues.mockClear();
    const objToStore = {
      id: 'XT87kg1',
      text: 'board1',
      userId: 'EDNFJ78FJ',
      boardId: 'H7WH0PP',
      cardId: 'J78DBC',
      createdAt: null,
    };

    try {
      cardcommentManagerWithoutRealm.deleteComment(transformGroupsToObj([objToStore]));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
// general tests
it('cardcommentmanager is instantiated successfully', () => {
  expect(cardCommentsManager).toBeTruthy();
  expect(cardCommentsManager).toBeInstanceOf(cardCommentsManager);
  expect(cardCommentsManager._realm).toEqual(realmObj);
});

it('check addboard with no param', () => {
  const addcardcommentRes1 = cardCommentsManager.deleteComment();
  expect(addcardcommentRes1).toBeUndefined();
});
it('check addboard with no param', () => {
  const addcardcommentRes1 = cardCommentsManager.addCardComments(null);
  expect(addcardcommentRes1).toBeUndefined();
});
it('add addCardComments', () => {
  const addCardCommentsToBeAdded = comment[0];
  cardCommentsManager.addCardComments(addCardCommentsToBeAdded);
  const addedCardCommentsToBeAdded = realmObj
    .objects(Constants.CardComments)
    .filtered(`_id = "${comment[0]._id}"`);
  expect(addedCardCommentsToBeAdded[0]._id).toEqual(addCardCommentsToBeAdded._id);
});
it('add addCardComments', () => {
  const addCardCommentsToBeAdded = comment[0];
  cardCommentsManager.deleteComment(addCardCommentsToBeAdded);
  const addedCardCommentsToBeAdded = realmObj
    .objects(Constants.CardComments)
    .filtered(`_id = "${comment[0]._id}"`);
  expect(addedCardCommentsToBeAdded[0]._id).toEqual(addCardCommentsToBeAdded._id);
});

it('adds a group listener', () => {
  let addListenerError = null;
  try {
    cardCommentsManager.addCommentsListner(listener);
  } catch (error) {
    addListenerError = error;
  }
  expect(addListenerError).toBeNull();
});

it('removes a group listener', () => {
  let removeListenerError = null;
  try {
    cardCommentsManager.removeCommentsListner(listener);
  } catch (error) {
    removeListenerError = error;
  }
  expect(removeListenerError).toBeNull();
});

it('find board by title', () => {
  cardCommentsManager.fetchCardComments('Not Fast, Just Furious');
  // const { fetchAllBoard } = boardManager;
  expect(taskManager.cardcomment.fetchCardComments).toMatchObject(comment[0]);
});

it('find board by title', () => {
  cardCommentsManager.fetchComment('HELLO WORLD');
  // const { fetchAllBoard } = boardManager;
  expect(taskManager.cardcomment.fetchComment).toMatchObject(comment[0]);
});
