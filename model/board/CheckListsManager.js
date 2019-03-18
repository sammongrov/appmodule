/*
 * User Manager class
 */
import _ from 'lodash';
import AppUtil from '@mongrov/utils';
import Constants from '../constants';

const MODULE = 'addAllChecklists';

// wrapper class for all user related db functions
export default class CheckListsManager {
  constructor(realm, taskManager) {
    this._realm = realm;
    this._taskManager = taskManager;
    this._listeners = {};
  }

  get list() {
    return this._realm.objects(Constants.Checklists);
  }

  findByCardIdAsList(cid) {
    const res = this.list.filtered(`cardId = "${cid}"`);
    return res && res.length > 0 ? res : null;
  }

  findCheckListItem(checkLIstId) {
    const res = this._realm
      .objects(Constants.Checklistitems)
      .filtered(`checklistId = "${checkLIstId}"`);
    return res && res.length > 0 ? res : null;
  }

  findCheckListItemByCardId(cardId) {
    const res = this._realm.objects(Constants.Checklistitems).filtered(`cardId = "${cardId}"`);
    return res && res.length > 0 ? res : null;
  }

  deleteChecklist(checklistId) {
    try {
      if (!checklistId) return;
      this._realm.write(() => {
        const Id = checklistId._id;
        this._realm.delete(this._realm.objects(Constants.Checklists).filtered(`_id = "${Id}"`));
      });
    } catch (error) {
      AppUtil.debug(error, MODULE);
    }
  }

  deleteCheckListItems(itemId) {
    try {
      if (!itemId) return;
      this._realm.write(() => {
        const Id = itemId._id;
        this._realm.delete(this._realm.objects(Constants.Checklistitems).filtered(`_id = "${Id}"`));
      });
    } catch (error) {
      AppUtil.debug(error, MODULE);
    }
  }

  addCheckListItems(checkListItems) {
    try {
      if (checkListItems === null || checkListItems === []) return;
      this._realm.write(() => {
        const resp = checkListItems.items;
        const clearRealmData = _.differenceBy(
          this._realm.objects(Constants.Checklistitems),
          resp,
          '_id',
        );
        if (clearRealmData) {
          clearRealmData.forEach((element) => {
            this._realm.delete(
              this._realm.objects(Constants.Checklistitems).filtered(`_id = "${element._id}"`),
            );
          });
        }
        resp.forEach((list) => {
          let obj = list;
          obj = AppUtil.removeEmptyValues(obj);
          if (obj._id) {
            const objToStore = {
              _id: obj._id,
              checklistId: obj.checklistId,
              cardId: obj.cardId,
              title: obj.title,
              userId: obj.userId,
              sort: obj.sort,
              isFinished: obj.isFinished,
            };
            this._realm.create(Constants.Checklistitems, objToStore, true);
          }
        });
      });
    } catch (error) {
      AppUtil.debug(error, MODULE);
    }
  }

  addChecklist(checkList) {
    try {
      if (checkList === null || checkList === []) return;
      this._realm.write(() => {
        const clearRealmData = _.differenceBy(
          this._realm.objects(Constants.Checklists),
          checkList,
          '_id',
        );
        if (clearRealmData) {
          clearRealmData.forEach((element) => {
            this._realm.delete(
              this._realm.objects(Constants.Checklists).filtered(`_id = "${element._id}"`),
            );
          });
        }
        checkList.forEach((list) => {
          let obj = list;
          obj = AppUtil.removeEmptyValues(obj);
          if (obj._id) {
            const objToStore = {
              _id: obj._id,
              title: obj.title,
              userId: obj.userId,
              sort: obj.sort,
              cardId: obj.cardId,
              createdAt: obj.createdAt,
            };
            this._realm.create(Constants.Checklists, objToStore, true);
          }
        });
      });
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  }

  fetchCheckList(cardId) {
    this._taskManager.board.fetchCheckList(cardId);
  }

  fetchCheckListTask(fetchChecklist) {
    this._taskManager.board.fetchCheckListTask(fetchChecklist);
  }

  addCheckListListner(cardId, listener) {
    if (cardId) {
      this._realm
        .objects(Constants.Checklists)
        .filtered(`cardId = "${cardId}" `)
        .addListener(listener);
    }
  }

  removeCheckListListner(cardId, listener) {
    if (cardId) {
      this._realm
        .objects(Constants.Checklists)
        .filtered(`cardId = "${cardId}" `)
        .removeListener(listener);
    }
  }

  addCheckListItemListner(listener) {
    this._realm.objects(Constants.Checklistitems).addListener(listener);
  }

  removeCheckListItemListner(listener) {
    this._realm.objects(Constants.Checklistitems).removeListener(listener);
  }
}
