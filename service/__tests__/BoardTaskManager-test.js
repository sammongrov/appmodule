import AppUtil from '@mongrov/utils'; /* eslint-disable-line */
import BoardTaskManager from '../BoardTaskManager';
import TaskManager from '../../TaskManager';
import DBManager from '../../DBManager';

jest.mock('@utils', () => ({
  debug: jest.fn(),
  createGuid: jest.fn(),
}));

const RC = {};

jest.mock('../../DBManager', () => {
  const dbManager = {
    app: {},
    user: {},
    group: {},
    card: {},
    board: {},
    lists: {},
    checklists: {},
    cardComments: {},
  };
  return dbManager;
});
// const taskManager = new TaskManager();
TaskManager.provider = RC;
DBManager.app.logError = jest.fn();
let boardTaskManager;

const JOB_FETCH_USER_TASKS = 'FetchUserTasks';
const JOB_FETCH_BOARD_TASKS = 'FetchBoardTasks';
const JOB_FETCH_BOARD = 'FetchBoard';
const JOB_FETCH_BOARD_SWIMLANE = 'FetchBoardSwimline';
const JOB_FETCH_LISTS = 'FetchLists';
const JOB_FETCH_CARDS = 'FetchCards';
const JOB_FETCH_CHECK_LISTS = 'FetchCheckLists';
const JOB_FETCH_CHECKLIST_TASKS = 'FetchCheckListTask';
const JOB_FETCH_COMMENTS_TASKS = 'FetchCommentTask';
const JOB_FETCH_CHECKLISTITEM_TASKS = 'fetchChecklistItemTask';
const JOB_FETCH_CARD_COMMENTS = 'FetchComments';
const JOB_FETCH_URL = 'FetchURL';
const JOB_FETCH_CHECK_LIST_ITEMS = 'FetchCheckListItems';
const JOB_FETCH_BOARD_LIST_TASKS = 'FetchBoardListTasks';
const JOB_CREATE_LIST = 'CreateList';
const JOB_CREATE_CARD = 'CreateCard';
const JOB_CREATE_CHECKLIST = 'CreateChecklist';
const JOB_CREATE_CHECKLISTITEM = 'CreateChecklistItem';
const JOB_CREATE_COMMENT = 'CreateComment';
const JOB_UPDATE_LIST = 'UpdateList';
const JOB_UPDATE_CARD = 'UpdateCard';
const JOB_UPDATE_CHECKLIST = 'UpdateChecklist';
const JOB_UPDATE_CHECKLISTITEM = 'UpdateChecklistItem';
const JOB_DELETE_LIST = 'DeleteList';
const JOB_DELETE_CARD = 'DeleteCard';
const JOB_DELETE_CHECKLIST = 'DeleteChecklist';
const JOB_DELETE_CHECKLISTITEM = 'DeleteChecklistItem';
const JOB_DELETE_COMMENT = 'DeleteComment';

beforeAll(async () => {
  await TaskManager.initQueue();
  boardTaskManager = new BoardTaskManager(TaskManager, DBManager);
});

it('initial test', () => {
  expect(boardTaskManager).toBeTruthy();
  expect(boardTaskManager).toBeInstanceOf(BoardTaskManager);
  expect(boardTaskManager._dbManager).toEqual(DBManager);
  expect(boardTaskManager._taskManager).toEqual(TaskManager);
  expect(boardTaskManager._provider).toEqual(RC);
});

it('initial test without taskManager & dbManager', () => {
  const btm = new BoardTaskManager();
  expect(btm).toBeTruthy();
  expect(btm).toBeInstanceOf(BoardTaskManager);
  expect(btm._dbManager).toBeUndefined();
  expect(btm._taskManager).toBeUndefined();
  expect(btm._provider).toBeUndefined();
});

it('boardTaskManager calls init method', () => {
  boardTaskManager.initTaskManager();
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_BOARD)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_USER_TASKS)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_BOARD_TASKS)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_BOARD_SWIMLANE)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_LISTS)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_CARDS)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_CHECK_LISTS)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_CARD_COMMENTS)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_URL)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_CHECK_LIST_ITEMS)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_BOARD_LIST_TASKS)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_CREATE_LIST)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_CREATE_CARD)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_CREATE_CHECKLIST)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_CREATE_CHECKLISTITEM)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_CREATE_COMMENT)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_UPDATE_LIST)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_UPDATE_CARD)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_UPDATE_CHECKLIST)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_UPDATE_CHECKLISTITEM)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_DELETE_LIST)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_DELETE_CARD)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_DELETE_CHECKLIST)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_DELETE_CHECKLISTITEM)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_DELETE_COMMENT)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_CHECKLIST_TASKS)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_COMMENTS_TASKS)).toBe(true);
  expect(TaskManager.queue.isWorkerPresent(JOB_FETCH_CHECKLISTITEM_TASKS)).toBe(true);
});

