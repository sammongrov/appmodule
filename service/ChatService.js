import AppUtil from '@utils';
import InCallManager from 'react-native-incall-manager';
import PushNotification from 'react-native-push-notification';
import { Application } from '@mongrov/config';

const Module = 'ChatService';

export default class ChatService {
  constructor(provider, groupManager, chatTaskManager) {
    if (provider) {
      // Need to verify with Sami, since the below line throws error.
      // this._provider = provider.meteor;
      this._provider = provider;
      this._groupManager = groupManager;
      this._chatTaskManager = chatTaskManager;
      this._userManager = chatTaskManager._userManager;
    }
  }

  streamNotifyUser(result) {
    AppUtil.debug(`streamNotifyUser -> streamNotifyUser  ${result}`);
  }

  async handleSubscriptionChanges(result) {
    // console.log('GROUP SUBSCRIPTION CHANGES', result);
    const [status, data] = result.args;

    /* check and insert this method if required */
    // required to display Group.unread correctly - marina
    if (result.eventName.endsWith('subscriptions-changed') && status === 'updated') {
      const groups = this._provider.dataToGroupSchemaConverter([data]);
      this._groupManager.addAll(groups);
    }

    if (result.eventName.endsWith('subscriptions-changed') && status === 'inserted') {
      const groups = this._provider.dataToGroupSchemaConverter([data]);
      await this._groupManager.addAll(groups);
      await this._provider.subscribeToGroups(groups);
      Object.keys(groups).forEach((index) => {
        this._chatTaskManager.fetchMessageJob(groups[index]);
      });
    }

    if (result.eventName.endsWith('subscriptions-changed') && status === 'removed') {
      const userGroups = this._groupManager.list;
      this._removeUserFromGroups(userGroups);
    }
  }

  handleRoomChanges(result) {
    // console.log('GROUP ROOM CHANGES', result);
    const [status, data] = result.args;
    // any room updates (e.x.: change room name)
    if (result.eventName.endsWith('rooms-changed') && status === 'updated') {
      const currUser = this._provider.loggedInUser;
      const groups = this._provider._room2group([data], currUser);
      this._groupManager.addAll(groups);
    }
  }

  avatarUpdates(result) {
    const { username } = result.args[0];

    // find a group with type 'd' and name === username
    const directGroups = this._groupManager.list.filtered(`name = "${username}"`) || {};
    const groupId = directGroups[0] && directGroups[0]._id ? directGroups[0]._id : null;
    if (groupId) {
      this._groupManager.updateAvatar(groupId);
    }
  }

  newNotification(results) {
    AppUtil.debug(`streamNotifyUser -> new Notifications ${results}`, Module);
    // this._appManager.addMessageToGroup(results);
  }

  notificationPush = (msg) => {
    const groupId = msg.rid;
    const userId = msg.u._id;
    const userNmae = msg.u.username;
    // console.log("VC NOTIFICATION GROUP ID",groupId,"user ID",user);
    // PushNotification.cancelAllLocalNotifications();
    PushNotification.localNotificationSchedule({
      message: `Video Calling ${userNmae}`, // (required)
      playSound: true,
      autoCancel: false,
      vcData: {
        groupId,
        userId,
        action: 'videoCall',
      },
      date: new Date(Date.now()), // in 60 secs
      actions: '["Accept", "Reject"]',
    });
  };

  streamNotifyRoomMessage(result) {
    // console.log("RESULT IS ",result);
    result.forEach((group) => {
      group.args.forEach((message) => {
        const msg = message;
        const MessageuserId = msg.u._id;
        const currUserId = this._userManager.loggedInUser._id;
        if (msg.t === 'mgvc_call_started' && currUserId !== MessageuserId && message.unread) {
          msg.type = 4;
          InCallManager.startRingtone('_BUNDLE_');
          InCallManager.turnScreenOn();
          this.ringtoneStatus = true;
          setTimeout(() => {
            if (this.ringtoneStatus) {
              InCallManager.stopRingtone();
            }
          }, 5000);
          this.notificationPush(message);
        }
        this._groupManager.addMessage(message);
      });
    });

    // this._groupManager.addMessage();
  }

  streamNotifyRoomDeletedMessage(results) {
    // console.log("RESULTS OF DELETION ARE ", results);
    if (results && results.length > 0) {
      const resEventName = results[0].eventName;
      if (resEventName && resEventName.endsWith('/deleteMessage')) {
        const groupId = resEventName.substring(0, resEventName.lastIndexOf('/deleteMessage'));
        this._groupManager.deleteMessage(groupId, results[0].args[0]._id);
      }
    }
  }

