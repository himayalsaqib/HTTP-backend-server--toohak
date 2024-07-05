// includes http tests for the route /v1/admin/quiz/{quizid}/restore

import { Tokens } from '../dataStore';
import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/quiz/:quizid/restore', () => {
  const error = { error: expect.any(String) };
  let token: { sessionId: number, authUserId: number };
  let quizId: number;
  let user: { email: string, password: string, nameFirst: string, nameLast: string };
  let quiz: { token: Tokens, name: string, description: string };

  describe('Testing successful cases (status code 200)', () => {
    beforeEach(() => {
      // register a user
      user = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(user, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };

      // create a quiz
      quiz = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
      const createQuizRes = requestPost(quiz, '/v1/admin/quiz');
      quizId = createQuizRes.retval.quizId;

      // delete the quiz
      requestDelete(token, `/v1/admin/quiz/${quizId}`);
    });

    test('Has correct return type', () => {
      const res = requestPost(token, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect (successful restoration): quizList returns details of restored quiz', () => {
      let res = requestPost(token, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

      res = requestGet(token, '/v1/admin/quiz/list');
      expect(res).toStrictEqual({
        retval: {
          quizzes: [{ quizId: quizId, name: 'Valid Quiz Name' }]
        },
        statusCode: 200
      });
    });

    test.skip('Side effect (successful restoration): quizInfo displays correct timeLastEdited', () => {
      const time = parseFloat((Date.now() / 1000).toFixed(10));
      let res = requestPost(token, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

      res = requestGet(token, `/v1/admin/quiz/${quizId}`);
      expect(res.retval.timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(res.retval.timeLastEdited).toBeLessThanOrEqual(time + 1);
    });
  });

  describe('Testing quiz name error (status code 400)', () => {
    beforeEach(() => {
      // register a user
      user = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(user, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };

      // create a quiz
      quiz = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
      const createQuizRes = requestPost(quiz, '/v1/admin/quiz');
      quizId = createQuizRes.retval.quizId;

      // delete the quiz
      requestDelete(token, `/v1/admin/quiz/${quizId}`);

      // create a quiz with the same name as the deleted quiz
      quiz = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
      requestPost(quiz, '/v1/admin/quiz');
    });

    test('Quiz name of the restored quiz is already used by another active quiz', () => {
      const res = requestPost(token, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    });
  });

  describe('Testing error for a quiz that has not been deleted (status code 400)', () => {
    beforeEach(() => {
      // register a user
      user = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(user, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };

      // create a quiz
      quiz = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
      const createQuizRes = requestPost(quiz, '/v1/admin/quiz');
      quizId = createQuizRes.retval.quizId;
    });

    test('Quiz ID refers to a quiz that is not currently in the trash', () => {
      const res = requestPost(token, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    beforeEach(() => {
      // register a user
      user = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(user, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };

      // create a quiz
      quiz = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
      const createQuizRes = requestPost(quiz, '/v1/admin/quiz');
      quizId = createQuizRes.retval.quizId;

      // delete the quiz
      requestDelete(token, `/v1/admin/quiz/${quizId}`);
    });

    test('Token is empty (no users registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPost(token, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('Session ID is invalid', () => {
      token.sessionId += 1;
      const res = requestPost(token, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('User ID is invalid', () => {
      token.authUserId += 1;
      const res = requestPost(token, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });
  });

  describe('Testing quizId errors (status code 403)', () => {
    beforeEach(() => {
      // register a user
      user = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(user, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };

      // create a quiz
      quiz = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
      const createQuizRes = requestPost(quiz, '/v1/admin/quiz');
      quizId = createQuizRes.retval.quizId;

      // delete the quiz
      requestDelete(token, `/v1/admin/quiz/${quizId}`);
    });

    test('Current user does not own the quiz', () => {
      // register a second user
      const user2 = { email: 'valid2@gmail.com', password: 'Password12', nameFirst: 'Jamie', nameLast: 'David' };
      const { retval } = requestPost(user2, '/v1/admin/auth/register');
      const token2 = retval as { sessionId: number, authUserId: number };

      // create a quiz for the second user
      quiz = { token: token2, name: 'Other Valid Quiz Name', description: 'Other Valid Quiz Description' };
      const createQuizRes2 = requestPost(quiz, '/v1/admin/quiz');
      const quizId2 = createQuizRes2.retval.quizId;

      // delete second user's quiz
      requestDelete(token2, `/v1/admin/quiz/${quizId2}`);

      // first user tries to restore second user's deleted quiz
      const res = requestPost(token, `/v1/admin/quiz/${quizId2}/restore`);
      expect(res).toStrictEqual({ retval: error, statusCode: 403 });
    });

    test('Quiz ID does not exist', () => {
      const res = requestPost(token, `/v1/admin/quiz/${quizId + 1}/restore`);
      expect(res).toStrictEqual({ retval: error, statusCode: 403 });
    });
  });
});