describe('fetchUserTasks', () => {
  const userId = 'AGY892Ip7W8';
  DBManager.user.loggedInUser = userId;
  DBManager.card.addUserTasks = jest.fn();
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetUserTasks returns an error', async () => {
    RC.mgbdGetUserTasks = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.fetchUserTasks(userId);
    expect(DBManager.app.logError).toBeCalled();
    TaskManager.queue.getWorker(JOB_FETCH_USER_TASKS).options.onFailed();
  });

  it('mgbdGetUserTasks returns a result', async () => {
    RC.mgbdGetUserTasks = jest.fn((id, cb) => cb(null, []));
    DBManager.card.addUserTasks = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_USER_TASKS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchUserTasks(userId);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.card.addUserTasks).toBeCalled();
  });

  it('mgbdGetUserTasks throws error', async () => {
    RC.mgbdGetUserTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_USER_TASKS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchUserTasks(userId);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.app.logError.mock.calls.length).toBe(1);
  });
});

describe('fetchBoardTasks', () => {
  const boardName = 'BOARD';
  DBManager.user.loggedInUser = boardName;
  DBManager.card.addUserTasks = jest.fn();
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetBoardTasks returns an error', async () => {
    RC.mgbdGetBoardTasks = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.fetchBoardTasks(boardName);
    expect(DBManager.app.logError.mock.calls.length).toBe(2);
    TaskManager.queue.getWorker(JOB_FETCH_BOARD_TASKS).options.onFailed();
  });

  it('mgbdGetBoardTasks returns a result', async () => {
    RC.mgbdGetBoardTasks = jest.fn((id, cb) => cb(null, 'result'));
    DBManager.user.loggedInUser = { _id: 'U01', name: 'user1' };
    DBManager.card.addUserTasks = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_BOARD_TASKS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchBoardTasks(boardName);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.card.addUserTasks).toBeCalled();
  });

  it('mgbdGetBoardTasks throws error', async () => {
    RC.mgbdGetBoardTasks = jest.fn(() => Promise.reject(error));
    expect.assertions(1);
    await boardTaskManager.fetchBoardTasks(boardName);
    expect(DBManager.app.logError.mock.calls.length).toBe(1);
  });
});

describe('fetchBoardswimlane', () => {
  const fetchboardswimlane = { _id: '12345', _cid: '3456', user: 'test2', task: 'ContinueWork' };
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetBoardSwimlane returns an error', async () => {
    RC.mgbdGetBoardSwimlane = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.fetchBoardSwimline(fetchboardswimlane);
    TaskManager.queue.getWorker(JOB_FETCH_BOARD_SWIMLANE).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdGetBoardSwimlane returns an result', async () => {
    RC.mgbdGetBoardSwimlane = jest.fn((id, cb) => cb(null, [{ _id: 'vvv123' }]));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_BOARD_SWIMLANE).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.fetchBoardSwimline(fetchboardswimlane);
    expect(onSuccess.mock.calls.length).toBe(1);
  });

  it('mgbdGetBoardSwimlane throws error', async () => {
    RC.mgbdGetBoardSwimlane = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_BOARD_SWIMLANE).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.fetchBoardSwimline(fetchboardswimlane);
    expect(DBManager.app.logError.mock.calls.length).toBe(1);
  });
});

describe('fetchBoard', () => {
  const boardName = 'BOARD';
  DBManager.board.addBoard = jest.fn();
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetBoardDetails gets an error', async () => {
    RC.mgbdGetBoardDetails = jest.fn((id, cb) => cb(error, null));
    RC.mgbdGetBoard = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.fetchBoard(boardName);
    TaskManager.queue.getWorker(JOB_FETCH_BOARD).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdGetBoardDetails gets a result and adds a board', async () => {
    RC.mgbdGetBoardDetails = jest.fn((id, cb) => cb(null, { _id: '1236' }));
    RC.mgbdGetBoard = jest.fn((id, cb) => cb(error, null));
    DBManager.board.addBoard = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_BOARD).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchBoard(boardName);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.board.addBoard).toBeCalled();
  });

  it('mgbdGetBoardDetails gets a result and does not refetch a board', async () => {
    RC.mgbdGetBoardDetails = jest.fn((id, cb) => cb(null, { _id: null }));
    RC.mgbdGetBoard = jest.fn((id, cb) => cb(error, null));
    DBManager.board.addBoard = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_BOARD).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchBoard(boardName);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(RC.mgbdGetBoard).toBeCalled();
  });

  it('mgbdGetBoardDetails gets a result and does not refetch a board', async () => {
    RC.mgbdGetBoardDetails = jest.fn((id, cb) => cb(null, { _id: null }));
    RC.mgbdGetBoard = jest.fn((id, cb) => cb(null, 'BRD000089'));
    DBManager.board.addBoard = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_BOARD).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.fetchBoard(boardName);
    expect(RC.mgbdGetBoard).toBeCalled();
  });
});

