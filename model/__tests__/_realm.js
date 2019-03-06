import Realm from 'realm';
import Login from '../Login';
import Errors from '../Errors';
import App from '../App';
import Setting from '../Setting';
import Group from '../Group';
import User from '../User';
import Message from '../Message';
import Board from '../board/Board';
import Card from '../board/Card';
import CarCardCommentsd from '../board/CardComments';
import Checklistitems from '../board/CheckListItems';
import Checklists from '../board/CheckLists';
import Lists from '../board/Lists';
import Calender from '../events/Calender';

// const Config = {
//   REALM_PATH: 'reactNativeQueue.realm', // Name of realm database.
//   REALM_SCHEMA_VERSION: 0, // Must be incremented if data model updates.
// };

const JobSchema = {
  name: 'Job',
  primaryKey: 'id',
  properties: {
    id: 'string', // UUID.
    name: 'string', // Job name to be matched with worker function.
    payload: 'string', // Job payload stored as JSON.
    data: 'string', // Store arbitrary data like "failed attempts" as JSON.
    priority: 'int', // -5 to 5 to indicate low to high priority.
    active: { type: 'bool', default: false }, // Whether or not job is currently being processed.
    timeout: 'int', // Job timeout in ms. 0 means no timeout.
    created: 'date', // Job creation timestamp.
    failed: 'date?', // Job failure timestamp (null until failure).
  },
};

const Schema = {
  schema: [
    App,
    Setting,
    Login,
    Errors,
    Lists,
    Group,
    User,
    Message,
    JobSchema,
    Checklistitems,
    Card,
    Board,
    Checklists,
    CarCardCommentsd,
    Calender,
  ],
  schemaVersion: 138,
  migration: () => {},
};

export default new Realm(Schema);
