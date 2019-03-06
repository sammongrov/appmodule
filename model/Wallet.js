import Constants from './constants';

const WalletSchema = {
  name: Constants.Wallet,
  primaryKey: '_id',
  properties: {
    _id: 'string',
    publicKey: { type: 'string', default: '' },
    secretKey: { type: 'string', default: '' },
    mnemonic: { type: 'string', default: '' },
  },
};

export default class Wallet {}

Wallet.schema = WalletSchema;
