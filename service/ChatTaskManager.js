import AppUtil from '@mongrov/utils';
import ChatService from './ChatService';
import { Application } from '@mongrov/config';
import Constants from '../model/constants';

// const JOB_CHAT = 'ChatList';
const MODULE = 'ChatTaskHandler';
// const JOB_FETCH_USER = 'User';
// const JOB_FETCH_MESSAGE = 'FetchMessage';
// const PUTMESSAGEJOBNAME = 'PutMessage';
// const PUTUSERJOBNAME = 'PutUser';
// const FETCH_GROUP_MIN_MSGS = 10;
const { FETCH_CURRENT_GROUP_MIN_MSGS } = Application;
// const JOB_GET_IMAGE_URL = 'getImageURL';
const {
  JOB_CHAT,
  // JOB_FETCH_USER,
  JOB_FETCH_MESSAGE,
  JOB_SEND_MESSAGE,
  JOB_SEND_TYPING_NOTIFICATION,
  JOB_UPLOAD_FILE,
  JOB_FETCH_CURRENT_ROOM_MESSAGE,
  JOB_SEND_UNDELIVERED_MESSAGE,
  JOB_DELETE_MESSAGE,
  JOB_SEARCH_GROUP,
  JOB_GET_IMAGE_URL,
  JOB_DELETE_OFFLINE_MESSAGE,
  JOB_SEND_READ_NOTIFICATION,
  JOB_LIKE_MESSAGE,
  JOB_FETCH_BACKGROUND_GROUP,
  JOB_FETCH_BACKGROUND_MESSAGE,
} = Application.JOBNAME;

export default class ChatTaskManager {
  constructor(taskManager, dbManager) {
    if (taskManager && dbManager) {
      this._taskManager = taskManager;
      this._dbManager = dbManager;
      this._appManager = this._dbManager.app;
      this._groupManager = this._dbManager.group;
      this._userManager = this._dbManager.user;
      this._provider = this._taskManager.provider;
      this._chatService = new ChatService(this._provider, this._groupManager, this);
      this.initChatTaskHandler();
      this._provider.monitorOnLogin(this.fetchChatListJob);
      this._sendingUndelivered = {};
      this._sendingDeleted = {};
      this._fetchChatListInProgress = false;
      this.subscribetoUserChange = false;
      this._fetchBackgroundGroups = false;
    }
  }

  initChatTaskHandler = async () => {
    this.initWorker(JOB_CHAT, 1, this.getChatList);
    this.initWorker(JOB_FETCH_MESSAGE, 10, this._getMessage);
    this.initFileUploadWorker();
    this.initSendUndeliveredWorker();
    this.initWorker(JOB_FETCH_CURRENT_ROOM_MESSAGE, 5, this._loadEarlierMessageWorker);
    // this.initWorker(PUTMESSAGEJOBNAME, 10, this.addMessage);
    this.initWorker(JOB_SEND_MESSAGE, 10, this._sendUserMessage);
    // this.initWorker(JOB_SEND_UNDELIVERED_MESSAGE, 1, this._sendUndelivered);
    this.initWorker(JOB_SEND_TYPING_NOTIFICATION, 1, this._sendTypingNotification);
    this.initWorker(JOB_DELETE_MESSAGE, 1, this._deleteMessage);
    this.initWorker(JOB_DELETE_OFFLINE_MESSAGE, 1, this._deleteOfflineMessage);
    // this.initSendUndeliveredWorker();
    this.initWorker(JOB_SEARCH_GROUP, 10, this.searchUserOrGroup);
    this.initWorker(JOB_SEND_READ_NOTIFICATION, 1, this.setGroupMessagesAsRead);
    this.initWorker(JOB_LIKE_MESSAGE, 5, this._setLike);
    this.initWorker(JOB_FETCH_BACKGROUND_GROUP, 1, this._getBackgroundGroups);
    this.initWorker(JOB_FETCH_BACKGROUND_MESSAGE, 10, this._getBackgroundMessages);
    // this.initWorker(PUTUSERJOBNAME, 10, this.addUser);
    // this.initWorker(JOB_FETCH_USER, 1, this.getUser);
  };

  initWorker = (jobName, concurrency, onSuccess) => {
    this._taskManager.queue.addWorker(
      jobName,
      async (jobid, ...arg) => {
        // AppUtil.debug(`initChatTaskHandler initWorker id ${id} arg ${JSON.stringify(arg)}`, MODULE);
        onSuccess(arg);
      },
      {
        concurrency,
        // onSuccess: (id, arg) => onSuccess(arg),
      },
    );
  };

  initFileUploadWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_UPLOAD_FILE,
      async (jobid, ...arg) => {
        // AppUtil.debug(`initChatTaskHandler initWorker id ${id} arg ${JSON.stringify(arg)}`, MODULE);
        this.uploadMedia(arg);
      },
      {
        concurrency: 1,
      },
    );
  };

  initSendUndeliveredWorker = () => {
    this._taskManager.queue.addWorker(
      JOB_SEND_UNDELIVERED_MESSAGE,
      async (jobid, ...arg) => {
        // AppUtil.debug(`initChatTaskHandler initWorker id ${id} arg ${JSON.stringify(arg)}`, MODULE);
        this._sendUndelivered(arg);
      },
      {
        concurrency: 1,
        // onSuccess: (id, arg) => onSuccess(arg),
      },
    );
  };

  fetchChatListJob = async () => {
    const loggedUser = this._userManager.loggedInUser;
    if (!loggedUser) {
      this._userManager.setAllUserOffline();
      await this._provider.subscribeToUserChanges(this._userManager.setUserStatus);
      this.subscribetoUserChange = true;
      this._fetchChatListInProgress = true;
      this._taskManager.queue.createJob(JOB_CHAT, {});
    } else if (loggedUser && !this._fetchChatListInProgress) {
      this._fetchChatListInProgress = true;
      this._taskManager.queue.createJob(JOB_CHAT, {});
    }
  };

  fetchMessageJob = (group) => {
    this._taskManager.queue.createJob(JOB_FETCH_MESSAGE, group);
  };

  _loadEarlierMessageJob = (group) => {
    this._taskManager.queue.createJob(JOB_FETCH_CURRENT_ROOM_MESSAGE, group);
  };

  // mar - where is the corresponding worker?
  getImageUrl = (link, msgId) => {
    const msg = {
      link,
      msgId,
    };
    this._taskManager.queue.createJob(JOB_GET_IMAGE_URL, msg);
  };

  uploadMediaJob = (data, rid, isImage, desc) => {
    const args = { data, rid, isImage, desc };
    this._taskManager.queue.createJob(JOB_UPLOAD_FILE, args);
  };

  // fetchUserJob = () => {
  //   TaskManager.createJob(JOB_FETCH_USER, {});
  // };

  sendMessageJob = (groupId, message) => {
    this._taskManager.queue.createJob(JOB_SEND_MESSAGE, {
      thread: false,
      groupId,
      message,
    });
  };

  sendThreadedMessageJob = (groupObj, replyMsgId, message) => {
    this._taskManager.queue.createJob(JOB_SEND_MESSAGE, {
      thread: true,
      groupObj,
      replyMsgId,
      message,
    });
  };

  // sendUndeliveredMessageJob = (messageObj, isLast) => {
  //   this._taskManager.queue.createJob(JOB_SEND_UNDELIVERED_MESSAGE, {
  //     messageObj,
  //     isLast,
  //   });
  // };

  sendUndeliveredMessageJob = (messages, group) => {
    this._taskManager.queue.createJob(JOB_SEND_UNDELIVERED_MESSAGE, {
      messages,
      group,
    });
  };

  handleDeletedOfflineMessageJob = (messageObj, isLast) => {
    this._taskManager.queue.createJob(JOB_DELETE_OFFLINE_MESSAGE, {
      messageObj,
      isLast,
    });
  };

  sendTypingNotificationJob = (groupId, user, flag) => {
    this._taskManager.queue.createJob(JOB_SEND_TYPING_NOTIFICATION, { groupId, user, flag });
  };

  deleteMessageJob = (groupId, messageId) => {
    this._taskManager.queue.createJob(JOB_DELETE_MESSAGE, { _id: messageId, group: groupId });
  };

  searchGroupJob = (searchKey) => {
    this._taskManager.queue.createJob(JOB_SEARCH_GROUP, searchKey);
  };

  sendReadStatusJob = (groupId) => {
    this._taskManager.queue.createJob(JOB_SEND_READ_NOTIFICATION, groupId);
  };

  setLikeOnMessage = (messageId) => {
    this._taskManager.queue.createJob(JOB_LIKE_MESSAGE, messageId);
  };

  fetchBackgroundGroupJob = () => {
    this._taskManager.queue.createJob(JOB_FETCH_BACKGROUND_GROUP);
  };

  fetchBackgroundMessageJob = (group) => {
    this._taskManager.queue.createJob(JOB_FETCH_BACKGROUND_MESSAGE, group);
  };

  uploadMedia = async (args) => {
    try {
      const { app } = this._appManager;
      const mediaMessage = this._groupManager.buildFileMessage(args[0]);
      this._groupManager.addMessageToRealmOnly(mediaMessage);

      const maxFileSize =
        this._appManager.getSettingsValue('FileUpload_MaxFileSize').value || '52428800';
      const message = { _id: mediaMessage._id };
      const _args = { ...args[0], maxFileSize, message };

      if (app.isServiceConnected) {
        await this._provider.uploadFile(_args, this._groupManager);
      }
    } catch (error) {
      AppUtil.debug(`ERROR IN UPLOAD FILE ${error},uploadMedia`, MODULE);
    }
  };

  getChatList = async () => {
    try {
      const userobj = this._userManager.loggedInUser;
      const { lastSync } = this._appManager.app;
      const groupList = await this._provider.fetchChannels(userobj, lastSync);
      await this._groupManager.addAll(groupList);
      const groupListLocal = this._groupManager.sortedList;
      this.chatListLength = Object.keys(groupListLocal).length;
      Object.keys(groupListLocal).forEach(async (index) => {
        try {
          this.fetchMessageJob(groupListLocal[index]);
        } catch (error) {
          AppUtil.debug(`ERROR IN ADDING MESSAGE ${error},getChatList`, MODULE);
        }
      });
    } catch (error) {
      AppUtil.debug(`ERROR IN GET CHAT LIST MESSAGE ${error}`);
      const errObj = {
        _id: JOB_CHAT,
        desc: error.toString(),
        code: '301',
      };
      this._appManager.logError(errObj);
    }
  };

  loadEarlierMessage = (groupId) => {
    if (groupId) {
      const group = this._groupManager.findById(groupId);
      this._loadEarlierMessageJob(group);
    }
  };

  _loadEarlierMessageWorker = async (arg) => {
    let groupObj, roomInfo, msg;
    try {
      const FirstMessage = await this._groupManager.getFirstMessage(arg[0]._id);
      if (FirstMessage && FirstMessage.group) {
        roomInfo = {
          rid: FirstMessage.group,
          createdAt: FirstMessage.createdAt,
          numberOfMessage: FETCH_CURRENT_GROUP_MIN_MSGS,
        };
        msg = await this._provider.fetchOldMessages(roomInfo);
      } else {
        // no messages in a group
        roomInfo = {
          rid: arg[0]._id,
          createdAt: null,
          numberOfMessage: FETCH_CURRENT_GROUP_MIN_MSGS,
        };
        msg = await this._provider.fetchCurrentRoomMessages(roomInfo);
      }

      if (msg && msg.messages.length > 0) {
        groupObj = await this._groupManager.addEarlierMessage(msg.messages);
      } else {
        // no more messages on a server
        this._groupManager.updateNoMoreMessages(roomInfo.rid);
      }

      return groupObj;
    } catch (error) {
      const errObj = {
        _id: JOB_FETCH_MESSAGE,
        desc: error.toString() || 'Fetch Channel Failed',
        code: '301',
      };
      this._appManager.logError(errObj);
    }
  };

  _getMessage = async (arg) => {
    //  const groupId = arg[0];
    let groupObj;
    try {
      const [{ _id }] = arg;
      const lastMessage = await this._groupManager.getLastMessage(arg[0]._id);
      const lastMessageAt = lastMessage ? lastMessage.createdAt : null;
      const roomInfo = {
        rid: _id,
        lastMessageAt,
        numberOfMessage: FETCH_CURRENT_GROUP_MIN_MSGS,
      };
      const msg = await this._provider.fetchCurrentRoomMessages(roomInfo);
      // const msg = await this._provider.fetchMessages(arg, FETCH_GROUP_MIN_MSGS);
      if (!lastMessageAt) {
        // if (msg && msg.messages) {
        if (msg && msg.messages.length > 0) {
          groupObj = await this._groupManager.addBulkMessages(msg.messages);
        }
        // else {
        //   // no messages in a group
        //   this._groupManager.updateNoMoreMessages(roomInfo.rid);
        // }
        this.chatListLength -= 1;
        this._chatListMessageSubscribtion(roomInfo.rid);
      } else if (msg && lastMessageAt) {
        groupObj = await this._groupManager.addBulkMessages(msg);
        this.chatListLength -= 1;
        this._chatListMessageSubscribtion(roomInfo.rid);
      }

      await this._sendUndeliveredGroupMessages(_id);
      this._handleDeletedOfflineGroupMessages(_id);
      return groupObj;
    } catch (error) {
      const errObj = {
        _id: JOB_FETCH_MESSAGE,
        desc: error.toString() || 'Fetch Channel Failed',
        code: '301',
      };
      this._appManager.logError(errObj);
    }
  };

  _chatListMessageSubscribtion = async (groupid) => {
    try {
      await this._provider.subscribeToGroup(groupid);
      if (this.chatListLength === 0) {
        this._provider.monitorStreamRoom(this._chatService);
        await this._taskManager.provider.initUserSubscriptions(
          this,
          this._userManager.loggedInUserId,
        );
        await this._provider.subscibToChatListChanges(this._chatService);
        if (this.subscribetoUserChange === false) {
          this._userManager.setAllUserOffline();
          setTimeout(() => {
            this._provider.subscribeToUserChanges(this._userManager.setUserStatus);
          }, 10000);
        }
        this._fetchChatListInProgress = false;
      }
    } catch (error) {
      AppUtil.debug(`ERROR IN GET CHAT LIST MESSAGE SUBSCRIPTION ${error}`, MODULE);
    }
  };

  _sendTypingNotification = async (args) => {
    const [{ groupId, user, flag = true }] = args;
    const { username } = user;
    try {
      await this._provider.notifyRoomAboutTyping(groupId, username, flag);
    } catch (error) {
      AppUtil.debug(`ERROR IN SENDING TYPING NOTIFICATION ${error}`, MODULE);
    }
  };

  _deleteMessage = async (args) => {
    const { _id, group } = args[0];
    const { app } = this._appManager;

    // console.log('MESSAGE TO BE DELETED', _id, group);
    this._groupManager.setMessageDeleted(_id, group);
    if (app.isServiceConnected) {
      try {
        await this._provider.deleteMessage(_id);
      } catch (error) {
        AppUtil.debug(`METEOR ERROR IN DELETE MESSAGE ${error}`, MODULE);
        // console.log(`METEOR ERROR IN DELETE MESSAGE ${JSON.stringify(error)}`, MODULE);
      }
    }
  };

  _deleteOfflineMessage = async (args) => {
    const { messageObj, isLast } = args[0];
    const { _id, group } = messageObj;
    const { app } = this._appManager;

    // re-check user permissions in group
    const canDeleteMessage = await this._chatService.canDeleteMessageFromGroup(group);
    // console.log('Can delete message', canDeleteMessage);

    if (canDeleteMessage && app.isServiceConnected) {
      // console.log('MESSAGE TO BE DELETED', _id, group);
      try {
        await this._provider.deleteMessage(_id);
      } catch (error) {
        AppUtil.debug(`METEOR ERROR IN DELETE MESSAGE ${error}`, MODULE);
        // console.log(`METEOR ERROR IN DELETE MESSAGE ${JSON.stringify(error)}`, MODULE);
      } finally {
        if (isLast) {
          this._sendingDeleted[group] = false;
        }
      }
    } else {
      this._sendingDeleted[group] = false;
    }
  };

  // callback for a worker - marina
  _sendUserMessage = (argsObj) => {
    const [{ thread, ...rest }] = argsObj;
    if (thread) {
      this._sendThreadedMessage(rest);
      return;
    }
    this._sendMessage(rest);
  };

  _sendMessage = async (args) => {
    const { app } = this._appManager;
    const msgObj = this._groupManager.buildTextMessage(args);
    this._groupManager.addMessageToRealmOnly(msgObj);
    const unEmojMsg = this._groupManager.unemojifyMessageText(msgObj.text);

    if (app.isServiceConnected) {
      try {
        await this._provider.sendMessage({ _id: msgObj._id, rid: msgObj.group, msg: unEmojMsg });
        // this._groupManager.setMessageDelivered(_id);
      } catch (error) {
        AppUtil.debug(`METEOR ERROR IN SEND MESSAGE ${error}`, MODULE);
        this._appManager.logError(error);
      }
    }
  };

  _sendThreadedMessage = async (args) => {
    const { app } = this._appManager;
    const serverURL = app.host;
    const msgObj = this._groupManager.buildThreadedMessage(args);
    this._groupManager.addMessageToRealmOnly(msgObj);
    const replyMessageText = this._groupManager.buildReplyTemplate({ ...args, serverURL });
    const unEmojMsg = this._groupManager.unemojifyMessageText(replyMessageText);

    if (app.isServiceConnected) {
      try {
        await this._provider.sendMessage({ _id: msgObj._id, rid: msgObj.group, msg: unEmojMsg });
        // this._groupManager.setMessageDelivered(_id);
      } catch (error) {
        AppUtil.debug(`ERROR IN SENDING A THREADED MESSAGE ${error}`, MODULE);
        this._appManager.logError(error);
      }
    }
  };

  // _sendUndelivered = async (args) => {
  //   const { messageObj } = args[0];
  //   console.log(`STARTED JOB FOR MESSAGE ${messageObj._id}, ${messageObj.text}`)
  //   let result;
  //   if (messageObj.type === Constants.M_TYPE_TEXT) {
  //     result = await this._sendUndeliveredText(args);
  //   } else {
  //     result = await this._sendUndeliveredFile(args);
  //   }
  //   console.log(`JOB RESULT FOR MESSAGE ${messageObj._id}, ${messageObj.text}`, result);
  //   return result;
  // };

  _sendUndelivered = async (args) => {
    const { messages, group } = args[0];
    const msgLength = messages.length;
    // console.log('RECURSION LEVEL', msgLength);
    if (msgLength === 0) {
      this._sendingUndelivered[group] = false;
      return;
    }
    const message = messages[0];
    // console.log(`STARTED JOB FOR MESSAGE ${message._id}, ${message.text}`);

    // let result;
    if (message.type === Constants.M_TYPE_TEXT) {
      // result = await this._sendUndeliveredText(message);
      await this._sendUndeliveredText(message);
    } else {
      // result = await this._sendUndeliveredFile(message);
      await this._sendUndeliveredFile(message);
    }
    // console.log(`JOB RESULT FOR MESSAGE ${message._id}, ${message.text}`, result);
    return this.sendUndeliveredMessageJob(messages.slice(1), group);
  };

  _sendUndeliveredText = async (message) => {
    const { _id, group, text, isReply, replyMessageId } = message;
    const { app } = this._appManager;
    let unEmojMsg;
    if (isReply && replyMessageId) {
      const serverURL = app.host;
      const groupObj = this._groupManager.findById(group);
      const replyMessageText = this._groupManager.buildReplyTemplate({
        groupObj,
        replyMsgId: replyMessageId,
        message,
        serverURL,
      });
      unEmojMsg = this._groupManager.unemojifyMessageText(replyMessageText);
    } else {
      unEmojMsg = this._groupManager.unemojifyMessageText(text);
    }
    let result = false;

    if (app.isServiceConnected) {
      // console.log('SENDING MESSAGE--------', _id, group, text);
      try {
        await this._provider.sendMessage({ _id, rid: group, msg: unEmojMsg });
        result = true;
      } catch (error) {
        AppUtil.debug(`METEOR ERROR IN SEND MESSAGE ${error}`, MODULE);
        this._appManager.logError(error);
        if (error.error.toString() === '500') {
          this._groupManager.setMessageDelivered(_id);
        }
      }
    }
    return result;
  };

  _sendUndeliveredFile = async (message) => {
    const { app } = this._appManager;
    const { _id, group, type, image, remoteFile, text } = message;
    const maxFileSize =
      this._appManager.getSettingsValue('FileUpload_MaxFileSize').value || '52428800';
    const isImage = type === Constants.M_TYPE_IMAGE;
    const uri = isImage ? image : remoteFile;

    let fileDesc;
    if (type === Constants.M_TYPE_IMAGE) {
      fileDesc = text;
    } else if (type === Constants.M_TYPE_AUDIO) {
      fileDesc = 'Audio Message';
    } else if (type === Constants.M_TYPE_VIDEO) {
      fileDesc = 'Video Message';
    }

    const _args = {
      data: { uri },
      rid: group,
      isImage,
      desc: fileDesc,
      maxFileSize,
      message: { _id, text: '' },
    };
    let result = false;

    if (app.isServiceConnected) {
      // console.log('SENDING FILE MESSAGE--------', _args);
      try {
        const uploadResult = await this._provider.uploadFile(_args, this._groupManager);
        // console.log('FILE UPLOAD RESULT', uploadResult);
        result = uploadResult;
      } catch (error) {
        AppUtil.debug(`METEOR ERROR IN SENDING FILE MESSAGE ${error}`, MODULE);
        this._appManager.logError(error);
        if (error.error.toString() === '500') {
          this._groupManager.setMessageDelivered(_id);
        }
      }
    }
    return result;
  };

  // _sendUndeliveredGroupMessages = (groupId) => {
  //   if (
  //     Object.prototype.hasOwnProperty.call(this._sendingUndelivered, groupId) &&
  //     this._sendingUndelivered[groupId]
  //   ) {
  //     return;
  //   }
  //   this._sendingUndelivered[groupId] = true;

  //   const undelivered = this._groupManager.getUndeliveredMessages(groupId);
  //   // console.log('Undelivered messages of group', groupId, undelivered, undelivered.length);
  //   if (undelivered.length === 0) {
  //     this._sendingUndelivered[groupId] = false;
  //     return;
  //   }

  //   try {
  //     // TODO: move iteration to job chain
  //     for (let i = 0; i < undelivered.length; i += 1) {
  //       const isLast = i === undelivered.length - 1;
  //       console.log('Sending undelivered args', undelivered[i], isLast);
  //       this.sendUndeliveredMessageJob(undelivered[i], isLast);
  //     }
  //   } catch (error) {
  //     AppUtil.debug(`ERROR IN SENDING UNDELIVERED MESSAGES ${error}`, MODULE);
  //   }
  // };

  _sendUndeliveredGroupMessages = async (groupId) => {
    if (
      Object.prototype.hasOwnProperty.call(this._sendingUndelivered, groupId) &&
      this._sendingUndelivered[groupId]
    ) {
      return;
    }
    this._sendingUndelivered[groupId] = true;

    const undelivered = this._groupManager.getUndeliveredMessages(groupId);
    // console.log('Undelivered messages of group', groupId, undelivered, undelivered.length);
    if (undelivered.length === 0) {
      this._sendingUndelivered[groupId] = false;
      return;
    }

    try {
      // send all undelivered messages one recursive job
      // console.log('Sending undelivered args', undelivered);
      await this.sendUndeliveredMessageJob(undelivered, groupId);
    } catch (error) {
      AppUtil.debug(`ERROR IN SENDING UNDELIVERED MESSAGES ${error}`, MODULE);
    }
  };

  _handleDeletedOfflineGroupMessages = (groupId) => {
    if (
      Object.prototype.hasOwnProperty.call(this._sendingDeleted, groupId) &&
      this._sendingDeleted[groupId]
    ) {
      return;
    }
    this._sendingDeleted[groupId] = true;

    const deleted = this._groupManager.getDeletedMessages(groupId);
    // console.log('Deleted messages of group', groupId, deleted, deleted.length);
    if (deleted.length === 0) {
      this._sendingDeleted[groupId] = false;
      return;
    }

    try {
      for (let i = 0; i < deleted.length; i += 1) {
        const isLast = i === deleted.length - 1;
        // console.log('Sending deleted args', deleted[i], isLast);
        this.handleDeletedOfflineMessageJob(deleted[i], isLast);
      }
    } catch (error) {
      AppUtil.debug(`ERROR IN UPDATING DELETED MESSAGES ${error}`, MODULE);
    }
  };

  getGroupUsers = async (groupId) => {
    try {
      const { records: users } = await this._provider.getAllRoomUsers(groupId);
      if (users && users.length > 0) {
        const detailedUserList = this._userManager.getFullUserData(users);
        return detailedUserList;
      }
      return [];
    } catch (error) {
      AppUtil.debug(`ERROR IN GETTING GROUP USERS ${error}`, MODULE);
    }
  };

  setGroupMessagesAsRead = async (args) => {
    const [groupId] = args;
    try {
      await this._provider.setRoomAsRead(groupId);
      // console.log('MAR - GOING TO SET AS READ', groupId);
      this._groupManager.setGroupAsRead(groupId);
    } catch (error) {
      AppUtil.debug(`ERROR IN SETTING ROOM ${groupId} AS READ ${error}`, MODULE);
    }
  };

  startVideoConference = async (groupId) => {
    try {
      await this._provider.startVideoConference(groupId);
      // await this._groupManager.setGroupAsRead(groupId);
    } catch (error) {
      AppUtil.debug(`ERROR IN Starting VC ROOM ${groupId} AS READ ${error}`, MODULE);
    }
  };

  searchUserOrGroup = (searchKey, callback) => {
    const config = { users: true, rooms: true };
    this._provider.searchUserOrRoom(searchKey, config, (error, results) => {
      if (results) {
        const currUser = this._provider.loggedInUser;
        if (currUser) {
          const { users, rooms } = results;
          const filteredUsers = users.filter((user) => user._id !== currUser._id);
          const data = [...filteredUsers, ...rooms];
          return callback(data, 'success');
        }
        return callback(null, 'failure');
      }
      return callback(error, 'failure');
    });
  };

  // creates & returns direct group id
  createDirectMessage = (userName, callback) => {
    this._provider.createDirectMessage(userName, callback);
  };

  joinGroup = (groupId, callback) => {
    this._provider.joinRoom(groupId, callback);
  };

  getMessageInfo = (id, callback) => {
    const messageId = {
      messageId: id,
    };
    this._provider.getMessageInfo(messageId, callback);
  };

  _setLike = (args) => {
    const [messageId] = args;
    // console.log('MESSAGE ID', messageId);
    try {
      this._provider.setLikeReaction(messageId);
    } catch (error) {
      AppUtil.debug(`ERROR IN SENDING LIKE FOR MESSAGE ${error}`, MODULE);
    }
  };

  _getBackgroundGroups = async () => {
    const { loggedInUser } = this._userManager;
    // console.log('FETCH BACKGROUND GROUPS', this._fetchBackgroundGroups);
    if (loggedInUser && !this._fetchBackgroundGroups) {
      this._fetchBackgroundGroups = true;
      // console.log('Getting Messages');
      try {
        const { lastSync } = this._appManager.app;
        const groupList = await this._provider.fetchChannels(loggedInUser, lastSync);
        await this._groupManager.addAll(groupList);
        const groupListLocal = this._groupManager.sortedList;
        this.bgGroupLength = Object.keys(groupListLocal).length;
        Object.keys(groupListLocal).forEach(async (index) => {
          try {
            this.fetchBackgroundMessageJob(groupListLocal[index]);
          } catch (error) {
            AppUtil.debug(`ERROR IN ADDING MESSAGE ${error}, _getBackgroundGroups`, MODULE);
          }
        });
      } catch (error) {
        AppUtil.debug(`ERROR IN GET BACKGROUND GROUPS ${error}`);
        const errObj = {
          _id: JOB_CHAT,
          desc: error.toString(),
          code: '301',
        };
        this._appManager.logError(errObj);
      } finally {
        this._fetchBackgroundGroups = false;
      }
    }
  };

  _getBackgroundMessages = async (arg) => {
    let groupObj;
    try {
      // console.log('FETCHING GROUP MESSAGES');
      const [{ _id }] = arg;
      const lastMessage = await this._groupManager.getLastMessage(_id);
      const lastMessageAt = lastMessage ? lastMessage.createdAt : null;
      const roomInfo = {
        rid: _id,
        lastMessageAt,
        numberOfMessage: FETCH_CURRENT_GROUP_MIN_MSGS,
      };
      const msg = await this._provider.fetchCurrentRoomMessages(roomInfo);
      if (!lastMessageAt) {
        if (msg && msg.messages.length > 0) {
          groupObj = await this._groupManager.addBulkMessages(msg.messages);
        }
        this.bgGroupLength -= 1;
      } else if (msg && lastMessageAt) {
        groupObj = await this._groupManager.addBulkMessages(msg);
        this.bgGroupLength -= 1;
      }
      // console.log('BG-GROUP-LENGTH', this.bgGroupLength);
      if (this.bgGroupLength === 0) {
        this._fetchBackgroundGroups = false;
      }
      return groupObj;
    } catch (error) {
      const errObj = {
        _id: JOB_FETCH_MESSAGE,
        desc: error.toString() || 'Fetch Channel Failed',
        code: '301',
      };
      this._appManager.logError(errObj);
    }
  };
}

ChatTaskManager.ChatJobName = JOB_CHAT;
