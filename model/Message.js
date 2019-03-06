/*
 * Message data structure
 */
import Constants from './constants';

const MessageSchema = {
  name: Constants.Message,
  primaryKey: '_id',
  properties: {
    // -- identity
    _id: 'string',
    user: { type: Constants.User, optional: true },
    replyMessageId: { type: 'string', optional: true },
    group: { type: 'string', optional: true },
    // -- type & status
    // text, image, video, audio, location
    type: { type: 'int', default: 0 },
    isReply: { type: 'bool', default: false },
    status: { type: 'int', default: Constants.M_LOCAL }, // delivered, read
    likes: { type: 'int', default: 0 }, // thumbsup value

    // -- data
    original: { type: 'string', optional: true }, // optional - store the original message
    text: 'string',
    remoteFile: { type: 'string', optional: true }, // needs to be used to fetch the image url
    location: { type: 'string', optional: true }, // optional - store the original message
    attachement: { type: 'bool', optional: true },
    image: { type: 'string', optional: true },
    // -- meta data
    createdAt: { type: 'date', optional: true },
    updatedAt: { type: 'date', optional: true },
    remoteFileType: { type: 'string', optional: true },
    uploadFilePercent: { type: 'float', optional: true }, // store an upload percent
  },
};

export default class Message {
  setStatusAsDelivered() {
    this.status = Constants.M_DELIVERED;
  }

  setStatusAsRead() {
    this.status = Constants.M_READ;
  }

  setFileUploadPercent(percent) {
    const _percent = Number.parseFloat(percent);
    this.uploadFilePercent = !Number.isNaN(_percent) ? _percent : 0;
  }
}

Message.schema = MessageSchema;
