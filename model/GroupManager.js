/*
 * Group Manager class
 */
import emoji from 'node-emoji';
import Random from 'react-native-meteor/lib/Random';
import AppUtil from '@mongrov/utils';
import CodePush from 'react-native-code-push';
// import PushNotification from 'react-native-push-notification';
// import InCallManager from 'react-native-incall-manager';
import Constants from './constants';
import { Application } from '@mongrov/config';
// import { GoogleAnalyticsTracker } from 'react-native-google-analytics-bridge';

const MODULE = 'GroupManager';
const FETCH_CURRENT_GROUP_MIN_MSGS = 30;

// wrapper class for all groups related db functions
export default class GroupManager {
  constructor(realm, userManager, appManager, taskManager) {
    if (realm) {
      this._realm = realm;
      this._listeners = {};
      this.userManager = userManager;
      this._app = appManager;
      this._taskManager = taskManager;
      this.botCb = null;
    }
  }

  get currentGroup() {
    var res = this._realm.objects(Constants.Group);
    return res && res.length > 0 ? res['0'] : null;
  }

  get list() {
    return this._realm.objects(Constants.Group);
  }

  // ----- simple filters ----
  get sortedList() {
    return this.list.sorted(Constants.DISPLAY_MESSAGE_AT, true);
  }

  getLastMessage(id) {
    const messages = this._realm
      .objects(Constants.Message)
      .filtered(
        // `group == "${id}" AND status != "${Constants.M_DELETED}" AND status != "${
        //   Constants.M_LOCAL
        // }" `,
        `group == "${id}" AND status != "${Constants.M_LOCAL}" `,
      )
      .sorted(Constants.CREATED_AT, true);
    return messages[0] || null;
  }

  // except deleted and local
  // getValidLastMessage(id) {
  //   const messages = this._realm
  //     .objects(Constants.Message)
  //     .filtered(
  //       `group == "${id}" AND status != "${Constants.M_DELETED}" AND status != "${
  //         Constants.M_LOCAL
  //       }" `,
  //     )
  //     .sorted(Constants.CREATED_AT, true);
  //   return messages[0] || null;
  // }

  // except deleted messages
  getLocalLastMessage(id) {
    const messages = this._realm
      .objects(Constants.Message)
      .filtered(`group == "${id}" AND status != "${Constants.M_DELETED}"`)
      .sorted(Constants.CREATED_AT, true);
    return messages[0] || null;
  }

  // all group messages without exceptions
  // getLastCreatedMessage(id) {
  //   const messages = this._realm
  //     .objects(Constants.Message)
  //     .filtered(`group == "${id}"`)
  //     .sorted(Constants.CREATED_AT, true);
  //   return messages[0] || null;
  // }

  getFirstMessage(id) {
    const messages = this._realm
      .objects(Constants.Message)
      .filtered(
        `group == "${id}" AND status != "${Constants.M_DELETED}" AND status != "${
          Constants.M_LOCAL
        }" `,
      )
      .sorted(Constants.CREATED_AT);
    return messages[0];
  }

  findById(gid) {
    const res = this.list.filtered(`_id = "${gid}"`);
    return res && res.length > 0 ? res['0'] : null;
  }

  getGroupMessages(id) {
    const messages = this._realm
      .objects(Constants.Message)
      .filtered(`group == "${id}"`)
      .sorted(Constants.CREATED_AT, true);
    return Array.from(Object.keys(messages), (message) => messages[message]);
  }

  getGroupMessagesAscending(id) {
    const messages = this._realm
      .objects(Constants.Message)
      .filtered(`group == "${id}"`)
      .sorted(Constants.CREATED_AT);
    const limetedMesasge = messages.slice(0, FETCH_CURRENT_GROUP_MIN_MSGS);
    return Array.from(Object.keys(limetedMesasge), (message) => limetedMesasge[message]);
  }

  getUndeliveredMessages(groupId) {
    const { userId } = this._app;
    const messages = this._realm
      .objects(Constants.Message)
      .filtered(
        `group == "${groupId}" AND user._id =="${userId}" AND status == "${Constants.M_LOCAL}"`,
      );
    return Array.from(Object.keys(messages), (message) => messages[message]);
  }

  getDeletedMessages(groupId) {
    const { userId } = this._app;
    // console.log('GET DELETED MESSAGES, groupId, userId', groupId, userId);
    const messages = this._realm
      .objects(Constants.Message)
      .filtered(
        `group == "${groupId}" AND user._id =="${userId}" AND status == "${Constants.M_DELETED}"`,
      );
    // console.log('GET DELETED MESSAGES, MESSAGES', messages);
    return Array.from(Object.keys(messages), (message) => messages[message]);
  }