describe('fetchURL', () => {
  const cardId = 'AGY892Ip7W8';
  const url = 'corp.mongrov.com';
  DBManager.card.updateJsonOrHtmlData = url;
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('fetchURL returns a error', async () => {
    RC.fetchURL = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.fetchURL(cardId, url);
    TaskManager.queue.getWorker(JOB_FETCH_URL).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('fetchURL returns a result', async () => {
    RC.fetchURL = jest.fn((id, cb) => cb(null, 'result'));
    DBManager.card.updateJsonOrHtmlData = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_URL).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchURL(cardId, url);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.card.updateJsonOrHtmlData).toBeCalled();
  });

  it('fetchURL throws error', async () => {
    RC.fetchURL = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_URL).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchURL(cardId, url);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.app.logError).toBeCalled();
  });
});

describe('fetchBoardLists', () => {
  const boardName = 'BOARD';
  const bdList = 'DGY8KF';
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetList returns an error', async () => {
    RC.mgbdGetList = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.fetchBoardLists(boardName, bdList);
    TaskManager.queue.getWorker(JOB_FETCH_LISTS).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdGetList returns a result', async () => {
    RC.mgbdGetList = jest.fn((id, cb) => cb(null, [{ _id: 'lST1' }, { boardId: 'BRD03' }]));
    DBManager.lists.addLists = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_LISTS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchBoardLists(boardName, bdList);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.lists.addLists).toBeCalledTimes(1);
  });
});
//
describe('fetchCards', () => {
  const listId = 'HKD78DKH';
  const cardList = 'KJEFP98K';
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetCardList returns an error', async () => {
    RC.mgbdGetCardList = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.fetchCards(cardList, listId);
    TaskManager.queue.getWorker(JOB_FETCH_CARDS).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdGetCardList returns a result with 0 length', async () => {
    RC.mgbdGetCardList = jest.fn((id, cb) => cb(null, []));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CARDS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.fetchCards(cardList, listId);
    expect(RC.mgbdGetCardList).toBeCalled();
  });

  it('mgbdGetCardList returns a result with non zero length', async () => {
    RC.mgbdGetCardList = jest.fn((id, cb) => cb(null, [{ _id: 'CRD0122' }, { _id: null }]));
    DBManager.card.addCards = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CARDS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchCards(cardList, listId);
    expect(RC.mgbdGetCardList).toBeCalled();
    expect(DBManager.card.addCards).toBeCalled();
  });
});

describe('fetchCheckList', () => {
  const cardId = 'TYE680NKNSI';
  const checkList = 'OUN80NKNSI';
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetChecklists returns an error', async () => {
    RC.mgbdGetChecklists = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.fetchCheckList(cardId, checkList);
    TaskManager.queue.getWorker(JOB_FETCH_CHECK_LISTS).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdGetChecklists returns a result with 0 length', async () => {
    RC.mgbdGetChecklists = jest.fn((id, cb) => cb(null, []));
    DBManager.checklists.addChecklist = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CHECK_LISTS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchCheckList(cardId, checkList);
    expect(RC.mgbdGetChecklists).toBeCalled();
    expect(DBManager.checklists.addChecklist).not.toBeCalled();
  });

  it('mgbdGetChecklists returns a result with non 0 length', async () => {
    RC.mgbdGetChecklists = jest.fn((id, cb) => cb(null, [{ _id: 'CKL007' }, { _id: 'CKL0010' }]));
    DBManager.checklists.addChecklist = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CHECK_LISTS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchCheckList(cardId, checkList);
    expect(RC.mgbdGetChecklists).toBeCalled();
    expect(DBManager.checklists.addChecklist).toBeCalled();
  });
});

