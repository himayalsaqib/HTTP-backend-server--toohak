// includes http tests for the route /v1/admin/quiz/{quizid}/transfer

import { requestPost, requestDelete, requestGet } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/quiz/{quizid}/transfer', () => {
  const error = { error: expect.any(String) };
  let token: string;
  let token2: string;
  let userBody1: { email: string, password: string, nameFirst: string, nameLast: string };
  let userBody2: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let transferBody: { token: string, userEmail: string };
  let quizId: number;
  let userEmail: string;

  describe('Testing successful cases (status code 200)', () => {
    beforeEach(() => {
      // register user1
      userBody1 = { email: 'valid@gmail.com', password: 'Password123', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerUser1 = requestPost(userBody1, '/v1/admin/auth/register');
      token = registerUser1.retval.token;

      // register user2
      userBody2 = { email: 'newEmail@gmail.com', password: 'ValidPa55word', nameFirst: 'John', nameLast: 'Smith' };
      const registerUser2 = requestPost(userBody2, '/v1/admin/auth/register');
      token2 = registerUser2.retval.token2;

      // create quiz for user1
      quizBody = { token: token, name: 'Valid Quiz Name', description: 'A valid quiz description' };
      const res = requestPost(quizBody, '/v1/admin/quiz');
      quizId = res.retval.quizId;

      // userEmail is not associated with token
      userEmail = 'newEmail@gmail.com';
      transferBody = { token: token, userEmail: userEmail };
    });

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

    test('Side effect: the correct timeLastEdited is given when displaying quiz information', () => {
      const res = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      const time = Math.floor(Date.now() / 1000);
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
    beforeEach(() => {
      // register user1
      userBody1 = { email: 'valid@gmail.com', password: 'Password123', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerUser1 = requestPost(userBody1, '/v1/admin/auth/register');
      token = registerUser1.retval.token;

      // register user2
      userBody2 = { email: 'newEmail@gmail.com', password: 'ValidPa55word', nameFirst: 'John', nameLast: 'Smith' };
      const registerUser2 = requestPost(userBody2, '/v1/admin/auth/register');
      token2 = registerUser2.retval.token2;

      // create quiz for user1
      quizBody = { token: token, name: 'Valid Quiz Name', description: 'A valid quiz description' };
      const res = requestPost(quizBody, '/v1/admin/quiz');
      quizId = res.retval.quizId;
    });

    test('userEmail is not a real user', () => {
      transferBody = { token: token, userEmail: 'notUserEmail@gmail.com' };
      const transfer = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      expect(transfer).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('userEmail is the current logged in user', () => {
      // logout user2
      requestPost({ token: token2 }, '/v1/admin/auth/logout');

      transferBody = { token: token, userEmail: userBody2.email };
      const transfer = requestPost(transferBody, `/v1/admin/quiz/${quizId}/question`);
      expect(transfer).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test.todo('Quiz Id refers to a quiz that has a name that is already used by the target user');
  });

  describe('Testing token errors (status code 401)', () => {
    test('Token is empty (no users registered)', () => {
      transferBody = { token: token, userEmail: 'validemail@gmail.com' };
      const res = requestPost(transferBody, `/v1/admin/quiz/${quizId}/transfer`);
      expect(res).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });

    test.todo('Session ID is invalid');
  });

  describe('Testing quiz ID errors (status code 403)', () => {
    beforeEach(() => {

    });

    test.todo('User is not an owner of this quiz');

    test.todo('The quiz does not exist');
  });
});