  findMessageById(messageId) {
    const messages = this._realm.objects(Constants.Message).filtered(`_id == "${messageId}"`);
    return messages && messages.length ? messages['0'] : null;
  }

  findRootMessage(messageId, childMessageId = null) {
    const message = this.findMessageById(messageId);
    if (message && message.isReply && message.replyMessageId) {
      return this.findRootMessage(message.replyMessageId, message._id);
    }
    // root message is deleted, new root is its direct child
    if (message === null) {
      const newRootMessage = this.findMessageById(childMessageId);
      return newRootMessage;
    }
    return message;
  }

  getGroupRoles(groupId) {
    const groupObj = this.findById(groupId);
    // console.log('GET GROUP ROLES, GROUP OBJ', groupObj);
    return groupObj && groupObj.roles && groupObj.roles.length > 0
      ? Array.from(Object.keys(groupObj.roles), (role) => groupObj.roles[role])
      : null;
  }

  getGroupById(groupId) {
    const messages = this._realm.objects(Constants.Group).filtered(`_id == "${groupId}"`);
    return messages && messages.length ? messages['0'] : null;
  }

  groupHasUndelivered = (groupId) => {
    const { userId } = this._app;
    // status === local or deleted
    const undelivered = this._realm
      .objects(Constants.Message)
      .filtered(
        `group == "${groupId}" AND user._id =="${userId}" AND status <= "${Constants.M_LOCAL}"`,
      );
    // console.log( 'UNDELIVERED', undelivered);
    return Object.keys(undelivered).length > 0;
  };

  // printAllGroup(object){
  //   const groupList = this._realm.objects(Constants.Group);
  //   Object.keys(groupList).forEach((index) => {

  //     console.log("GROUP DATA IS",groupList[index][object]);
  //     console.log("GROUP DATA IS",groupList[index].name);
  //   })
  // }

  // sortedMessages(messages) {
  //   return messages
  //     .filtered(`type != ${Constants.M_TYPE_LOCATION}`)
  //     .sorted(Constants.CREATED_AT, true);
  // }

  // lastMessage(messages) {
  //   if (messages.length <= 0) return null;
  //   const sortedMessage = this.sortedMessages(messages);
  //   return sortedMessage[0];
  // }

  addBotListner = (botcb) => {
    this.botCb = botcb;
  };

  removeBotListner = () => {
    this.botCb = null;
  };

  addGroupMessageListner = (listener) => {
    this._realm.objects(Constants.Group).addListener(listener);
  };

  removeGroupMessageListener = (listener) => {
    this._realm.objects(Constants.Group).removeListener(listener);
  };

  addGroupListener = (listener) => {
    this.groupCallback = listener;
    this._realm.objects(Constants.Group).addListener(this.groupListner);
  };

  removeGroupListener = () => {
    this.groupCallback = null;
    this._realm.objects(Constants.Group).removeListener(this.groupListner);
  };

  /**
   * EXPERIMENTAL BUG FIX FOR STALE DATA IN GROUP LIST VIEW IN BACKGROUND MODE
   */
  groupListner = () => {
    // console.log('APP.APPSTATE', this._app.appState, 'GROUP CALLBACK', this.groupCallback);
    if (this._app.appState && this.groupCallback) {
      // console.log('M-Group callback is called');
      this.groupCallback();
    } else if (!this.groupCallback) {
      // console.log('M-Group restarting the app');
      CodePush.restartApp();
    }
  };

  // ----- mutation helpers ----