describe('fetchCardComments', () => {
  const cardId = 'TYE680NKNSI';
  const comments = 'OUN80NKNSI';
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetCardComments returns an error', async () => {
    RC.mgbdGetCardComments = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.fetchCardComments(cardId, comments);
    TaskManager.queue.getWorker(JOB_FETCH_CARD_COMMENTS).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdGetCardComments returns a result with 0 length', async () => {
    RC.mgbdGetCardComments = jest.fn((id, cb) => cb(null, []));
    DBManager.cardComments.addCardComments = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CARD_COMMENTS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchCardComments(cardId, comments);
    expect(RC.mgbdGetCardComments).toBeCalled();
    expect(DBManager.cardComments.addCardComments).not.toBeCalled();
  });

  it('mgbdGetCardComments returns a result with non 0 length', async () => {
    RC.mgbdGetCardComments = jest.fn((id, cb) => cb(null, [{ _id: 'CM2598' }, { _id: null }]));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CARD_COMMENTS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchCardComments(cardId, comments);
    expect(RC.mgbdGetCardComments).toBeCalled();
    expect(DBManager.cardComments.addCardComments).toBeCalledTimes(1);
  });
});

describe('fetch checkList items', () => {
  const checkListId = 'FN80NKNSI';
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetChecklistItems returns an error', async () => {
    RC.mgbdGetChecklistItems = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.fetchCheckListItems(checkListId);
    TaskManager.queue.getWorker(JOB_FETCH_CHECK_LIST_ITEMS).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdGetChecklistItems returns a result with 0 length', async () => {
    RC.mgbdGetChecklistItems = jest.fn((id, cb) => cb(null, []));
    DBManager.checklists.addCheckListItems = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CHECK_LIST_ITEMS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchCheckListItems(checkListId);
    expect(RC.mgbdGetChecklistItems).toBeCalled();
    expect(DBManager.checklists.addCheckListItems).not.toBeCalled();
  });

  it('mgbdGetChecklistItems returns a result with non 0 length', async () => {
    RC.mgbdGetChecklistItems = jest.fn((id, cb) =>
      cb(null, [{ _id: 'iT123', title: 'that is' }, { _id: 'iT124', title: 'it' }]),
    );
    DBManager.checklists.addCheckListItems = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CHECK_LIST_ITEMS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchCheckListItems(checkListId);
    expect(RC.mgbdGetChecklistItems).toBeCalled();
    expect(DBManager.checklists.addCheckListItems).toBeCalledTimes(2);
  });
});

describe('fetchBoardListTasks', () => {
  const boardId = 'FHGJ78';
  DBManager.checklists.addCheckListItems = boardId;
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetBoardListTasks returns an error', async () => {
    RC.mgbdGetBoardListTasks = jest.fn((id, cb) => cb(error, null));
    DBManager.lists.addLists = jest.fn();
    expect.assertions(1);
    await boardTaskManager.fetchBoardListTasks(boardId);
    TaskManager.queue.getWorker(JOB_FETCH_BOARD_LIST_TASKS).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdGetBoardListTasks returns a result', async () => {
    RC.mgbdGetBoardListTasks = jest.fn((id, cb) => cb(null, []));
    DBManager.lists.addLists = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_BOARD_LIST_TASKS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchBoardListTasks(boardId);
    expect(RC.mgbdGetBoardListTasks).toBeCalled();
    expect(DBManager.lists.addLists).toBeCalled();
  });

  it('mgbdGetBoardListTasks throws error', async () => {
    RC.mgbdGetBoardListTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_BOARD_LIST_TASKS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.fetchBoardListTasks(boardId);
    expect(DBManager.app.logError).toBeCalled();
  });
});

describe('fetch check list task', () => {
  const fetchChecklist = { _id: '123456789C', user: 'test', task: 'Continue' };
  const error = new Error('error');
  DBManager.checklists.addChecklist = jest.fn();

  beforeEach(() => {
    DBManager.app.logError.mockClear();
    DBManager.checklists.addChecklist.mockClear();
  });

  it('mgbdGetCardChecklistTasks returns an error', async () => {
    RC.mgbdGetCardChecklistTasks = jest.fn((list, cb) => cb(error, null));
    expect.assertions();
    await boardTaskManager.fetchCheckListTask(fetchChecklist);
    TaskManager.queue.getWorker(JOB_FETCH_CHECKLIST_TASKS).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdGetCardChecklistTasks returns an result', async () => {
    RC.mgbdGetCardChecklistTasks = jest.fn((list, cb) =>
      cb(null, [{ _id: 'CK0001' }, { _id: 'CK0002' }]),
    );
    DBManager.checklists.addChecklist = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CHECKLIST_TASKS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchCheckListTask(fetchChecklist);
    expect(RC.mgbdGetCardChecklistTasks).toBeCalled();
    expect(DBManager.checklists.addChecklist).toBeCalled();
  });

  it('mgbdGetCardChecklistTasks throws error', async () => {
    RC.mgbdGetCardChecklistTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CHECKLIST_TASKS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.fetchCheckListTask(fetchChecklist);
    expect(DBManager.app.logError).toBeCalled();
  });
});

