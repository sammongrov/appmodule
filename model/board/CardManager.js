/*
 * User Manager class
 */
import AppUtil from '@mongrov/utils';
import Constants from '../constants';
import Application from '../../../constants/config';

const MODULE = 'addAllCards';

// wrapper class for all user related db functions
export default class CardManager {
  constructor(realm, taskManager) {
    this._realm = realm;
    this._taskManager = taskManager;
    this._listeners = {};
  }

  get list() {
    return this._realm.objects(Constants.Card);
  }

  // find card by id
  findById(cid) {
    const res = this.list.filtered(`_id = "${cid}"`);
    return res && res.length > 0 ? res['0'] : null;
  }

  findByListId(lid) {
    const res = this.list.filtered(`listId = "${lid}"`);
    return res && res.length > 0 ? res : null;
  }

  addCardListener = (listener) => {
    this._realm.objects(Constants.Card).addListener(listener);
  };

  removeCardListener = (listener) => {
    this._realm.objects(Constants.Card).removeListener(listener);
  };

  addCardDetailListner = (id, listener) => {
    if (id) {
      this._realm
        .objects(Constants.Card)
        .filtered(`_id = "${id}" `)
        .addListener(listener);
    }
  };

  removeCardDetailListner = (id, listener) => {
    this._realm
      .objects(Constants.Card)
      .filtered(`_id = "${id}" `)
      .removeListener(listener);
  };

  addCards(cardList) {
    try {
      if (!cardList || !cardList._id) return;
      // AppUtil.debug(null, `${Constants.MODULE}: addAll`);
      this._realm.write(() => {
        // Object.keys(cardList).forEach((k) => {
        let obj = cardList;
        let membersList = '';
        if (cardList.members) {
          membersList = JSON.stringify(cardList.members);
        }
        obj = AppUtil.removeEmptyValues(cardList);
        if (obj._id) {
          const objToStore = {
            _id: obj._id,
            title: obj.title,
            userId: obj.userId,
            boardId: obj.boardId,
            sort: obj.sort,
            archived: obj.archived,
            isOvertime: obj.isOvertime,
            createdAt: obj.createdAt,
            dateLastActivity: obj.dateLastActivity,
            listId: obj.listId,
            description: obj.description,
            dueAt: obj.dueAt,
            receivedAt: obj.receivedAt,
            startAt: obj.startAt,
            endAt: obj.endAt,
            spentTime: obj.spentTime,
            members: membersList,
          };
          // AppUtil.debug(objToStore, null);
          this._realm.create(Constants.Card, objToStore, true);
        }
        // });
      });
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  }

  deleteCard(cardId) {
    try {
      if (!cardId) return;
      this._realm.write(() => {
        const Id = cardId._id;
        this._realm.delete(this._realm.objects(Constants.Card).filtered(`_id = "${Id}"`));
      });
    } catch (error) {
      AppUtil.debug(error, MODULE);
    }
  }

  deleteListCard(listId) {
    try {
      if (!listId) return;
      this._realm.write(() => {
        const Id = listId._id;
        this._realm.delete(this._realm.objects(Constants.Card).filtered(`listId = "${Id}"`));
      });
    } catch (error) {
      AppUtil.debug(error, MODULE);
    }
  }

  // taskList : [{}, {}, ...]
  addUserTasks(taskList, userId, currUser) {
    // TODO need to change this logic. if any one of the data is corrupt, others should be populated
    try {
      if (taskList === null || taskList === []) return;
      const cardsToFetchJsonData = [];
      this._realm.write(() => {
        // this._realm.delete(this._realm.objects(Constants.Card));
        taskList.forEach(async (task) => {
          let obj = task;
          let membersList = '';
          if (task.members) {
            membersList = JSON.stringify(task.members);
          }
          obj = AppUtil.removeEmptyValues(task);
          if (obj._id && obj.boardId && obj.listId && userId) {
            let certificateUUID;
            if (obj.customFields) {
              for (let index = 0; index < obj.customFields.length; index += 1) {
                const element = obj.customFields[index];
                if (element && element.name) {
                  if (element.name === 'certificateUUID') {
                    certificateUUID = element.value;
                  }
                }
              }
            }

            const cardToStore = {
              _id: obj._id,
              title: obj.title,
              userId,
              boardId: obj.boardId,
              listId: obj.listId,
              description: obj.description,
              members: membersList,
              certificateUUID,
              listSort: obj.listSort,
              sort: obj.sort,
            };
            let temp = obj.boardTitle;
            const splits = temp.split('-');
            // Ezhil todo add more validation to handle this
            if (splits.length > 1 && currUser && currUser.username) {
              temp = splits[0] === currUser.username ? splits[1] : splits[0];
            }
            const boardToStore = {
              _id: obj.boardId,
              title: obj.boardTitle,
              members: membersList,
            };
            const listToStore = {
              _id: obj.listId,
              title: obj.listTitle,
              boardId: obj.boardId,
            };
            this._realm.create(Constants.Board, boardToStore, true);
            this._realm.create(Constants.Lists, listToStore, true);
            this._realm.create(Constants.Card, cardToStore, true);
            if (cardToStore.certificateUUID) {
              cardsToFetchJsonData.push(cardToStore);
            }
          }
        });
      });
      cardsToFetchJsonData.forEach(async (cardObj) => {
        this._taskManager._board.fetchURL(cardObj._id, this.jsonURL(cardObj));
        this._taskManager._board.fetchURL(cardObj._id, this.htmlURL(cardObj));
      });
    } catch (error) {
      AppUtil.debug(`ERROR WRITING USER TASKS TO DB ${JSON.stringify(error)}`, MODULE);
    }
  }

  updateJsonOrHtmlData(cardId, url, data) {
    var cardObj = this.findById(cardId);
    if (cardObj && data) {
      this._realm.write(() => {
        if (url.endsWith('.json')) {
          cardObj.certificateJson = JSON.stringify(data);
        } else {
          cardObj.certificateHtml = data;
        }
        this._realm.create(Constants.Card, cardObj, true);
      });
    }
  }

  verifyCerts = (jsonData, callback) => {
    this._taskManager._board.verifyCerts(jsonData, callback);
  };

  // eg., https://certs.groov.one/issuer/mongrov/7060b081-98b5-48bc-bd62-1d0dc34c24a0.html
  htmlURL(cardObj) {
    if (cardObj && cardObj.certificateUUID) {
      // issuer name is board title
      const boardList = this._realm.objects(Constants.Board).filtered(`_id = "${cardObj.boardId}"`);
      if (boardList && boardList.length > 0) {
        return `${Application.urls.SERVER_URL}/issuer/${boardList[0].title}/${
          cardObj.certificateUUID
        }.html`;
      }
    }
    return undefined;
  }

  jsonURL(cardObj) {
    if (cardObj && cardObj.certificateUUID) {
      // issuer name is board title
      const boardList = this._realm.objects(Constants.Board).filtered(`_id = "${cardObj.boardId}"`);
      if (boardList && boardList.length > 0) {
        return `${Application.urls.SERVER_URL}/issuer/${boardList[0].title}/${
          cardObj.certificateUUID
        }.json`;
      }
    }
    return undefined;
  }
}
