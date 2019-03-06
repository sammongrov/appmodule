/*
 * User Manager class
 */
import AppUtil from '@utils';
import Constants from '../constants';

const MODULE = 'addBoard';
// wrapper class for all user related db functions
export default class BoardManager {
  constructor(realm, taskManager) {
    this._realm = realm;
    this._taskManager = taskManager;
    this._listeners = {};
  }

  get list() {
    return this._realm.objects(Constants.Board);
  }

  // find board by id
  findById(bid) {
    const res = this.list.filtered(`_id = "${bid}"`);
    return res && res.length > 0 ? res['0'] : null;
  }

  findOrCreateByName(groupData) {
    this._taskManager.board.fetchBoard(groupData);
    // const res = this.list.filtered(`title = "${boardName}"`);
    // return res && res.length > 0 ? res['0'] : null;
  }

  findBoardByName(boardName) {
    const res = this.list.filtered(`title = "${boardName}"`);
    return res && res.length > 0 ? res['0'] : null;
  }

  fetchUserTasks(userId) {
    this._taskManager.board.fetchUserTasks(userId);
  }

  fetchBoardTasks(boardName) {
    this._taskManager.board.fetchBoardTasks(boardName);
  }

  fetchAllBoard() {
    this._taskManager.board.fetchBoard();
  }

  addBoardListener = (listener) => {
    this._realm.objects(Constants.Board).addListener(listener);
  };

  removeBoardListener = (listener) => {
    this._realm.objects(Constants.Board).removeListener(listener);
  };

  addBoard(boardObj) {
    try {
      if (!boardObj || !boardObj._id) return;
      // AppUtil.debug(null, MODULE);
      this._realm.write(() => {
        let membersList = '';
        if (boardObj.members) {
          membersList = JSON.stringify(boardObj.members);
        }
        const objToStore = {
          _id: boardObj._id,
          title: boardObj.title,
          archived: boardObj.archived,
          createdAt: boardObj.createdAt,
          stars: boardObj.stars,
          members: membersList,
        };
        // AppUtil.debug(objToStore, null);
        this._realm.create(Constants.Board, objToStore, true);
      });
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  }
}