describe('fetch check list Item', () => {
  const fetchChecklistItem = { _id: '123456789C', user: 'test', task: 'Continue' };
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetCardChecklistItemTasks returns an error', async () => {
    RC.mgbdGetCardChecklistItemTasks = jest.fn((list, cb) => cb(error, null));
    DBManager.checklists.addCheckListItems = jest.fn();
    expect.assertions(1);
    await boardTaskManager.fetchCheckListItemTask(fetchChecklistItem);
    TaskManager.queue.getWorker(JOB_FETCH_CHECKLISTITEM_TASKS).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdGetCardChecklistItemTasks returns an result', async () => {
    RC.mgbdGetCardChecklistItemTasks = jest.fn((list, cb) => cb(null, 'result'));
    DBManager.checklists.addCheckListItems = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CHECKLISTITEM_TASKS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(3);
    await boardTaskManager.fetchCheckListItemTask(fetchChecklistItem);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.checklists.addCheckListItems).toBeCalledWith('result');
    expect(DBManager.app.logError.mock.calls.length).toBe(1);
  });

  it('mgbdGetCardChecklistItemTasks throws error', async () => {
    RC.mgbdGetCardChecklistItemTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_CHECKLISTITEM_TASKS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.fetchCheckListItemTask(fetchChecklistItem);
    expect(DBManager.app.logError.mock.calls.length).toBe(1);
  });
});

describe('fetch comment task', () => {
  const fetchComment = { _id: '123456789C', user: 'test', task: 'Continue' };
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdGetCardCommentTasks returns an error', async () => {
    RC.mgbdGetCardCommentTasks = jest.fn((list, cb) => cb(error, null));
    DBManager.checklists.addChecklist = jest.fn();
    expect.assertions(1);
    await boardTaskManager.fetchCommentTask(fetchComment);
    TaskManager.queue.getWorker(JOB_FETCH_COMMENTS_TASKS).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdGetCardCommentTasks returns an result', async () => {
    RC.mgbdGetCardCommentTasks = jest.fn((list, cb) => cb(null, 'result'));
    DBManager.cardComments.addCardComments = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_COMMENTS_TASKS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.fetchCommentTask(fetchComment);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.cardComments.addCardComments).toBeCalledWith('result');
  });

  it('mgbdGetCardCommentTasks throws error', async () => {
    DBManager.app.logError.mockClear();
    RC.mgbdGetCardCommentTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_FETCH_COMMENTS_TASKS).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.fetchCommentTask(fetchComment);
    expect(DBManager.app.logError.mock.calls.length).toBe(1);
  });
});

describe('Create List', () => {
  const listToSave = 'JDODDF';
  DBManager.lists.addLists = jest.fn();
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
    DBManager.lists.addLists.mockClear();
  });

  it('mgbdCreateListsTasks returns an error', async () => {
    RC.mgbdCreateListsTasks = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.createList(listToSave);
    TaskManager.queue.getWorker(JOB_CREATE_LIST).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdCreateListsTasks returns a result', async () => {
    RC.mgbdCreateListsTasks = jest.fn((id, cb) => cb(null, []));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CREATE_LIST).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.createList(listToSave);
    expect(RC.mgbdCreateListsTasks).toBeCalled();
    expect(DBManager.lists.addLists).toBeCalled();
  });

  it('mgbdCreateListsTasks throws error', async () => {
    RC.mgbdCreateListsTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CREATE_LIST).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.createList(listToSave);
    expect(DBManager.app.logError).toBeCalled();
  });
});

describe('createCard', () => {
  const cardToSave = 'YIS79D';
  DBManager.card.addUserTasks = jest.fn();
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
    DBManager.card.addUserTasks.mockClear();
  });

  it('mgbdCreateCardTasks returns an error', async () => {
    RC.mgbdCreateCardTasks = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.createCard(cardToSave);
    TaskManager.queue.getWorker(JOB_CREATE_CARD).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdCreateCardTasks returns a result', async () => {
    RC.mgbdCreateCardTasks = jest.fn((id, cb) => cb(null, []));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CREATE_CARD).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.createCard(cardToSave);
    expect(RC.mgbdCreateCardTasks).toBeCalled();
    expect(DBManager.card.addUserTasks).toBeCalled();
  });

  it('mgbdCreateCardTasks throws error', async () => {
    RC.mgbdCreateCardTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CREATE_CARD).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.createCard(cardToSave);
    expect(DBManager.app.logError).toBeCalled();
  });
});

