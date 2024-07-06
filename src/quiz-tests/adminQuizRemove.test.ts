// tests for adminQuizRemove function

import { Tokens } from '../dataStore';
import { requestDelete, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('DELETE /v1/admin/quiz/:quizid', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: Tokens, name: string, description: string };
  let token: { sessionId: number, authUserId: number };
  const error = { error: expect.any(String) };

  describe('Testing for correct return type (status code 200)', () => {
    beforeEach(() => {
      userBody = { email: 'userone@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
      const { retval } = requestPost(userBody, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
      quizBody = { token: token, name: 'My Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Successful removal of a quiz', () => {
      const createRes = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = createRes.retval.quizId;
      const removeRes = requestDelete(token, `/v1/admin/quiz/${quizId}`);
      expect(removeRes.retval).toStrictEqual({});
      expect(removeRes.statusCode).toBe(200);
    });

    test('Successful removal of multiple quizzes', () => {
      const res1 = requestPost(quizBody, '/v1/admin/quiz');
      const quizId1 = res1.retval.quizId;
      quizBody = { token: token, name: 'My Quiz Two', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      const quizId2 = res2.retval.quizId;

      let removeRes = requestDelete(token, `/v1/admin/quiz/${quizId1}`);
      removeRes = requestDelete(token, `/v1/admin/quiz/${quizId2}`);
      expect(removeRes.statusCode).toBe(200);
      expect(removeRes.retval).toStrictEqual({});
    });

    describe('Testing for invalid and empty token (status code 401', () => {
      test('Returns error when authUserId is not a valid user', () => {
        token.authUserId += 1;
        expect(requestDelete(token, '/v1/admin/quiz/:quizid')).toStrictEqual({
          retval: error,
          statusCode: 401
        });
      });

      test('Returns error when sessionId is invalid', () => {
        token.sessionId += 1;
        expect(requestDelete(token, '/v1/admin/quiz/:quizid')).toStrictEqual({
          retval: error,
          statusCode: 401
        });
      });

      test('Returns error when token is empty', () => {
        requestDelete({}, '/v1/clear');
        expect(requestDelete(token, '/v1/admin/quiz/:quizid')).toStrictEqual({
          retval: error,
          statusCode: 401
        });
      });
    });

    describe('Testing for valid token but wrong owner and non-existent quiz (status code 403', () => {
      test('Returns error when trying to remove quiz that has already been removed', () => {
        const res = requestPost(quizBody, '/v1/admin/quiz');
        const quizId = res.retval.quizId;
        const removeRes1 = requestDelete(token, `/v1/admin/quiz/${quizId}`);
        expect(removeRes1.retval).toStrictEqual({});
        expect(removeRes1.statusCode).toBe(200);

        const removeRes2 = requestDelete(token, `/v1/admin/quiz/${quizId}`);
        expect(removeRes2.statusCode).toBe(403);
        expect(removeRes2.retval).toStrictEqual(error);
      });

      test('Returns error when quiz does not belong to user', () => {
        const userBody2 = { email: 'user2@gmail.com', password: 'Password024', nameFirst: 'User', nameLast: 'Two' };
        const { retval: registerRes2 } = requestPost(userBody2, '/v1/admin/auth/register');
        const token2 = registerRes2 as { sessionId: number, authUserId: number };

        const res = requestPost(quizBody, '/v1/admin/quiz');
        const quizId = res.retval.quizId;

        const removeRes = requestDelete(token2, `/v1/admin/quiz/${quizId}`);
        expect(removeRes.statusCode).toBe(403);
        expect(removeRes.retval).toStrictEqual(error);
      });

      test('Returns error when quiz does not exist', () => {
        const res = requestPost(quizBody, '/v1/admin/quiz');
        quizBody = { token: token, name: 'My Quiz Two', description: 'Other Quiz Description' };
        const quizId = res.retval.quizId + 1;
        const removeRes = requestDelete(token, `/v1/admin/quiz/${quizId}`);
        expect(removeRes.statusCode).toBe(403);
        expect(removeRes.retval).toStrictEqual(error);
      });
    });
  });
});