  async _removeUserFromGroups(currGroups) {
    const currGroupsId = Array.from(Object.keys(currGroups), (group) => currGroups[group]._id);
    const userRooms = await this._provider.getUserRooms();
    const userRoomsId = userRooms.map((room) => room._id);

    const updatedIdsSet = new Set(userRoomsId);
    const roomsIdToDelete = currGroupsId.filter((id) => !updatedIdsSet.has(id));
    // console.log('ROOMS ID TO DELETE', roomsIdToDelete);

    if (roomsIdToDelete && roomsIdToDelete.length > 0) {
      this._groupManager.deleteGroups(roomsIdToDelete);
    }
  }

  // groupConverter() {}

  async _getDeleteMessageRoles() {
    try {
      const { deleteMessageRoles } = this._chatTaskManager._userManager;
      // console.log('MAR - deleteMessageRoles', deleteMessageRoles);
      if (deleteMessageRoles) {
        return deleteMessageRoles;
      }

      const appPermissions = await this._provider.getPermissions();
      // console.log('APP PERMISSIONS', appPermissions);
      const deleteMessagePermission = appPermissions.find((item) => item._id === 'delete-message');
      // console.log('DELETE MESSAGE PERMISSIONS', deleteMessagePermission);
      this._chatTaskManager._userManager.setDeleteMessageRoles(
        deleteMessagePermission && deleteMessagePermission.roles,
      );

      return deleteMessagePermission && deleteMessagePermission.roles
        ? deleteMessagePermission.roles
        : null;
    } catch (error) {
      AppUtil.debug(`ERROR GETTING APP PERMISSIONS ${JSON.stringify(error)}`);
    }
  }

  // async canDeleteMessageFromGroup(groupId) {
  //   try {
  //     const isUserAdmin = await this._chatTaskManager._userManager.isCurrentUserAdmin();
  //     const deleteMessageRoles = await this._getDeleteMessageRoles();
  //     const groupRoles = this._groupManager.getGroupRoles(groupId) || [];

  //     // console.log('ALLOWED ROLES', deleteMessageRoles, 'GROUP ROLES', groupRoles);
  //     let canDelete = false;
  //     if (deleteMessageRoles && groupRoles) {
  //       const allowedRolesSet = new Set(deleteMessageRoles);
  //       canDelete = groupRoles.some((role) => allowedRolesSet.has(role));
  //     }
  //     // console.log('Can delete', canDelete, 'is admin', isUserAdmin);
  //     return canDelete || isUserAdmin;
  //   } catch (error) {
  //     AppUtil.debug(`ERROR GETTING DELETE PERMISSIONS ${JSON.stringify(error)}`);
  //   }
  // }

  async canDeleteMessageFromGroup(groupId) {
    let canDelete = false;
    try {
      const deleteMessageRoles = await this._getDeleteMessageRoles();
      const groupRoles = this._groupManager.getGroupRoles(groupId) || [];

      if (Application.APPCONFIG.CHECK_FOR_DISCOVER) {
        const { userRoles } = this._chatTaskManager._userManager;
        // console.log('ALLOWED ROLES', deleteMessageRoles, 'GROUP ROLES', groupRoles, 'USER ROLES', userRoles);

        const allRoles = groupRoles.concat(userRoles);
        if (deleteMessageRoles && allRoles.length > 0) {
          const allowedRolesSet = new Set(deleteMessageRoles);
          canDelete = allRoles.some((role) => allowedRolesSet.has(role));
        }
        // console.log('Can delete', canDelete);
      } else {
        const isUserAdmin = await this._chatTaskManager._userManager.isCurrentUserAdmin();
        // console.log('ALLOWED ROLES', deleteMessageRoles, 'GROUP ROLES', groupRoles);
        if (deleteMessageRoles && groupRoles.length > 0) {
          const allowedRolesSet = new Set(deleteMessageRoles);
          canDelete = groupRoles.some((role) => allowedRolesSet.has(role));
        }
        // console.log('Can delete', canDelete, 'is admin', isUserAdmin);
        canDelete = canDelete || isUserAdmin;
      }
      return canDelete;
    } catch (error) {
      AppUtil.debug(`ERROR GETTING DELETE PERMISSIONS ${JSON.stringify(error)}`);
    }
  }
}
