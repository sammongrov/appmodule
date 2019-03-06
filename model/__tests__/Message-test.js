import Constants from '../constants';
import Message from '../Message';

const message = new Message();

it('Instance of Message created successfully', () => {
  expect(message).toBeTruthy();
  expect(message).toBeInstanceOf(Message);
});

it('Message instance sets status as delivered', () => {
  message.setStatusAsDelivered();
  expect(message.status).toBe(Constants.M_DELIVERED);
});

it('Message instance sets status as read', () => {
  message.setStatusAsRead();
  expect(message.status).toBe(Constants.M_READ);
});

it('Message instance sets file upload percentage from float', () => {
  const percent = 0.098712;
  message.setFileUploadPercent(percent);
  const expectedResult = Number(Number.parseFloat(percent).toFixed(2));
  expect(message.uploadFilePercent).toBe(expectedResult);
});

it('Message instance sets file upload percentage from 0', () => {
  const percent = 0;
  message.setFileUploadPercent(percent);
  const expectedResult = Number(Number.parseFloat(percent).toFixed(2));
  expect(message.uploadFilePercent).toBe(expectedResult);
});

it('Message instance sets file upload percentage from number string', () => {
  const percent = '100';
  message.setFileUploadPercent(percent);
  const expectedResult = Number(Number.parseFloat(percent).toFixed(2));
  expect(message.uploadFilePercent).toBe(expectedResult);
});

it('Message instance sets file upload percentage from non-number string', () => {
  const percent = 'hello';
  message.setFileUploadPercent(percent);
  const expectedResult = 0;
  expect(message.uploadFilePercent).toBe(expectedResult);
});
