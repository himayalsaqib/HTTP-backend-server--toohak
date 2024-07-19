// includes http tests for the route /v1/admin/quiz/{quizid}/transfer and
// /v2/admin/quiz/{quizid}/transfer

import { requestPost, requestDelete, requestGet } from '../helper-files/requestHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/quiz/{quizid}/transfer', () => {
  let token: string;
  let token2: string;
  let userBody1: { email: string, password: string, nameFirst: string, nameLast: string };
  let userBody2: { email: string, password: string, nameFirst: string, nameLast: string };
  let userBody3: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let transferBody: { token: string, userEmail: string };
  let quizId: number;
  let quizId2: number;
  let userEmail: string;

  beforeEach(() => {
    // register user1
    userBody1 = { email: 'valid@gmail.com', password: 'Password123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerUser1 = requestPost(userBody1, '/v1/admin/auth/register');
    token = registerUser1.retval.token;

    // register user2
    userBody2 = { email: 'newEmail@gmail.com', password: 'ValidPa55word', nameFirst: 'John', nameLast: 'Smith' };
    const registerUser2 = requestPost(userBody2, '/v1/admin/auth/register');
    token2 = registerUser2.retval.token;

    // create quiz for user1
    quizBody = { token: token, name: 'Valid Quiz Name', description: 'A valid quiz description' };
    const res = requestPost(quizBody, '/v1/admin/quiz');
    quizId = res.retval.quizId;

    // userEmail not associated with token
    userEmail = 'newEmail@gmail.com';
    transferBody = { token: token, userEmail: userEmail };
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has the correct return type', () => {
      const res = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      expect(res).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });

    test('Side effect: the quiz is no longer listed for that user and is listed to the other user', () => {
      const res = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      expect(res).toStrictEqual({
        retval: {},
        statusCode: 200
      });

      let listQuizzes = requestGet({ token: token }, '/v1/admin/quiz/list');
      expect(listQuizzes).toStrictEqual({
        retval: {
          quizzes: []
        },
        statusCode: 200
      });

      listQuizzes = requestGet({ token: token2 }, '/v1/admin/quiz/list');
      expect(listQuizzes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: quizId,
              name: quizBody.name
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Side effect: a quiz is transferred from user with multiple quizzes', () => {
      // create another quiz for user1
      quizBody = { token: token, name: 'The second quiz', description: 'A second valid quiz' };
      const res = requestPost(quizBody, '/v1/admin/quiz');
      quizId2 = res.retval.quizId;

      expect(requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`)).toStrictEqual({
        retval: {},
        statusCode: 200
      });

      let listQuizzes = requestGet({ token: token }, '/v1/admin/quiz/list');
      expect(listQuizzes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: quizId2,
              name: quizBody.name
            }
          ]
        },
        statusCode: 200
      });

      listQuizzes = requestGet({ token: token2 }, '/v1/admin/quiz/list');
      expect(listQuizzes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: quizId,
              name: 'Valid Quiz Name'
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Side effect: the correct timeLastEdited is given when displaying quiz information', () => {
      const time = Math.floor(Date.now() / 1000);
      const res = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      expect(res).toStrictEqual({
        retval: {},
        statusCode: 200
      });

      const quizInfo = requestGet({ token: token2 }, `/v1/admin/quiz/${quizId}`);
      expect(quizInfo.retval.timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(quizInfo.retval.timeLastEdited).toBeLessThanOrEqual(time + 1);
    });
  });

  describe('Testing userEmail and quiz name errors (status code 400)', () => {
    test('userEmail is not a real user', () => {
      transferBody = { token: token, userEmail: 'notUserEmail@gmail.com' };
      const transfer = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('userEmail is the current logged in user', () => {
      transferBody = { token: token, userEmail: userBody1.email };
      const transfer = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('Quiz Id refers to a quiz that has a name that is already used by the target user', () => {
      // create quiz for user2 with same name
      quizBody = { token: token2, name: 'Valid Quiz Name', description: 'Another valid quiz description' };
      requestPost(quizBody, '/v1/admin/quiz');

      transferBody = { token: token, userEmail: userBody2.email };
      const transfer = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Token is empty (no users registered)', () => {
      requestDelete({}, '/v1/clear');
      transferBody = { token: token, userEmail: 'validemail@gmail.com' };
      const res = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Session ID is invalid', () => {
      // make sessionId invalid
      const sessionId = parseInt(token) + 1;
      transferBody = { token: sessionId.toString(), userEmail: userEmail };

      const transfer = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });

  describe('Testing quiz ID errors (status code 403)', () => {
    beforeEach(() => {
      // register user3
      userBody3 = { email: 'email@gmail.com', password: 'aPassw0rd', nameFirst: 'Betty', nameLast: 'Miller' };
      requestPost(userBody3, '/v1/admin/auth/register');

      // create quiz for user2
      quizBody = { token: token2, name: 'Valid Quiz Name', description: 'A valid quiz description' };
      requestPost(quizBody, '/v1/admin/quiz');
    });

    test('User is not an owner of this quiz', () => {
      userEmail = 'email@gmail.com';
      transferBody = { token: token2, userEmail: userEmail };

      // transfer user2's quiz to user3 with user1's quizId
      const transfer = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });

    test('The quiz does not exist', () => {
      transferBody = { token: token, userEmail: userBody2.email };
      const transfer = requestPost(transferBody, `/v1/admin/quiz/${quizId + 1}/transfer`);
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });
  });
});

describe('POST /v2/admin/quiz/{quizid}/transfer', () => {
  let token: string;
  let token2: string;
  let userBody1: { email: string, password: string, nameFirst: string, nameLast: string };
  let userBody2: { email: string, password: string, nameFirst: string, nameLast: string };
  let userBody3: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { name: string, description: string };
  let transferBody: { userEmail: string };
  let quizId: number;
  let quizId2: number;
  let userEmail: string;

  beforeEach(() => {
    // register user1
    userBody1 = { email: 'valid@gmail.com', password: 'Password123', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerUser1 = requestPost(userBody1, '/v1/admin/auth/register');
    token = registerUser1.retval.token;

    // register user2
    userBody2 = { email: 'newEmail@gmail.com', password: 'ValidPa55word', nameFirst: 'John', nameLast: 'Smith' };
    const registerUser2 = requestPost(userBody2, '/v1/admin/auth/register');
    token2 = registerUser2.retval.token;

    // create quiz for user1
    quizBody = { name: 'Valid Quiz Name', description: 'A valid quiz description' };
    const res = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = res.retval.quizId;

    // userEmail not associated with token
    userEmail = 'newEmail@gmail.com';
    transferBody = { userEmail: userEmail };
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has the correct return type', () => {
      const res = requestPost({ userEmail }, `/v2/admin/quiz/${quizId}/transfer`, { token });
      expect(res).toStrictEqual({
        retval: {},
        statusCode: 200
      });
    });

    test('Side effect: the quiz is no longer listed for that user and is listed to the other user', () => {
      const res = requestPost({ userEmail }, `/v2/admin/quiz/${quizId}/transfer`, { token });
      expect(res).toStrictEqual({
        retval: {},
        statusCode: 200
      });

      let listQuizzes = requestGet({}, '/v2/admin/quiz/list', { token });
      expect(listQuizzes).toStrictEqual({
        retval: {
          quizzes: []
        },
        statusCode: 200
      });

      listQuizzes = requestGet({}, '/v2/admin/quiz/list', { token: token2 });
      expect(listQuizzes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: quizId,
              name: quizBody.name
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Side effect: a quiz is transferred from user with multiple quizzes', () => {
      // create another quiz for user1
      quizBody = { name: 'The second quiz', description: 'A second valid quiz' };
      const res = requestPost(quizBody, '/v2/admin/quiz', { token });
      quizId2 = res.retval.quizId;

      expect(requestPost({ userEmail }, `/v2/admin/quiz/${quizId}/transfer`, { token })).toStrictEqual({
        retval: {},
        statusCode: 200
      });

      let listQuizzes = requestGet({}, '/v2/admin/quiz/list', { token });
      expect(listQuizzes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: quizId2,
              name: quizBody.name
            }
          ]
        },
        statusCode: 200
      });

      listQuizzes = requestGet({}, '/v2/admin/quiz/list', { token: token2 });
      expect(listQuizzes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: quizId,
              name: 'Valid Quiz Name'
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Side effect: the correct timeLastEdited is given when displaying quiz information', () => {
      const time = Math.floor(Date.now() / 1000);
      const res = requestPost({ userEmail }, `/v2/admin/quiz/${quizId}/transfer`, { token });
      expect(res).toStrictEqual({
        retval: {},
        statusCode: 200
      });

      const quizInfo = requestGet({}, `/v2/admin/quiz/${quizId}`, { token: token2 });
      expect(quizInfo.retval.timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(quizInfo.retval.timeLastEdited).toBeLessThanOrEqual(time + 1);
    });
  });

  describe('Testing userEmail and quiz name errors (status code 400)', () => {
    test('userEmail is not a real user', () => {
      const transfer = requestPost({ userEmail: 'notUserEmail@gmail.com' }, `/v2/admin/quiz/${quizId}/transfer`, { token });
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('userEmail is the current logged in user', () => {
      const transfer = requestPost({ userEmail: userBody1.email }, `/v2/admin/quiz/${quizId}/transfer`, { token });
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test('Quiz Id refers to a quiz that has a name that is already used by the target user', () => {
      // create quiz for user2 with same name
      quizBody = { name: 'Valid Quiz Name', description: 'Another valid quiz description' };
      requestPost(quizBody, '/v2/admin/quiz', { token: token2 });

      const transfer = requestPost({ userEmail: userBody2.email }, `/v2/admin/quiz/${quizId}/transfer`, { token });
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });

    test.skip('Any session for this quiz is not in END state', () => {
      // make a session not in END state
      const transfer = requestPost(transferBody, `/v2/admin/quiz/${quizId}/transfer`, { token });
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 400
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Token is empty (no users registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPost({ userEmail: 'validemail@gmail.com' }, `/v2/admin/quiz/${quizId}/transfer`, { token });
      expect(res).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Session ID is invalid', () => {
      // make sessionId invalid
      const sessionId = parseInt(token) + 1;

      const transfer = requestPost({ userEmail }, `/v2/admin/quiz/${quizId}/transfer`, { token: sessionId.toString() });
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });

  describe('Testing quiz ID errors (status code 403)', () => {
    beforeEach(() => {
      // register user3
      userBody3 = { email: 'email@gmail.com', password: 'aPassw0rd', nameFirst: 'Betty', nameLast: 'Miller' };
      requestPost(userBody3, '/v1/admin/auth/register');

      // create quiz for user2
      quizBody = { name: 'Valid Quiz Name', description: 'A valid quiz description' };
      requestPost(quizBody, '/v2/admin/quiz', { token: token2 });
    });

    test('User is not an owner of this quiz', () => {
      userEmail = 'email@gmail.com';

      // transfer user2's quiz to user3 with user1's quizId
      const transfer = requestPost({ userEmail }, `/v2/admin/quiz/${quizId}/transfer`, { token: token2 });
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });

    test('The quiz does not exist', () => {
      const transfer = requestPost({ userEmail: userBody2.email }, `/v2/admin/quiz/${quizId + 1}/transfer`, { token });
      expect(transfer).toStrictEqual({
        retval: ERROR,
        statusCode: 403
      });
    });
  });
});
