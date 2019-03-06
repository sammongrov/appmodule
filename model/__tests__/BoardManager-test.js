import 'react-native';
import Realm from './_realm';
// import Constants from '../../constants';
import BoardManager from '../board/BoardManager';
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

// const AppUtil = require('../../../../utils/index');

// TODO: may need to switch to actual UserManager in order to test

const realmObj = Realm;
const boardManager = new BoardManager(realmObj, taskManager);

const transformGroupsToObj = (groupsArr) =>
  groupsArr.reduce((acc, group, index) => {
    acc[index] = group;
    return acc;
  }, {});

const boards = [
  { _id: 'XT87kg1', title: 'Not Fast, Just Furious', members: 'dasdfas' },
  { _id: 'L5yh7ip', title: 'Super Heroes In Training', members: '' },
  { _id: 'Ki3Keo1', title: 'The Miracle Workers', members: '' },
  { _id: 'CAT7891yi7', title: 'snowWhite', members: '' },
];

const listener = jest.fn();

// without the db
describe('tests without db', () => {
  const boardManagerWithoutRealm = new BoardManager();

  it('groupManager addAll method catches an error', () => {
    AppUtil.removeEmptyValues.mockClear();
    const objToStore = {
      _id: 'XT87kg1',
      title: 'board1',
      archived: false,
      createdAt: null,
      stars: 0,
      members: 'dasdfas',
    };

    try {
      boardManagerWithoutRealm.addBoard(transformGroupsToObj([objToStore]));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
// general tests
it('boardManager is instantiated successfully', () => {
  expect(boardManager).toBeTruthy();
  expect(boardManager).toBeInstanceOf(BoardManager);
  expect(boardManager._realm).toEqual(realmObj);
});

it('check addboard with no param', () => {
  const addBoardRes = boardManager.addBoard();
  expect(addBoardRes).toBeUndefined();
  const addBoardRes2 = boardManager.addBoard({});
  expect(addBoardRes2).toBeUndefined();
});

it('add board', () => {
  const boardToBeAdded = boards[0];
  boardManager.addBoard(boardToBeAdded);
  const addedBoard = realmObj.objects(Constants.Board).filtered(`_id = "${boards[0]._id}"`);
  expect(addedBoard[0]._id).toEqual(boardToBeAdded._id);
  // const findByName = realmObj.objects(Constants.Board).filtered(`title = "${boards[0].title}"`);
  // expect(findByName[0].title).toEqual(boardToBeAdded.title);
});

it('adds a group listener', () => {
  let addListenerError = null;
  try {
    boardManager.addBoardListener(listener);
  } catch (error) {
    addListenerError = error;
  }
  expect(addListenerError).toBeNull();
});

it('removes a group listener', () => {
  let removeListenerError = null;
  try {
    boardManager.removeBoardListener(listener);
  } catch (error) {
    removeListenerError = error;
  }
  expect(removeListenerError).toBeNull();
});

it('find board by title or create board', () => {
  boardManager.findOrCreateByName({ groupID: '123456789xyz', groupName: 'Not Fast, Just Furious' });
  // const { fetchAllBoard } = boardManager;
  expect(taskManager.board.fetchBoard).toMatchObject(boards[0]);

  // const { list } = boardManager;
  // console.log('findBoard == ',list[0]);
  // const groupWithUnredMessage = boardManager.list.filtered(`title = "${findBoardTitle}"`)
  // console.log('findByName == ',groupWithUnredMessage);
  // expect(groupWithUnredMessage).toMatchObject(board);

  // boardManager.addBoard(board);
  // console.log('search title == ', board);
  // const searchResult = boardManager.list.filtered(`title = "${'board1'}"`);

  // console.log('search res == ', searchResult[0]);
  // const fetchAllBoards = searchResult && searchResult.length > 0 ? searchResult['0'] : null;
  // console.log('fetchAllBoards == ', fetchAllBoards);
  // expect(searchResult[0]).toMatchObject(fetchAllBoards);
});

it('find board by title', () => {
  boardManager.fetchUserTasks('Not Fast, Just Furious');
  // const { fetchAllBoard } = boardManager;
  expect(taskManager.board.fetchUserTasks).toMatchObject(boards[0]);
});
it('find board by title', () => {
  boardManager.fetchBoardTasks('Not Fast, Just Furious');
  // const { fetchAllBoard } = boardManager;
  expect(taskManager.board.fetchBoardTasks).toMatchObject(boards[0]);
});

it('find board by title', () => {
  boardManager.fetchAllBoard('XT87kg1');
  // const { fetchAllBoard } = boardManager;
  expect(taskManager.board.fetchBoard).toMatchObject(boards[0]);
});

it('find board by title', () => {
  boardManager.findBoardByName('XT87kg1');
  // const { fetchAllBoard } = boardManager;
  expect(taskManager.board.fetchBoard).toMatchObject(boards[0]);
});
// it('fetch all boards', () => {
//   // user in db
//   const board =  [{ _id: 'XT87kg1', title: 'board1', archived:false, createdAt:null, stars:0, members: 'dasdfas' }];

//   const transformedGroups = transformGroupsToObj(board);
//   const expectedOnline = Object.assign({}, transformedGroups[0]);
//   boardManager.addBoard(transformedGroups[0]);
//   console.log('search title == ', transformedGroups[0].title);
//   const searchResult = boardManager.list.filtered(`title = "${transformedGroups[0].title}"`);

// });

it('groupManager gets list of groups', () => {
  const { list } = boardManager;
  expect(list).toEqual(expect.anything(Realm.Results));
});

// describe("with out db", () => {

//   const noRealmboardManager = new BoardManager(null,taskManager);
//   it('add board 2',() => {

//     const  boardToBeAdded = boards[0];
//     noRealmboardManager.addBoard(boardToBeAdded);
//     const addedBoard = realmObj.objects(Constants.Board).filtered(`_id = "${boards[0]._id}"`);
//     expect(addedBoard[0]._id).toEqual(boardToBeAdded._id);
//   });

// })

it('Boardmanager finds a group by id', () => {
  // no gid in db
  const notFoundGroup = boardManager.findById('XP7T48u');
  expect(notFoundGroup).toBeNull();

  // gid in db
  const foundGroup = boardManager.findById(boards[2]._id);
  expect(foundGroup).toMatchObject(boards[2]);
});
