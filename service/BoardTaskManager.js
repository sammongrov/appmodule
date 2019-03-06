import AppUtil from '@mongrov/utils';

const JOB_FETCH_USER_TASKS = 'FetchUserTasks';
const JOB_FETCH_BOARD_TASKS = 'FetchBoardTasks';
const JOB_FETCH_BOARD_LIST_TASKS = 'FetchBoardListTasks';
const JOB_FETCH_BOARD_SWIMLANE = 'FetchBoardSwimline';
const JOB_FETCH_CHECKLIST_TASKS = 'FetchCheckListTask';
const JOB_FETCH_COMMENTS_TASKS = 'FetchCommentTask';
const JOB_FETCH_CHECKLISTITEM_TASKS = 'fetchChecklistItemTask';
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

const JOB_FETCH_BOARD = 'FetchBoard';
const JOB_FETCH_LISTS = 'FetchLists';
const JOB_FETCH_CARDS = 'FetchCards';
const JOB_FETCH_CHECK_LISTS = 'FetchCheckLists';
const JOB_FETCH_CARD_COMMENTS = 'FetchComments';
const JOB_FETCH_URL = 'FetchURL';
const JOB_FETCH_CHECK_LIST_ITEMS = 'FetchCheckListItems';

const MODULE = 'BoardTaskManager';

export default class BoardTaskManager {
  constructor(taskManager, dbManager) {
    // temp assigning RC here. It need to be passed
    if (taskManager && dbManager) {
      this._taskManager = taskManager;
      this._dbManager = dbManager;
      this._provider = this._taskManager.provider;
      this.initTaskManager();
    }
  }

  /* Initiate Task Handler */
  initTaskManager = () => {
    this._initFetchBoardWorker();
    this._initFetchUserTasksWorker();
    this._initFetchBoardTasksWorker();
    this._initFetchBoardSwimlaneWorker();
    this._initFetchBoardListWorker();
    this._initFetchCardChecklistWorker();
    this._initFetchCardChecklistItemWorker();
    this._initFetchCardCommentWorker();
    this._initCreateListWorker();
    this._initCreateCardWorker();
    this._initCreateChecklistWorker();
    this._initCreateChecklistItemWorker();
    this._initCreateCommentWorker();
    this._initUpdateListWorker();
    this._initUpdateCardWorker();
    this._initUpdateChecklistWorker();
    this._initUpdateChecklistItemWorker();
    this._initDeleteListWorker();
    this._initDeleteCardWorker();
    this._initDeleteChecklistWorker();
    this._initDeleteChecklistItemWorker();
    this._initDeleteCommentWorker();
    this._initFetchBoardListsWorker();
    this._initFetchCardsWorker();
    this._initFetchCheckListsWorker();
    this._initFetchCardCommentsWorker();
    this._initFetchURL();
    this._initFetchCheckListItemsWorker();
  };