  // add all groups passed {id: {group obj}, id2: {group}}
  addAll = (groups) => {
    try {
      if (!groups || Object.keys(groups).length <= 0) return;
      this._realm.write(() => {
        Object.keys(groups).forEach((k) => {
          let obj = groups[k];
          if (obj && obj._id) {
            let typ = Constants.G_PRIVATE;
            if (obj.type) {
              switch (obj.type) {
                case 'd':
                  typ = Constants.G_DIRECT;
                  break;
                case 'c':
                  typ = Constants.G_PUBLIC;
                  break;
                default:
                  typ = Constants.G_PRIVATE;
                  break;
              }
            }
            obj.type = typ;

            // set initial status for direct groups
            if (obj.type === Constants.G_DIRECT && obj.name) {
              const groupStatus = this.userManager.getStatus(obj.name);
              obj.status = groupStatus;
            }
            const { lastMessage } = obj;
            delete obj.lastMessage;
            // const lastCreatedMessage = this.getLastCreatedMessage(obj._id);
            const groupHasUndelivered = this.groupHasUndelivered(obj._id);

            // update the group's last message only if there is no local or deleted offline - marina
            if (!groupHasUndelivered) {
              if (lastMessage && Object.keys(lastMessage).length > 0) {
                obj.displayLastMessageAt = lastMessage.ts;
                obj.displayMessage = lastMessage.msg;
                obj.displayMessageUser = lastMessage.u.name || lastMessage.u.username || 'unknown';
                obj.moreMessages = true;
                if (lastMessage.attachments) {
                  const isFileAttached = lastMessage.file;
                  if (isFileAttached) {
                    obj.displayMessage = isFileAttached.type.includes('image')
                      ? 'Image'
                      : 'attachments';
                  }
                  if (lastMessage.bot && lastMessage.attachments[0]) {
                    obj.displayMessage = lastMessage.attachments[0].author_name
                      ? `${lastMessage.attachments[0].author_name} - ${
                          lastMessage.attachments[0].text
                        }`
                      : `${lastMessage.attachments[0].text}\n`;
                  }
                }
              } else {
                // no last message on the server
                const lastLocalMessage = this.getLocalLastMessage(obj._id);
                if (lastLocalMessage && lastLocalMessage.text) {
                  obj.displayMessage = lastLocalMessage.text;
                }
              }
            }

            if (obj.displayMessage) {
              // transform threaded message
              const isReply = obj.displayMessage.includes('?msg=');
              if (isReply) {
                const result = obj.displayMessage.split(')');
                obj.displayMessage = result[result.length - 1].trim();
              }
              // convert emojis in message text
              obj.displayMessage = emoji.emojify(obj.displayMessage);
            }

            // enable Group.moreMessages
            const groupMessagesLength = this.getGroupMessages(obj._id).length;
            if (groupMessagesLength >= Application.FETCH_CURRENT_GROUP_MIN_MSGS - 1) {
              obj.moreMessages = true;
            }

            // console.log("OBJ=",obj);

            if (obj.title && obj.title.includes('calender -')) {
              [obj.title, obj.calender] = [
                obj.title.split('calender -')[0],
                obj.title.split('calender -')[1],
              ];
            }
            obj = AppUtil.removeEmptyValues(obj);
            this._realm.create(Constants.Group, obj, true);
          }
        });
      });
      this._app.setLastSyncOnMessage();
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  };

  // this is not tested yet ,just minified version of addBulkMessage
  addMessage = async (msg) => {
    try {
      const message = {
        _id: msg._id,
        // user: msg.u,
        // replyMessageId: msg.rid,
        text:
          msg.t === 'mgvc_call_started' ||
          (msg.actionLinks && msg.actionLinks[0].method_id === 'joinMGVCCall')
            ? 'Click to Join!'
            : msg.msg,
        createdAt: msg.ts,
        updatedAt: msg._updatedAt,
        group: msg.rid,
        original: JSON.stringify(msg),
        attachment: msg.file !== undefined,
      };

      if (msg.file) {
        message.remoteFileType = msg.file.type;
        if (msg.file.type.includes('image')) {
          message.image = `${Application.urls.SERVER_URL}${msg.attachments[0].image_url}?rc_uid=${
            this._app.userId
          }&rc_token=${this._app.token}`;
        } else {
          message.remoteFile = `${Application.urls.SERVER_URL}${
            msg.attachments[0].title_link
          }?rc_uid=${this._app.userId}&rc_token=${this._app.token}`;
        }
      }

      if (msg.msg.length < 1 && msg.attachments) {
        message.text = message.text || '';
      }

      const msgUser = msg.u;
      const msgStatus = msg.unread ? Constants.M_DELIVERED : Constants.M_READ;
      let updateGroupOnMessage;
      if (msgStatus === Constants.M_READ) {
        const currentUserId = this.userManager.loggedInUserId;
        updateGroupOnMessage = currentUserId === msgUser._id;
      }

      if (message.attachment) {
        const existingMessage = this._realm
          .objects(Constants.Message)
          .filtered(`_id = "${msg._id}"`);
        //  message.text = msg.attachments[0].description || message.text;
        if (Object.keys(existingMessage).length < 1 && msg.bot) {
          for (let i = 0; i < msg.attachments.length; i += 1) {
            message.text += msg.attachments[i].author_name
              ? `${msg.attachments[i].author_name} - ${msg.attachments[i].text}\n`
              : `${msg.attachments[i].text}\n`;
          }
        } else if (
          msg.attachments &&
          msg.attachments.length > 0 &&
          msg.attachments[0].description
        ) {
          message.text += `${msg.attachments[0].description}`;
        }
      }
      if (message.text) {
        // transform threaded message
        message.isReply = message.text.includes('?msg=');
        if (message.isReply) {
          let result = message.text.split('?msg=');
          result = result[result.length - 1].split(')');
          const [replyMessageId] = result;
          message.replyMessageId = replyMessageId;
          if (result[1]) {
            message.text = result[1].trim();
          }
        }
        // convert emojis in message text
        if (!msg.bot) {
          message.text = emoji.emojify(message.text);
        }
        // Bot speak callback botRead
        if (
          this.botCb &&
          msg &&
          msg.unread === true &&
          msg.u &&
          msg.u._id === 'rocket.cat' &&
          msg.rid === `${this.userManager.loggedInUserId}rocket.cat`
        ) {
          const isNewmessage = this._realm
            .objects(Constants.Message)
            .filtered(`_id = "${msg._id}"`);
          if (!isNewmessage || Object.keys(isNewmessage).length === 0) {
            this.botCb(msg);
          }
        }
      }

      if (msg.reactions) {
        Object.keys(msg.reactions).forEach((key) => {
          if (key.indexOf('thumbsup') >= 0) {
            const tempUsers = msg.reactions[key];
            message.likes = tempUsers.usernames.length;
          }
        });
      }

      let groupObj, groupUser;
      this._realm.write(() => {
        groupObj = this.findById(msg.rid);
        groupUser = this._realm.create(Constants.User, msgUser, true);
        message.user = groupUser;
        message.status = msgStatus;
        message.type = msg.type;
        this._realm.create(Constants.Message, message, true);

        // update group in order to show the read tick instantly
        if (groupObj && (updateGroupOnMessage || message.likes)) {
          // console.log('update on read', msgStatus, 'or like', message.likes);
          groupObj.updatedAt = AppUtil.getCurrentRealmDate();
        }
        // groupObj = this._realm.create(Constants.Group,
        //   { _id: msg.rid.toString(),
        //     updatedAt:AppUtil.getCurrentRealmDate()
        //    }, true);
        // groupObj.updatedAt = AppUtil.getCurrentRealmDate();
      });
      // InCallManager.startRingtone('_BUNDLE_');
      // InCallManager.turnScreenOn();
      return groupObj;
    } catch (error) {
      AppUtil.debug(`ERROR IN ADD MESSAGE ${JSON.stringify(msg)}`, MODULE);
      AppUtil.debug(`ERROR IN ADD MESSAGE ${error}`, MODULE);
      // throw error;
      this._app.logError(error);
    }
  };

  // updateImageOfMessage(msg) {
  //   const message = this._realm.objects(Constants.Message).filtered(`_id = "${msg.msgId}"`)[0];
  //   // console.log('GET LINK MESSAGE IS in updateImageOfMessage === ', message);
  //   // console.log('GET LINK MESSAGE IS in updateImageOfMessage 2=== ', message.image);
  //   this._realm.write(() => {
  //     message.image = msg.imageUrl;
  //     const groupObj = this._realm.create(Constants.Group, { _id: message.group }, true);
  //     groupObj.updatedAt = AppUtil.getCurrentRealmDate();
  //   });
  // }

  // notificationPush = (msg) => {
  //   const groupId = msg.rid;
  //   const userId = msg.u._id;
  //   const userNmae = msg.u.username;
  //   // console.log("VC NOTIFICATION GROUP ID",groupId,"user ID",user);
  //   PushNotification.cancelAllLocalNotifications();
  //   PushNotification.localNotificationSchedule({
  //     message: `Video Calling ${userNmae}`, // (required)
  //     playSound: true,
  //     autoCancel: false,
  //     vcData: {
  //       groupId,
  //       userId,
  //       action: 'videoCall',
  //     },
  //     date: new Date(Date.now()), // in 60 secs
  //     actions: '["Accept", "Reject"]',
  //   });
  // };

  addMessageToRealmOnly = (message) => {
    const _message = message;
    let displayMessage = _message.text;
    if (_message && _message.type) {
      switch (_message.type) {
        case Constants.M_TYPE_IMAGE:
          displayMessage = 'Image';
          break;
        case Constants.M_TYPE_VIDEO:
          displayMessage = 'Video File';
          break;
        case Constants.M_TYPE_AUDIO:
          displayMessage = 'Audio File';
          break;
        case Constants.M_TYPE_LOCATION:
          displayMessage = 'Location';
          break;
        default:
          break;
      }
    }
    try {
      let groupObj;
      this._realm.write(() => {
        groupObj = this.findById(_message.group);
        // groupUser = this._realm.create(Constants.User, _message.user, true);
        // _message.user = groupUser;
        const lastMessageTs = groupObj.updatedAt;
        const currentTs = message.createdAt;
        const messageTs = currentTs < lastMessageTs ? lastMessageTs : currentTs;
        _message.createdAt = messageTs;
        _message.updatedAt = messageTs;
        const displayMessageUser = _message.user.name || _message.user.username || 'unknown';
        this._realm.create(Constants.Message, _message, true);
        // update group's last message
        this._realm.create(
          Constants.Group,
          {
            _id: groupObj._id,
            displayMessage,
            displayLastMessageAt: messageTs,
            displayMessageUser,
            updatedAt: AppUtil.getCurrentRealmDate(),
          },
          true,
        );
      });
      return groupObj;
    } catch (error) {
      AppUtil.debug(`ERROR IN ADD MESSAGE ${JSON.stringify(message)}`, MODULE);
      AppUtil.debug(`ERROR IN ADD MESSAGE ${error}`, MODULE);
      this._app.logError(error);
    }
  };

  addBulkMessages = (messages) => {
    try {
      let groupObj, groupUser, msg, message, msgUser, msgStatus;
      // let sortedMessage;
      this._realm.write(() => {
        Object.keys(messages).forEach(async (index) => {
          try {
            msg = messages[index];
            message = {
              _id: msg._id,
              // user: msg.u,
              // replyMessageId: msg.rid,
              text:
                msg.t === 'mgvc_call_started' ||
                (msg.actionLinks && msg.actionLinks[0].method_id === 'joinMGVCCall')
                  ? 'Click to Join !'
                  : msg.msg.toString(),
              createdAt: msg.ts,
              updatedAt: msg._updatedAt,
              group: msg.rid,
              original: msg.toString(),
              attachments: msg.file !== undefined,
            };

            if (
              msg.t === 'mgvc_call_started' ||
              (msg.actionLinks && msg.actionLinks[0].method_id === 'joinMGVCCall')
            ) {
              message.type = 4;
            }
            if (msg.file) {
              message.remoteFileType = msg.file.type;
              if (msg.file.type.includes('image')) {
                message.image = `${Application.urls.SERVER_URL}${
                  msg.attachments[0].image_url
                }?rc_uid=${this._app.userId}&rc_token=${this._app.token}`;
              } else {
                message.remoteFile = `${Application.urls.SERVER_URL}${
                  msg.attachments[0].title_link
                }?rc_uid=${this._app.userId}&rc_token=${this._app.token}`;
              }
            }
            msgUser = msg.u;
            groupUser = this._realm.create(Constants.User, msgUser, true);
            message.user = groupUser;
            if (msg.attachments) {
              // console.log("MESSAGE ATTACHEMENT IN BULK == ",msg.attachments);
              if (msg.bot) {
                for (let i = 0; i < msg.attachments.length; i += 1) {
                  message.text += msg.attachments[i].author_name
                    ? `${msg.attachments[i].author_name} - ${msg.attachments[i].text}\n`
                    : `${msg.attachments[i].text}\n`;
                }
              } else if (
                msg.attachments &&
                msg.attachments.length > 0 &&
                msg.attachments[0].description
              ) {
                message.text += `${msg.attachments[0].description}`;
                // console.log('APPENDED', `${msg.attachments[0].description}`);
              }
            }

            if (message.text) {
              // transform threaded message
              message.isReply = message.text.includes('?msg=');
              if (message.isReply) {
                let result = message.text.split('?msg=');
                result = result[result.length - 1].split(')');
                const [replyMessageId] = result;
                message.replyMessageId = replyMessageId;
                if (result[1]) {
                  message.text = result[1].trim();
                }
              }
              // convert emojis in message text
              if (!msg.bot) {
                message.text = emoji.emojify(message.text);
              }
              // console.log('MESSAGE TEXT', message.text);
            }

            if (msg.reactions) {
              Object.keys(msg.reactions).forEach((key) => {
                if (key.indexOf('thumbsup') >= 0) {
                  const tempUsers = msg.reactions[key];
                  message.likes = tempUsers.usernames.length;
                }
              });
            }

            msgStatus = msg.unread ? Constants.M_DELIVERED : Constants.M_READ;
            message.status = msgStatus; // message received from meteor are delivered or read;
            // console.log('Message', message.type, 'Text', message.text);
            this._realm.create(Constants.Message, message, true);
          } catch (error) {
            // DONT THROW ERROR HERE
            AppUtil.debug(`ERROR IN ADD MESSAGE ${error}`, MODULE);
          }
        });
      });
      this._app.setLastSyncOnMessage();
      return groupObj;
    } catch (error) {
      // console.log('ERROR IN WRITING message bulk', error);
      AppUtil.debug(`ERROR IN WRITING message bulk ${error}`, MODULE);
      throw error;
    }
  };

  addEarlierMessage(messages) {
    try {
      // const { loggedInUser } = this.userManager;
      let groupObj, groupUser, msg, message, msgUser, msgStatus;

      this._realm.write(() => {
        Object.keys(messages).forEach(async (index) => {
          try {
            msg = messages[index];
            // console.log("MSG is ====",msg)
            message = {
              _id: msg._id,
              // user: msg.u,
              // replyMessageId: msg.rid,
              text: msg.msg.toString(),
              createdAt: msg.ts,
              updatedAt: msg._updatedAt,
              group: msg.rid,
              original: msg.toString(),
              attachments: msg.file !== undefined,
            };
            msgUser = msg.u;
            groupUser = this._realm.create(Constants.User, msgUser, true);
            message.user = groupUser;
            msgStatus = msg.unread ? Constants.M_DELIVERED : Constants.M_READ;
            message.status = msgStatus;

            if (msg.file) {
              message.remoteFileType = msg.file.type;
              if (msg.file.type.includes('image')) {
                message.image = `${Application.urls.SERVER_URL}${
                  msg.attachments[0].image_url
                }?rc_uid=${this._app.userId}&rc_token=${this._app.token}`;
              } else {
                message.remoteFile = `${Application.urls.SERVER_URL}${
                  msg.attachments[0].title_link
                }?rc_uid=${this._app.userId}&rc_token=${this._app.token}`;
              }
            }
            // if (msg.msg.length < 1 && msg.attachments) {
            //   message.text = message.text || '';
            // }
            if (msg.attachments && msg.attachments.length > 0) {
              const existingMessage = this._realm
                .objects(Constants.Message)
                .filtered(`_id = "${msg._id}"`);
              if (Object.keys(existingMessage).length < 1 && msg.bot) {
                for (let i = 0; i < msg.attachments.length; i += 1) {
                  message.text += msg.attachments[i].author_name
                    ? `${msg.attachments[i].author_name}
                    - ${msg.attachments[i].text}\n`
                    : `${msg.attachments[i].text}\n`;
                }
              } else if (
                msg.attachments &&
                msg.attachments.length > 0 &&
                msg.attachments[0].description
              ) {
                message.text += `${msg.attachments[0].description}`;
              }
            }
            if (message.text) {
              // transform threaded message
              message.isReply = message.text.includes('?msg=');
              if (message.isReply) {
                let result = message.text.split('?msg=');
                result = result[result.length - 1].split(')');
                const [replyMessageId] = result;
                message.replyMessageId = replyMessageId;
                if (result[1]) {
                  message.text = result[1].trim();
                }
              }
              // convert emojis in message text
              if (!msg.bot) {
                message.text = emoji.emojify(message.text);
              }
            }
            this._realm.create(Constants.Message, message, true);

            if (index === (messages.length - 1).toString() && messages.length > 0) {
              groupObj = this._realm.create(
                Constants.Group,
                { _id: msg.rid.toString(), updatedAt: AppUtil.getCurrentRealmDate() },
                true,
              );
            }
          } catch (error) {
            // DONT THROW ERROR HERE
            AppUtil.debug(`ERROR IN ADD MESSAGE ${error}`, MODULE);
          }
        });
      });
      this._app.setLastSyncOnMessage();
      return groupObj;
    } catch (error) {
      // console.log('ERROR IN WRITING message bulk', error);
      AppUtil.debug(`ERROR IN WRITING message bulk ${error}`, MODULE);
      throw error;
    }
  }

  getMembers() {
    return this._realm.objects(Constants.User);
  }

  deleteGroups = (groupsIdArr) => {
    // console.log('GOING TO DELETE ROOMS', groupsIdArr);
    try {
      this._realm.write(() => {
        for (let i = 0; i < groupsIdArr.length; i += 1) {
          const groupObj = this.findById(groupsIdArr[i]);
          this._realm.delete(groupObj);
        }
      });
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  };

  updateAvatar = (groupId) => {
    try {
      this._realm.write(() => {
        const groupObj = this.findById(groupId);
        groupObj.avatarUpdatedAt = new Date();
      });
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  };

  setGroupAsRead = (groupId) => {
    try {
      this._realm.write(() => {
        const groupObj = this.findById(groupId);
        groupObj.unread = 0;
      });
      // console.log('GROUP SET AS READ', groupId);
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  };

  // update status of direct groups
  updateGroupsStatus = () => {
    let groupObj;
    const directGroups = this.list.filtered(`type = "${Constants.G_DIRECT}"`);
    try {
      if (Object.keys(directGroups).length > 0) {
        this._realm.write(() => {
          Object.keys(directGroups).forEach((key) => {
            groupObj = directGroups[key];
            const updatedStatus = this.userManager.getStatus(groupObj.name);
            if (groupObj && groupObj.status !== updatedStatus) {
              groupObj.status = updatedStatus;
            }
          });
        });
      }
      return groupObj;
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  };

  // when a user has no connection set all direct groups offline
  setAllGroupsOffline = () => {
    let groupObj;
    const directGroups = this.list.filtered(`type = "${Constants.G_DIRECT}"`);
    try {
      if (Object.keys(directGroups).length > 0) {
        this._realm.write(() => {
          Object.keys(directGroups).forEach((key) => {
            groupObj = directGroups[key];
            const updatedStatus = Constants.U_OFFLINE;
            if (groupObj && groupObj.status !== updatedStatus) {
              groupObj.status = updatedStatus;
            }
            // console.log(`GROUP ${groupObj.name} is ${groupObj.status}`);
          });
        });
      }
      return groupObj;
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  };

  setMessageDelivered = (messageId) => {
    try {
      const message = this.findMessageById(messageId);
      // console.log('setting as delivered', message._id, message.text);
      if (message) {
        this._realm.write(() => {
          message.status = Constants.M_DELIVERED;
        });
      }
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  };

  setMessageDeleted = (messageId, groupId) => {
    try {
      let isLast = false;
      const message = this.findMessageById(messageId);
      const lastMessage = this.getLocalLastMessage(groupId);
      if (lastMessage && lastMessage._id && message && message._id) {
        isLast = lastMessage._id === message._id;
      }
      const group = this.findById(groupId);
      // console.log('setting as deleted', message._id, message.text);
      // console.log('setting as deleted from group', group);
      if (message && group) {
        this._realm.write(() => {
          if (message.status === Constants.M_LOCAL) {
            this._realm.delete(message);
          } else {
            message.status = Constants.M_DELETED;
          }
          // console.log('IS LAST', isLast);
          if (isLast) {
            const beforeLast = this.getLocalLastMessage(groupId);
            // console.log('MESSAGE BEFORE THE LAST', beforeLast);
            if (beforeLast) {
              group.displayMessage = beforeLast.text;
              group.displayLastMessageAt = beforeLast.createdAt;
              group.displayMessageUser =
                beforeLast.user.name || beforeLast.user.username || 'unknown';
            } else {
              // last message in a group is deleted
              group.displayMessage = 'No Message';
              // group.displayLastMessageAt = null;
              group.displayMessageUser = 'unknown';
            }
          }
          group.updatedAt = AppUtil.getCurrentRealmDate();
        });
      }
      // console.log('MAR DELETES MESSAGE', this.findMessageById(messageId));
    } catch (err) {
      AppUtil.debug(err, MODULE);
    }
  };

  buildFileMessage = (args) => {
    const { data, rid, isImage, desc, replyMessageId } = args;
    const _id = Random.id();
    const user = this.userManager.loggedInUser;
    const isReply = !!replyMessageId;
    let type;
    if (isImage) {
      type = Constants.M_TYPE_IMAGE;
    } else if (desc === 'Audio Message') {
      type = Constants.M_TYPE_AUDIO;
    } else if (desc === 'Video Message') {
      type = Constants.M_TYPE_VIDEO;
    }

    return {
      _id,
      user,
      replyMessageId: replyMessageId || null,
      group: rid,
      type,
      isReply,
      status: Constants.M_LOCAL,
      text: isImage ? desc : '',
      image: isImage ? data.uri : null,
      createdAt: new Date(),
      remoteFile: !isImage ? data.uri : null,
    };
  };

  buildTextMessage = (args) => {
    const { groupId, message } = args;
    const _id = Random.id();
    const user = this.userManager.loggedInUser;
    return {
      _id,
      user,
      // replyMessageId: groupId,
      group: groupId,
      isReply: false,
      status: Constants.M_LOCAL,
      text: message.text.trim(),
      createdAt: new Date(),
    };
  };

  // buildThreadedMessage = (args) => {
  //   const { groupObj, replyMsgId, message, serverURL } = args;
  //   const _id = Random.id();
  //   const user = this.userManager.loggedInUser;

  //   let groupType = 'direct';
  //   switch (groupObj.type) {
  //     case Constants.G_PRIVATE:
  //       groupType = 'group';
  //       break;
  //     case Constants.G_PUBLIC:
  //       groupType = 'channel';
  //       break;
  //     default:
  //       break;
  //   }

  //   const replyTemplate = `[ ](https://${serverURL}/${groupType}/${
  //     groupObj.name
  //   }?msg=${replyMsgId})`;
  //   const threadedMessage = `${replyTemplate} ${message.text.trim()}`;

  //   return {
  //     _id,
  //     user,
  //     replyMessageId: replyMsgId,
  //     group: groupObj._id,
  //     isReply: true,
  //     status: Constants.M_LOCAL,
  //     text: threadedMessage,
  //     createdAt: new Date(),
  //   };
  // };

  buildThreadedMessage = (args) => {
    const { groupObj, replyMsgId, message } = args;
    const _id = Random.id();
    const user = this.userManager.loggedInUser;
    return {
      _id,
      user,
      replyMessageId: replyMsgId,
      group: groupObj._id,
      isReply: true,
      status: Constants.M_LOCAL,
      text: message.text.trim(),
      createdAt: new Date(),
    };
  };

  buildReplyTemplate = (args) => {
    const { groupObj, replyMsgId, message, serverURL } = args;
    let groupType = 'direct';
    switch (groupObj.type) {
      case Constants.G_PRIVATE:
        groupType = 'group';
        break;
      case Constants.G_PUBLIC:
        groupType = 'channel';
        break;
      default:
        break;
    }
    const replyTemplate = `[ ](https://${serverURL}/${groupType}/${
      groupObj.name
    }?msg=${replyMsgId})`;
    const threadedMessage = `${replyTemplate} ${message.text.trim()}`;
    return threadedMessage;
  };

  deleteMessage = (groupId, messageId) => {
    try {
      const message = this.findMessageById(messageId);
      const group = this.findById(groupId);
      // console.log('group to delete from', group);

      if (message && group) {
        // console.log('message to delete', message._id, message.text, message.status);
        this._realm.write(() => {
          this._realm.delete(message);
          group.updatedAt = AppUtil.getCurrentRealmDate();
        });
      }
    } catch (err) {
      AppUtil.debug(`DELETE MESSAGE ERROR ${err}`, MODULE);
    }
  };

  unemojifyMessageText = (text) => emoji.unemojify(text.trim());

  setFileUploadPercent = (messageId, percent) => {
    try {
      const messageObj = this.findMessageById(messageId);
      const groupObj = this.findById(messageObj.group);

      if (messageObj && groupObj) {
        this._realm.write(() => {
          messageObj.setFileUploadPercent(percent);
          groupObj.updatedAt = AppUtil.getCurrentRealmDate();
        });
      }
    } catch (err) {
      AppUtil.debug(`WRITE FILE UPLOAD PERCENTAGE ERROR ${err}`, MODULE);
    }
  };

  updateNoMoreMessages = (groupId) => {
    try {
      const groupObj = this.findById(groupId);
      if (groupObj) {
        this._realm.write(() => {
          groupObj.moreMessages = false;
        });
      }
    } catch (err) {
      AppUtil.debug(`NO MORE MESSAGES ERROR ${err}`, MODULE);
    }
  };

  getNumOfMessageReplies = (rootMsgId, groupId) => {
    if (rootMsgId && groupId) {
      const groupMessages = this.getGroupMessages(groupId);
      const isChild = (messageId, rootId) => {
        const message = this.findMessageById(messageId);
        if (message && message.isReply && message.replyMessageId) {
          if (message.replyMessageId === rootId) {
            return true;
          }
          return isChild(message.replyMessageId, rootId);
        }
        return false;
      };
      if (groupMessages.length === 0) return 0;

      const childMessages = groupMessages.filter((msg) => isChild(msg._id, rootMsgId));
      // console.log(childMessages.length);
      return childMessages.length;
    }
    return 0;
  };

  findAllChildMessages = (messages, rootMsgId) => {
    // returns array of child messages of the thread
    const isChildOfRoot = (messageId, parentMsgIdSet) => {
      // console.log('PARENT MESSAGES', parentMsgIdSet);
      const message = this.findMessageById(messageId);
      // console.log('MESSAGE', message);
      if (message && message.isReply && message.replyMessageId) {
        if (parentMsgIdSet.has(message.replyMessageId)) {
          parentMsgIdSet.add(message._id);
          return true;
        }
        return isChildOfRoot(message.replyMessageId, parentMsgIdSet);
      }
      return false;
    };

    const parentsIdSet = new Set([rootMsgId]);
    const filteredMessages = messages.filter((msg) => isChildOfRoot(msg._id, parentsIdSet));
    // console.log('CHILD MESSAGES', filteredMessages);
    return filteredMessages;
    // return messages.filter((msg) => isChildOfRoot(msg, parentsIdSet));
  };
}