describe('creates check list', () => {
  const checkList = { _id: '123456789C', user: 'test', task: 'Continue' };
  const error = new Error('error');
  DBManager.checklists.addChecklist = jest.fn();

  beforeEach(() => {
    DBManager.app.logError.mockClear();
    DBManager.checklists.addChecklist.mockClear();
  });

  it('mgbdCreateChecklistTasks returns an error', async () => {
    RC.mgbdCreateChecklistTasks = jest.fn((list, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.createChecklist(checkList);
    TaskManager.queue.getWorker(JOB_CREATE_CHECKLIST).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdCreateChecklistTasks returns an result', async () => {
    RC.mgbdCreateChecklistTasks = jest.fn((list, cb) => cb(null, 'result'));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CREATE_CHECKLIST).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(3);
    await boardTaskManager.createChecklist(checkList);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.checklists.addChecklist).toBeCalledWith('result');
    expect(DBManager.app.logError.mock.calls.length).toBe(0);
  });

  it('mgbdCreateChecklistTasks throws error', async () => {
    RC.mgbdCreateChecklistTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CREATE_CHECKLIST).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.createChecklist(checkList);
    expect(DBManager.app.logError.mock.calls.length).toBe(1);
  });
});

describe('creates check list Item', () => {
  const checkListItems = { _id: '987345', user: 'test1', task: 'ContinueWork' };
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdCreateChecklistItemTasks returns an error', async () => {
    RC.mgbdCreateChecklistItemTasks = jest.fn((list, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.createChecklistItem(checkListItems);
    TaskManager.queue.getWorker(JOB_CREATE_CHECKLISTITEM).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdCreateChecklistItemTasks returns an result', async () => {
    RC.mgbdCreateChecklistItemTasks = jest.fn((list, cb) => cb(null, 'result'));
    DBManager.checklists.addCheckListItems = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CREATE_CHECKLISTITEM).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.createChecklistItem(checkListItems);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.checklists.addCheckListItems).toBeCalledWith('result');
  });

  it('mgbdCreateChecklistItemTasks throws error', async () => {
    DBManager.app.logError.mockClear();
    RC.mgbdCreateChecklistItemTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CREATE_CHECKLISTITEM).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.createChecklistItem(checkListItems);
    expect(DBManager.app.logError.mock.calls.length).toBe(1);
  });
});

describe('createComment', () => {
  const commentToSave = 'TREM57I';
  DBManager.cardComments.addCardComments = jest.fn();
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
    DBManager.cardComments.addCardComments.mockClear();
  });

  it('mgbdCreateCommentTasks returns an error', async () => {
    RC.mgbdCreateCommentTasks = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.createComment(commentToSave);
    TaskManager.queue.getWorker(JOB_CREATE_COMMENT).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdCreateCommentTasks returns a result', async () => {
    RC.mgbdCreateCommentTasks = jest.fn((id, cb) => cb(null, []));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CREATE_COMMENT).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.createComment(commentToSave);
    expect(RC.mgbdCreateCommentTasks).toBeCalled();
    expect(DBManager.cardComments.addCardComments).toBeCalled();
  });

  it('mgbdCreateCommentTasks throws error', async () => {
    RC.mgbdCreateCommentTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_CREATE_COMMENT).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.createComment(commentToSave);
    expect(DBManager.app.logError).toBeCalled();
  });
});

describe('updateList', () => {
  const listUpdate = 'TREM57I';
  DBManager.lists.addLists = jest.fn();
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
    DBManager.lists.addLists.mockClear();
  });

  it('mgbdUpdateListTasks returns an error', async () => {
    RC.mgbdUpdateListTasks = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.updateList(listUpdate);
    TaskManager.queue.getWorker(JOB_UPDATE_LIST).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdUpdateListTasks returns a result', async () => {
    RC.mgbdUpdateListTasks = jest.fn((id, cb) => cb(null, []));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_UPDATE_LIST).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.updateList(listUpdate);
    expect(RC.mgbdUpdateListTasks).toBeCalled();
    expect(DBManager.lists.addLists).toBeCalled();
  });

  it('mgbdUpdateListTasks throws error', async () => {
    RC.mgbdUpdateListTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_UPDATE_LIST).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.updateList(listUpdate);
    expect(DBManager.app.logError).toBeCalled();
  });
});

