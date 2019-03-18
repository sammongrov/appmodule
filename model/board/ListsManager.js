/*
 * User Manager class
 */
import _ from 'lodash';
import AppUtil from '@mongrov/utils';
import Constants from '../constants';

const MODULE = 'addAllList';

// wrapper class for all user related db functions
export default class ListsManager {
  constructor(realm, taskManager) {
    this._realm = realm;
    this._taskManager = taskManager;
    this._listeners = {};
  }

  get list() {
    return this._realm.objects(Constants.Lists);
  }

  // find card by id
  findById(lid) {
    const res = this.list.filtered(`_id = "${lid}"`);
    return res && res.length > 0 ? res['0'] : null;
  }

  findByBoardIdAsList(bid) {
    const res = this.list.filtered(`boardId = "${bid}"`);
    return res && res.length > 0 ? res : null;
  }

  fetchBoardList(boardId) {
    this._taskManager.board.fetchBoardListTasks(boardId);
  }

  fetchAllBoardByName(boardname) {
    this._taskManager.board.fetchBoardLists(boardname);
  }

  addListsListener = (listener) => {
    this._realm.objects(Constants.Lists).addListener(listener);
  };

  removeListsListener = (listener) => {
    this._realm.objects(Constants.Lists).removeListener(listener);
  };

  deleteList(listId) {
    try {
      if (!listId) return;
      this._realm.write(() => {
        const Id = listId._id;
        this._realm.delete(this._realm.objects(Constants.Lists).filtered(`_id = "${Id}"`));
      });
    } catch (error) {
      AppUtil.debug(error, MODULE);
    }
  }

  addLists(listsList) {
    try {
      if (listsList === null || listsList === []) return;
      this._realm.write(() => {
        const clearRealmData = _.differenceBy(
          this._realm.objects(Constants.Lists),
          listsList,
          '_id',
        );
        if (clearRealmData) {
          clearRealmData.forEach((element) => {
            this._realm.delete(
              this._realm.objects(Constants.Lists).filtered(`_id = "${element._id}"`),
            );
          });
        }
        listsList.forEach((lists) => {
          var obj = lists;
          obj = AppUtil.removeEmptyValues(obj);
          if (obj._id) {
            const objToStore = {
              _id: obj._id,
              title: obj.title,
              boardId: obj.boardId,
              createdAt: obj.createdAt,
              sort: obj.sort,
            };
            this._realm.create(Constants.Lists, objToStore, true);
          }
        });
      });
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  }
}