  // #region Worker Method(s)
  _initFetchUserTasksWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_USER_TASKS,
      async (jobId, userId) => {
        try {
          // this._dbManager.app.app.host;
          await this._taskManager.provider.mgbdGetUserTasks(userId, (error, res) => {
            if (error) {
              this._logError(null, JOB_FETCH_USER_TASKS, error.toString());
            }
            const currUser = this._dbManager.user.loggedInUser;
            this._dbManager.card.addUserTasks(res, userId, currUser);
          });
        } catch (error) {
          this._logError(null, JOB_FETCH_USER_TASKS, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_FETCH_USER_TASKS);
        },
      },
    );
  };

  _initFetchBoardTasksWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_BOARD_TASKS,
      async (jobId, boardName) => {
        try {
          await this._taskManager.provider.mgbdGetBoardTasks(boardName, (error, res) => {
            if (error) {
              this._logError(null, JOB_FETCH_BOARD_TASKS, error.toString());
            }
            const currUser = this._dbManager.user.loggedInUser;
            this._dbManager.card.addUserTasks(res, boardName, currUser);
          });
        } catch (error) {
          this._logError(null, JOB_FETCH_BOARD_TASKS, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_FETCH_BOARD_TASKS);
        },
      },
    );
  };

  _initFetchBoardSwimlaneWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_BOARD_SWIMLANE,
      async (jobId, cardToSave) => {
        const Id = cardToSave.boardId;
        const cId = cardToSave;
        try {
          await this._taskManager.provider.mgbdGetBoardSwimlane(Id, (error, res) => {
            if (error) {
              this._logError(null, JOB_FETCH_BOARD_SWIMLANE, error.toString());
            }
            if (res) {
              cId.swimlaneId = res[0]._id;
              this.createCard(cId);
            }
            return this._logError(null, JOB_FETCH_BOARD_SWIMLANE, error.toString());
          });
        } catch (error) {
          this._logError(null, JOB_FETCH_BOARD_SWIMLANE, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_FETCH_BOARD_SWIMLANE);
        },
      },
    );
  };

  _initFetchBoardListWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_BOARD_LIST_TASKS,
      async (jobId, boardId) => {
        try {
          await this._taskManager.provider.mgbdGetBoardListTasks(boardId, (error, res) => {
            if (error) {
              this._logError(null, JOB_FETCH_BOARD_LIST_TASKS, error.toString());
            }
            this._dbManager.lists.addLists(res);
          });
        } catch (error) {
          this._logError(null, JOB_FETCH_BOARD_LIST_TASKS, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_FETCH_BOARD_LIST_TASKS);
        },
      },
    );
  };

  _initFetchCardChecklistWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_CHECKLIST_TASKS,
      async (jobId, fetchChecklist) => {
        const checklistItem = fetchChecklist;
        try {
          await this._taskManager.provider.mgbdGetCardChecklistTasks(
            fetchChecklist,
            (error, res) => {
              if (error) {
                this._logError(null, JOB_FETCH_CHECKLIST_TASKS, error.toString());
              }
              this._dbManager.checklists.addChecklist(res);
              if (!res) return;
              res.forEach((checkList) => {
                checklistItem.checklistID = checkList._id;
                this.fetchCheckListItemTask(checklistItem);
              });
            },
          );
        } catch (error) {
          this._logError(null, JOB_FETCH_CHECKLIST_TASKS, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_FETCH_CHECKLIST_TASKS);
        },
      },
    );
  };

  _initFetchCardChecklistItemWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_CHECKLISTITEM_TASKS,
      async (jobId, fetchChecklistItem) => {
        try {
          await this._taskManager.provider.mgbdGetCardChecklistItemTasks(
            fetchChecklistItem,
            (error, res) => {
              if (error) {
                this._logError(null, JOB_FETCH_CHECKLISTITEM_TASKS, error.toString());
              }
              this._dbManager.checklists.addCheckListItems(res);
              return this._logError(null, JOB_FETCH_CHECKLISTITEM_TASKS, error.toString());
            },
          );
        } catch (error) {
          this._logError(null, JOB_FETCH_CHECKLISTITEM_TASKS, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_FETCH_CHECKLISTITEM_TASKS);
        },
      },
    );
  };

  _initFetchCardCommentWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_COMMENTS_TASKS,
      async (jobId, fetchComment) => {
        try {
          await this._taskManager.provider.mgbdGetCardCommentTasks(fetchComment, (error, res) => {
            if (error) {
              this._logError(null, JOB_FETCH_COMMENTS_TASKS, error.toString());
            }
            this._dbManager.cardComments.addCardComments(res);
          });
        } catch (error) {
          this._logError(null, JOB_FETCH_COMMENTS_TASKS, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_FETCH_COMMENTS_TASKS);
        },
      },
    );
  };

  _initCreateListWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_CREATE_LIST,
      async (jobId, listToSave) => {
        try {
          await this._taskManager.provider.mgbdCreateListsTasks(listToSave, (error, res) => {
            if (error) {
              this._logError(null, JOB_CREATE_LIST, error.toString());
            }
            this._dbManager.lists.addLists(res);
          });
        } catch (error) {
          this._logError(null, JOB_CREATE_LIST, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_CREATE_LIST);
        },
      },
    );
  };

  _initCreateCardWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_CREATE_CARD,
      async (jobId, cardToSave) => {
        try {
          await this._taskManager.provider.mgbdCreateCardTasks(cardToSave, (error, res) => {
            if (error) {
              this._logError(null, JOB_CREATE_CARD, error.toString());
            }
            this._dbManager.card.addUserTasks(res);
          });
        } catch (error) {
          this._logError(null, JOB_CREATE_CARD, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_CREATE_CARD);
        },
      },
    );
  };

  _initCreateChecklistWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_CREATE_CHECKLIST,
      async (jobId, checklistToSave) => {
        try {
          await this._taskManager.provider.mgbdCreateChecklistTasks(
            checklistToSave,
            (error, res) => {
              if (error) {
                this._logError(null, JOB_CREATE_CHECKLIST, error.toString());
              }
              this._dbManager.checklists.addChecklist(res);
            },
          );
        } catch (error) {
          this._logError(null, JOB_CREATE_CHECKLIST, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_CREATE_CHECKLIST);
        },
      },
    );
  };

  _initCreateChecklistItemWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_CREATE_CHECKLISTITEM,
      async (jobId, checklistItemToSave) => {
        try {
          await this._taskManager.provider.mgbdCreateChecklistItemTasks(
            checklistItemToSave,
            (error, res) => {
              if (error) {
                this._logError(null, JOB_CREATE_CHECKLISTITEM, error.toString());
              }
              this._dbManager.checklists.addCheckListItems(res);
            },
          );
        } catch (error) {
          this._logError(null, JOB_CREATE_CHECKLISTITEM, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_CREATE_CHECKLISTITEM);
        },
      },
    );
  };

  _initCreateCommentWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_CREATE_COMMENT,
      async (jobId, commentToSave) => {
        try {
          await this._taskManager.provider.mgbdCreateCommentTasks(commentToSave, (error, res) => {
            if (error) {
              this._logError(null, JOB_CREATE_COMMENT, error.toString());
            }
            this._dbManager.cardComments.addCardComments(res);
          });
        } catch (error) {
          this._logError(null, JOB_CREATE_COMMENT, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_CREATE_COMMENT);
        },
      },
    );
  };

  _initUpdateListWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_UPDATE_LIST,
      async (jobId, listUpdate) => {
        try {
          await this._taskManager.provider.mgbdUpdateListTasks(listUpdate, (error, res) => {
            if (error) {
              this._logError(null, JOB_UPDATE_LIST, error.toString());
            }
            this._dbManager.lists.addLists(res);
          });
        } catch (error) {
          this._logError(null, JOB_UPDATE_LIST, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_UPDATE_LIST);
        },
      },
    );
  };

  _initUpdateCardWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_UPDATE_CARD,
      async (jobId, cardUpdate) => {
        try {
          await this._taskManager.provider.mgbdUpdateCardTasks(cardUpdate, (error, res) => {
            if (error) {
              this._logError(null, JOB_UPDATE_CARD, error.toString());
            }
            this._dbManager.card.addUserTasks(res);
          });
        } catch (error) {
          this._logError(null, JOB_UPDATE_CARD, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_UPDATE_CARD);
        },
      },
    );
  };

  _initUpdateChecklistWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_UPDATE_CHECKLIST,
      async (jobId, checklistUpdate) => {
        try {
          await this._taskManager.provider.mgbdUpdateChecklistTasks(
            checklistUpdate,
            (error, res) => {
              if (error) {
                this._logError(null, JOB_UPDATE_CHECKLIST, error.toString());
              }
              this._dbManager.checklists.addChecklist(res);
            },
          );
        } catch (error) {
          this._logError(null, JOB_UPDATE_CHECKLIST, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_UPDATE_CHECKLIST);
        },
      },
    );
  };

  _initUpdateChecklistItemWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_UPDATE_CHECKLISTITEM,
      async (jobId, checklistItemUpdate) => {
        try {
          await this._taskManager.provider.mgbdUpdateChecklistItemTasks(
            checklistItemUpdate,
            (error, res) => {
              if (error) {
                this._logError(null, JOB_UPDATE_CHECKLISTITEM, error.toString());
              }
              this._dbManager.checklists.addCheckListItems(res);
            },
          );
        } catch (error) {
          this._logError(null, JOB_UPDATE_CHECKLISTITEM, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_UPDATE_CHECKLISTITEM);
        },
      },
    );
  };

  _initDeleteListWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_DELETE_LIST,
      async (jobId, listDelete) => {
        try {
          await this._taskManager.provider.mgbdDeleteListsTasks(listDelete, (error, res) => {
            if (error) {
              this._logError(null, JOB_DELETE_LIST, error.toString());
            }
            this._dbManager.lists.deleteList(res);
            this._dbManager.card.deleteListCard(res);
          });
        } catch (error) {
          this._logError(null, JOB_DELETE_LIST, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_DELETE_LIST);
        },
      },
    );
  };

  _initDeleteCardWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_DELETE_CARD,
      async (jobId, cardDelete) => {
        try {
          await this._taskManager.provider.mgbdDeleteCardTasks(cardDelete, (error, res) => {
            if (error) {
              this._logError(null, JOB_DELETE_CARD, error.toString());
            }
            this._dbManager.card.deleteCard(res);
          });
        } catch (error) {
          this._logError(null, JOB_DELETE_CARD, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_DELETE_CARD);
        },
      },
    );
  };

  _initDeleteChecklistWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_DELETE_CHECKLIST,
      async (jobId, checklistDelete) => {
        try {
          await this._taskManager.provider.mgbdDeleteChecklistTasks(
            checklistDelete,
            (error, res) => {
              if (error) {
                this._logError(null, JOB_DELETE_CHECKLIST, error.toString());
              }
              this._dbManager.checklists.deleteChecklist(res);
            },
          );
        } catch (error) {
          this._logError(null, JOB_DELETE_CHECKLIST, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_DELETE_CHECKLIST);
        },
      },
    );
  };

  _initDeleteChecklistItemWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_DELETE_CHECKLISTITEM,
      async (jobId, checklistItemDelete) => {
        try {
          await this._taskManager.provider.mgbdDeleteChecklistItemTasks(
            checklistItemDelete,
            (error, res) => {
              if (error) {
                this._logError(null, JOB_DELETE_CHECKLISTITEM, error.toString());
              }
              this._dbManager.checklists.deleteCheckListItems(res);
            },
          );
        } catch (error) {
          this._logError(null, JOB_DELETE_CHECKLISTITEM, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_DELETE_CHECKLISTITEM);
        },
      },
    );
  };

  _initDeleteCommentWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_DELETE_COMMENT,
      async (jobId, commentDelete) => {
        try {
          await this._taskManager.provider.mgbdDeleteCommentTasks(commentDelete, (error, res) => {
            if (error) {
              this._logError(null, JOB_DELETE_COMMENT, error.toString());
            }
            this._dbManager.cardComments.deleteComment(res);
          });
        } catch (error) {
          this._logError(null, JOB_DELETE_COMMENT, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_DELETE_COMMENT);
        },
      },
    );
  };

  _initFetchURL = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_URL,
      async (jobId, fetchDetails) => {
        try {
          // { cardId, url }
          await this._taskManager.provider.fetchURL(fetchDetails.url, (error, res) => {
            if (error) {
              this._logError(null, JOB_FETCH_URL, error.toString());
            }
            this._dbManager.card.updateJsonOrHtmlData(fetchDetails.cardId, fetchDetails.url, res);
          });
        } catch (error) {
          this._logError(null, JOB_FETCH_URL, error.toString());
        }
      },
      {
        concurrency: 1,
        onFailed: () => {
          this._logError(599, JOB_FETCH_URL);
        },
      },
    );
  };

  /* eslint-disable */
  _initFetchBoardWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_BOARD,
      async (jobId, groupData) => {
        const groupName = groupData.groupName;
        const groupId = groupData.groupID;
        this._taskManager.provider.mgbdGetBoardDetails(groupName, (error, res) => {
          if (!error) {
            let bdId;
            if (res._id) {
              this._dbManager.board.addBoard(res);
            } else {
              this._taskManager.provider.mgbdGetBoard(groupId, (error, res) => {
                const reFetch = {
                  groupName: groupName,
                  boardId: res,
                };
                if (!error) {
                  this.fetchBoard(reFetch);
                }
              });
            }
          }
        });
      },
      {
        concurrency: 1,
        onSuccess: (jobId, arg) => {
          // AppUtil.debug(`BoardTaskManager _initFetchBoardWorker onSuccess id ${jobId}`, MODULE);
        },
        onFailed: (jobId, err) => {
          // AppUtil.debug(
          //   `BoardTaskManager _initFetchBoardWorker onFailed id ${jobId} arg ${JSON.stringify(
          //     err,
          //   )}`,
          //   MODULE,
          // );
          this._logError('Connect Failed', JOB_FETCH_BOARD);
        },
      },
    );
  };

  _initFetchBoardListsWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_LISTS,
      async (jobId, boardName) => {
        this._taskManager.provider.mgbdGetList(boardName, (error, res) => {
          if (!error) {
            let bdId;
            res.forEach((bdList) => {
              if (bdList && bdList._id) {
                if (!bdId) {
                  bdId = bdList.boardId;
                }
                this._dbManager.lists.addLists(bdList);
                this.fetchCards(bdList._id);
              }
            });
          }
        });
      },
      {
        concurrency: 5,
        onSuccess: (jobId, arg) => {
          // AppUtil.debug(`BoardTaskManager _initFetchBoardWorker onSuccess id ${jobId}`, MODULE);
        },
        onFailed: (jobId, err) => {
          // AppUtil.debug(
          //   `BoardTaskManager _initFetchBoardWorker onFailed id ${jobId} arg ${JSON.stringify(err)}`,
          //   MODULE,
          // );
          this._logError('Connect Failed', JOB_FETCH_LISTS);
        },
      },
    );
  };

  _initFetchCardsWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_CARDS,
      async (jobId, listId) => {
        await this._taskManager.provider.mgbdGetCardList(listId, (error, res) => {
          if (!error) {
            if (res.length > 0) {
              res.forEach((cardList) => {
                if (cardList && cardList._id) {
                  this._dbManager.card.addCards(cardList);
                  this.fetchCheckList(cardList._id);
                  this.fetchCardComments(cardList._id);
                }
              });
            }
          }
        });
      },
      {
        concurrency: 5,
        onSuccess: (jobId, arg) => {
          // AppUtil.debug(`BoardTaskManager _initFetchBoardWorker onSuccess id ${jobId}`, MODULE);
        },
        onFailed: (jobId, err) => {
          // AppUtil.debug(
          //   `BoardTaskManager _initFetchBoardWorker onFailed id ${jobId} arg ${JSON.stringify(err)}`,
          //   MODULE,
          // );
          this._logError('Connect Failed', JOB_FETCH_CARDS);
        },
      },
    );
  };

  _initFetchCheckListsWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_CHECK_LISTS,
      async (jobId, cardId) => {
        this._taskManager.provider.mgbdGetChecklists(cardId, (error, res) => {
          if (!error) {
            if (res.length > 0) {
              res.forEach((checkList) => {
                this._dbManager.checklists.addChecklist(checkList);
                this.fetchCheckListItems(checkList._id);
              });
            }
          }
        });
      },
      {
        concurrency: 5,
        onSuccess: (jobId, arg) => {
          // AppUtil.debug(`BoardTaskManager _initFetchBoardWorker onSuccess id ${jobId}`, MODULE);
        },
        onFailed: (jobId, err) => {
          // AppUtil.debug(
          //   `BoardTaskManager _initFetchBoardWorker onFailed id ${jobId} arg ${JSON.stringify(err)}`,
          //   MODULE,
          // );
          this._logError('Connect Failed', JOB_FETCH_CHECK_LISTS);
        },
      },
    );
  };

  _initFetchCardCommentsWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_CARD_COMMENTS,
      async (jobId, cardId) => {
        this._taskManager.provider.mgbdGetCardComments(cardId, (error, res) => {
          if (!error) {
            res.forEach((comments) => {
              if (comments && comments._id) {
                this._dbManager.cardComments.addCardComments(comments);
                // this.mgbdGetCardComments(cardList._id, cb);
                // this.mgbdGetChecklists(cardList._id, cb);
              }
            });
          }
        });
      },
      {
        concurrency: 5,
        onSuccess: (jobId, arg) => {
          // AppUtil.debug(`BoardTaskManager _initFetchBoardWorker onSuccess id ${jobId}`, MODULE);
        },
        onFailed: (jobId, err) => {
          // AppUtil.debug(
          //   `BoardTaskManager _initFetchBoardWorker onFailed id ${jobId} arg ${JSON.stringify(err)}`,
          //   MODULE,
          // );
          this._logError('Connect Failed', JOB_FETCH_CARD_COMMENTS);
        },
      },
    );
  };
  /* eslint-disable */
  _initFetchCheckListItemsWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_FETCH_CHECK_LIST_ITEMS,
      async (jobId, checkListId) => {
        this._taskManager.provider.mgbdGetChecklistItems(checkListId, (error, res) => {
          if (!error) {
            res.forEach((checkListItems) => {
              console.log('====Ezhil CHECKLIST Items====', checkListItems.title);

              this._dbManager.checklists.addCheckListItems(checkListItems);
              // this.mgbdGetCardComments(cardList._id, cb);
              // this.mgbdGetChecklists(cardList._id, cb);
            });
          }
        });
      },
      {
        concurrency: 5,
        onSuccess: (jobId, arg) => {
          AppUtil.debug(`BoardTaskManager _initFetchBoardWorker onSuccess id ${jobId}`, MODULE);
        },
        onFailed: (jobId, err) => {
          AppUtil.debug(
            `BoardTaskManager _initFetchBoardWorker onFailed id ${jobId} arg ${JSON.stringify(
              err,
            )}`,
            MODULE,
          );
          this._logError('Connect Failed', JOB_FETCH_CHECK_LIST_ITEMS);
        },
      },
    );
  };
  // #endregion

  // #region Public Method(s)
  // fetchAllBoardDetails = (roomName) => {
  //   this._taskManager.createJob(JOB_FETCH_BOARD, roomName, 1);
  // };

  fetchUserTasks = (userId) => {
    this._taskManager.createJob(JOB_FETCH_USER_TASKS, userId);
  };

  fetchBoardTasks = (boardName) => {
    this._taskManager.createJob(JOB_FETCH_BOARD_TASKS, boardName);
  };

  fetchBoardListTasks = (boardId) => {
    this._taskManager.createJob(JOB_FETCH_BOARD_LIST_TASKS, boardId);
  };

  fetchBoardSwimline = (cardToSave) => {
    this._taskManager.createJob(JOB_FETCH_BOARD_SWIMLANE, cardToSave);
  };

  fetchCheckListTask = (fetchChecklist) => {
    this._taskManager.createJob(JOB_FETCH_CHECKLIST_TASKS, fetchChecklist);
  };

  fetchCheckListItemTask = (fetchChecklistItem) => {
    this._taskManager.createJob(JOB_FETCH_CHECKLISTITEM_TASKS, fetchChecklistItem);
  };

  fetchCommentTask = (fetchComment) => {
    this._taskManager.createJob(JOB_FETCH_COMMENTS_TASKS, fetchComment);
  };

  createList = (listToSave) => {
    this._taskManager.createJob(JOB_CREATE_LIST, listToSave);
  };

  createCard = (cardToSave) => {
    this._taskManager.createJob(JOB_CREATE_CARD, cardToSave);
  };

  createChecklist = (checklistToSave) => {
    this._taskManager.createJob(JOB_CREATE_CHECKLIST, checklistToSave);
  };

  createChecklistItem = (checklistItemToSave) => {
    this._taskManager.createJob(JOB_CREATE_CHECKLISTITEM, checklistItemToSave);
  };

  createComment = (commentToSave) => {
    this._taskManager.createJob(JOB_CREATE_COMMENT, commentToSave);
  };

  updateList = (listUpdate) => {
    this._taskManager.createJob(JOB_UPDATE_LIST, listUpdate);
  };

  updateCard = (cardUpdate) => {
    this._taskManager.createJob(JOB_UPDATE_CARD, cardUpdate);
  };

  updateChecklist = (checklistUpdate) => {
    this._taskManager.createJob(JOB_UPDATE_CHECKLIST, checklistUpdate);
  };

  updateChecklistItem = (checklistItemUpdate) => {
    this._taskManager.createJob(JOB_UPDATE_CHECKLISTITEM, checklistItemUpdate);
  };

  deleteList = (listDelete) => {
    this._taskManager.createJob(JOB_DELETE_LIST, listDelete);
  };

  deleteCard = (cardDelete) => {
    this._taskManager.createJob(JOB_DELETE_CARD, cardDelete);
  };

  deleteChecklist = (checklistDelete) => {
    this._taskManager.createJob(JOB_DELETE_CHECKLIST, checklistDelete);
  };

  deleteChecklistItem = (checklistItemDelete) => {
    this._taskManager.createJob(JOB_DELETE_CHECKLISTITEM, checklistItemDelete);
  };

  deleteComment = (commentDelete) => {
    this._taskManager.createJob(JOB_DELETE_COMMENT, commentDelete);
  };

  fetchBoard = (groupData) => {
    this._taskManager.createJob(JOB_FETCH_BOARD, groupData, 1);
  };

  fetchBoardLists = (boardName) => {
    this._taskManager.createJob(JOB_FETCH_LISTS, boardName, 1);
  };

  fetchCards = (listId) => {
    this._taskManager.createJob(JOB_FETCH_CARDS, listId, 1);
  };

  fetchCheckList = (cardId) => {
    this._taskManager.createJob(JOB_FETCH_CHECK_LISTS, cardId, 1);
  };

  fetchCardComments = (cardId) => {
    this._taskManager.createJob(JOB_FETCH_CARD_COMMENTS, cardId, 1);
  };

  fetchURL(cardId, url) {
    this._taskManager.createJob(JOB_FETCH_URL, { cardId, url }, 1);
  }

  fetchCheckListItems(checkListID) {
    this._taskManager.createJob(JOB_FETCH_CHECK_LIST_ITEMS, checkListID, 1);
  }

  verifyCerts = (jsonData, callback) => {
    this._taskManager.provider.verifyCerts(jsonData, callback);
  };

  // #endregion

  // #region Common Method(s)
  _logError = (errDesc, action) => {
    const errObj = {
      _id: AppUtil.createGuid(),
      desc: errDesc || 'description not found',
      code: '701',
      action: action || 'false',
    };
    this._dbManager.app.logError(errObj);
  };
}