describe('updateCard', () => {
  const cardUpdate = 'UIMS67K';
  const error = new Error('error');
  DBManager.card.addUserTasks = jest.fn();

  beforeEach(() => {
    DBManager.app.logError.mockClear();
    DBManager.card.addUserTasks.mockClear();
  });

  it('mgbdUpdateCardTasks returns an error', async () => {
    RC.mgbdUpdateCardTasks = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.updateCard(cardUpdate);
    TaskManager.queue.getWorker(JOB_UPDATE_CARD).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdUpdateCardTasks returns a result', async () => {
    RC.mgbdUpdateCardTasks = jest.fn((id, cb) => cb(null, []));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_UPDATE_CARD).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.updateCard(cardUpdate);
    expect(RC.mgbdUpdateCardTasks).toBeCalled();
    expect(DBManager.card.addUserTasks).toBeCalled();
  });

  it('mgbdUpdateCardTasks throws error', async () => {
    RC.mgbdUpdateCardTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_UPDATE_CARD).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.updateCard(cardUpdate);
    expect(DBManager.app.logError).toBeCalled();
  });
});

describe('updates check list', () => {
  const updatecheckList = { _id: '12345', user: 'test2', task: 'ContinueWork' };
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdUpdateChecklistTasks returns an error', async () => {
    RC.mgbdUpdateChecklistTasks = jest.fn((list, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.updateChecklist(updatecheckList);
    TaskManager.queue.getWorker(JOB_UPDATE_CHECKLIST).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdUpdateChecklistTasks returns an result', async () => {
    RC.mgbdUpdateChecklistTasks = jest.fn((list, cb) => cb(null, 'result'));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_UPDATE_CHECKLIST).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.updateChecklist(updatecheckList);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.app.logError.mock.calls.length).toBe(0);
  });

  it('mgbdUpdateChecklistTasks throws error', async () => {
    RC.mgbdUpdateChecklistTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_UPDATE_CHECKLIST).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.updateChecklist(updatecheckList);
    expect(DBManager.app.logError.mock.calls.length).toBe(1);
  });
});

describe('updates check listItems', () => {
  const updatecheckListitem = { _id: '123456', user: 'test3', task: 'ContinueWork' };
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdUpdateChecklistItemTasks returns an error', async () => {
    RC.mgbdUpdateChecklistItemTasks = jest.fn((list, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.updateChecklistItem(updatecheckListitem);
    TaskManager.queue.getWorker(JOB_UPDATE_CHECKLISTITEM).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdUpdateChecklistItemTasks returns an result', async () => {
    RC.mgbdUpdateChecklistItemTasks = jest.fn((list, cb) => cb(null, 'result'));
    DBManager.checklists.addCheckListItems = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_UPDATE_CHECKLISTITEM).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.updateChecklistItem(updatecheckListitem);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.checklists.addCheckListItems).toBeCalled();
  });

  it('mgbdUpdateChecklistItemTasks throws error', async () => {
    RC.mgbdUpdateChecklistItemTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_UPDATE_CHECKLISTITEM).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.updateChecklistItem(updatecheckListitem);
    expect(DBManager.app.logError.mock.calls.length).toBe(1);
  });
});

describe('deleteList', () => {
  const listDelete = 'JEI79L';
  const error = new Error('error');
  DBManager.lists.deleteList = jest.fn();
  DBManager.card.deleteListCard = jest.fn();

  beforeEach(() => {
    DBManager.app.logError.mockClear();
    DBManager.lists.deleteList.mockClear();
    DBManager.card.deleteListCard.mockClear();
  });

  it('mgbdDeleteListsTasks returns an error', async () => {
    RC.mgbdDeleteListsTasks = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.deleteList(listDelete);
    TaskManager.queue.getWorker(JOB_DELETE_LIST).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdDeleteListsTasks returns a result', async () => {
    RC.mgbdDeleteListsTasks = jest.fn((id, cb) => cb(null, []));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_DELETE_LIST).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(3);
    await boardTaskManager.deleteList(listDelete);
    expect(RC.mgbdDeleteListsTasks).toBeCalled();
    expect(DBManager.lists.deleteList).toBeCalled();
    expect(DBManager.card.deleteListCard).toBeCalled();
  });

  it('mgbdDeleteListsTasks throws error', async () => {
    RC.mgbdDeleteListsTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_DELETE_LIST).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.deleteList(listDelete);
    expect(DBManager.app.logError).toBeCalled();
  });
});

