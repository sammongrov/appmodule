/*
 * User Manager class
 */
import AppUtil from '@mongrov/utils';
import Constants from '../constants';

const MODULE = 'addCardComments';

// wrapper class for all user related db functions
export default class CardCommentsManager {
  constructor(realm, taskManager) {
    this._realm = realm;
    this._taskManager = taskManager;
    this._listeners = {};
  }

  get list() {
    return this._realm.objects(Constants.CardComments);
  }

  findByCardIdAsList(cid) {
    const res = this.list.filtered(`cardId = "${cid}"`);
    return res && res.length > 0 ? res : null;
  }

  fetchCardComments(id) {
    this._taskManager.board.fetchCardComments(id);
  }

  fetchComment(fetchComment) {
    this._taskManager.board.fetchCommentTask(fetchComment);
  }

  deleteComment(commentId) {
    try {
      if (!commentId) return;
      this._realm.write(() => {
        const Id = commentId._id;
        this._realm.delete(this._realm.objects(Constants.CardComments).filtered(`_id = "${Id}"`));
      });
    } catch (error) {
      AppUtil.debug(error, MODULE);
    }
  }

  addCardComments(commentList) {
    try {
      if (commentList === null || commentList === []) return;
      this._realm.write(() => {
        commentList.forEach((comment) => {
          let obj = comment;
          obj = AppUtil.removeEmptyValues(obj);
          if (obj._id) {
            const objToStore = {
              _id: obj._id,
              text: obj.comment,
              userId: obj.authorId,
              boardId: obj.boardId,
              cardId: obj.cardId,
              createdAt: obj.createdAt,
            };
            // AppUtil.debug(objToStore, null);
            this._realm.create(Constants.CardComments, objToStore, true);
          }
        });
      });
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  }

  addCommentsListner(cardID, listener) {
    this._realm
      .objects(Constants.CardComments)
      .filtered(`cardId = "${cardID}"`)
      .addListener(listener);
  }

  removeCommentsListner(cardID, listener) {
    this._realm
      .objects(Constants.Checklistitems)
      .filtered(`cardId = "${cardID}"`)
      .removeListener(listener);
  }
}
