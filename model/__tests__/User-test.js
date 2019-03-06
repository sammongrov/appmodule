import { Application } from '@mongrov/config';
import User from '../User';

const user = new User();

it('Instance of User created successfully', () => {
  expect(user).toBeTruthy();
  expect(user).toBeInstanceOf(User);
});

it('User gets avatar url', () => {
  user.username = 'javascript';
  const { avatarURL } = user;
  const expectedURL = `${Application.urls.SERVER_URL}/avatar/${user.username}?_dc=undefined`;
  expect(avatarURL).toMatch(expectedURL);
});