describe('deleteCard', () => {
  const cardDelete = 'JE79L';
  const error = new Error('error');
  DBManager.card.deleteCard = jest.fn();

  beforeEach(() => {
    DBManager.app.logError.mockClear();
    DBManager.card.deleteCard.mockClear();
  });

  it('mgbdDeleteCardTasks returns an error', async () => {
    RC.mgbdDeleteCardTasks = jest.fn((id, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.deleteCard(cardDelete);
    TaskManager.queue.getWorker(JOB_DELETE_CARD).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdDeleteCardTasks returns a result', async () => {
    RC.mgbdDeleteCardTasks = jest.fn((id, cb) => cb(null, []));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_DELETE_CARD).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.deleteCard(cardDelete);
    expect(RC.mgbdDeleteCardTasks).toBeCalled();
    expect(DBManager.card.deleteCard).toBeCalled();
  });

  it('mgbdDeleteCardTasks throws error', async () => {
    RC.mgbdDeleteCardTasks = jest.fn(() => Promise.reject(error));
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_DELETE_CARD).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(1);
    await boardTaskManager.deleteCard(cardDelete);
    expect(DBManager.app.logError).toBeCalled();
  });
});

describe('BoardTaskManager calls deleteChecklist', () => {
  const deleteCheckList = { _id: '1234567', user: 'test4', task: 'ContinueWork' };
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdDeleteChecklistTasks returns an error', async () => {
    RC.mgbdDeleteChecklistTasks = jest.fn((list, cb) => cb(error, null));
    expect.assertions(1);
    await boardTaskManager.deleteChecklist(deleteCheckList);
    TaskManager.queue.getWorker(JOB_DELETE_CHECKLIST).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdDeleteChecklistTasks returns an result', async () => {
    RC.mgbdDeleteChecklistTasks = jest.fn((list, cb) => cb(null, 'result'));
    DBManager.checklists.deleteChecklist = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_DELETE_CHECKLIST).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    await boardTaskManager.deleteChecklist(deleteCheckList);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.checklists.deleteChecklist).toBeCalled();
  });
});

describe('BoardTaskManager calls deleteChecklist', () => {
  const deleteCheckListItems = { _id: '12345678', user: 'test5', task: 'ContinueWork' };
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdDeleteChecklistItemTasks returns an error', async () => {
    RC.mgbdDeleteChecklistItemTasks = jest.fn((list, cb) => cb(error, null));
    expect.assertions(1);
    boardTaskManager.deleteChecklistItem(deleteCheckListItems);
    TaskManager.queue.getWorker(JOB_DELETE_CHECKLISTITEM).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdDeleteChecklistItemTasks returns a result', async () => {
    RC.mgbdDeleteChecklistItemTasks = jest.fn((list, cb) => cb(null, 'result'));
    DBManager.checklists.deleteCheckListItems = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_DELETE_CHECKLISTITEM).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    boardTaskManager.deleteChecklistItem(deleteCheckListItems);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.checklists.deleteCheckListItems).toBeCalled();
  });
});

describe('BoardTaskManager calls deleteComment', () => {
  const commentDelete = 'JE,79L';
  const error = new Error('error');

  beforeEach(() => {
    DBManager.app.logError.mockClear();
  });

  it('mgbdDeleteCommentTasks returns an error', async () => {
    RC.mgbdDeleteCommentTasks = jest.fn((list, cb) => cb(error, null));
    expect.assertions(1);
    boardTaskManager.deleteComment(commentDelete);
    TaskManager.queue.getWorker(JOB_DELETE_COMMENT).options.onFailed();
    expect(DBManager.app.logError).toBeCalled();
  });

  it('mgbdDeleteCommentTasks returns a result', async () => {
    RC.mgbdDeleteCommentTasks = jest.fn((list, cb) => cb(null, 'result'));
    DBManager.cardComments.deleteComment = jest.fn();
    const onSuccess = jest.fn();
    const onFailed = jest.fn();
    TaskManager.queue.getWorker(JOB_DELETE_COMMENT).options = {
      onSuccess,
      onFailed,
    };
    expect.assertions(2);
    boardTaskManager.deleteComment(commentDelete);
    expect(onSuccess.mock.calls.length).toBe(1);
    expect(DBManager.cardComments.deleteComment).toBeCalled();
  });
});

it('BoardTaskManager calls verifyCerts', () => {
  RC.verifyCerts = jest.fn();
  const jsonData = { data: '123456O' };
  const callback = () => {};
  boardTaskManager.verifyCerts(jsonData, callback);
  expect(RC.verifyCerts.mock.calls.length).toBe(1);
});
