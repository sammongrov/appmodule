import Application from '../../../constants/config';
import Group from '../Group';
import Constants from '../constants';

const group = new Group();

it('Instance of Group created successfully', () => {
  expect(group).toBeTruthy();
  expect(group).toBeInstanceOf(Group);
});

it('Group instance gets avatar url', () => {
  group.name = 'test';
  group.type = Constants.G_DIRECT;
  group.avatarUpdatedAt = new Date();
  const expectedUrl = `${Application.urls.SERVER_URL}/avatar/${group.name}?d=${
    group.avatarUpdatedAt
  }`;
  const avatarUrl = group.avatarURL;
  expect(avatarUrl).toMatch(expectedUrl);
});

it('Group instance does not get avatar url', () => {
  group.name = 'test';
  group.type = Constants.G_DIRECT;
  group.avatarUpdatedAt = null;
  const expectedUrl = `${Application.urls.SERVER_URL}/avatar/${group.name}`;
  const avatarUrl = group.avatarURL;
  expect(avatarUrl).toMatch(expectedUrl);
});

it('Group instance does not get avatar url', () => {
  group.name = 'general';
  group.type = Constants.G_PUBLIC;
  group.avatarUpdatedAt = new Date();
  const expectedUrl = '';
  const avatarUrl = group.avatarURL;
  expect(avatarUrl).toMatch(expectedUrl);
});

it('Group instance gets group heading', () => {
  // name, no title
  group.name = 'JSNinja';
  group.title = null;

  const headingFromName = group.groupHeading;
  expect(headingFromName).toMatch('JSNinja');

  // no name, title
  group.name = null;
  group.title = 'JavaScript ninjas from 7 kyu';

  const headingFromTitle = group.groupHeading;
  expect(headingFromTitle).toMatch('JavaScript ninjas from 7 kyu');
});
