// tests for adminQuizTrashEmpty function

import { Tokens } from '../dataStore';
import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/quiz/trash', () => {
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

    test('Correctly displays a quiz in trash', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = res.retval.quizId;
      requestDelete(token, `/v1/admin/quiz/${quizId}`);

      const trashRes = requestGet(token, '/v1/admin/quiz/trash');
      expect(trashRes.statusCode).toBe(200);
      expect(trashRes.retval.quizzes).toStrictEqual({
          quizzes: [
            {
              quizId: res.retval.quizId,
              name: 'My Quiz Name'
            }
          ]
      });
    });

    test('Correctly displays multiple quizzes in trash', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = res.retval.quizId;
      requestDelete(token, `/v1/admin/quiz/${quizId}`);

      quizBody = { token: token, name: 'My Quiz Two', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      const quizId2 = res2.retval.quizId;
      requestDelete(token, `/v1/admin/quiz/${quizId2}`);

      const trashRes = requestGet(token, '/v1/admin/quiz/trash');
      expect(trashRes.retval.quizzes).toStrictEqual({
          quizzes: [
            {
              quizId: res.retval.quizId,
              name: 'My Quiz Name'
            },
            {
              quizId: res2.retval.quizId,
              name: 'My Quiz Two'
            }
          ]
      });
    });

    test.skip('Side effect: correctly displays trash after quiz had been restored', () => {
      let res = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = res.retval.quizId;
      requestDelete(token, `/v1/admin/quiz/${quizId}`);

      res = requestPost(token, `/v1/admin/quiz/${quizId}/restore`);
      const trashRes = requestGet(token, '/v1/admin/quiz/trash');
      expect(trashRes).toStrictEqual({ retval: { quizzes: [] }, statusCode: 200 });
    });

    test.skip('Side effect: correctly displays empty trash after trash has been emptied', () => {
      let res = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = res.retval.quizId;
      requestDelete(token, `/v1/admin/quiz/${quizId}`);

      res = requestDelete(token, '/v1/admin/quiz/trash/empty');
      const trashRes = requestGet(token, '/v1/admin/quiz/trash');
      expect(trashRes).toStrictEqual({ retval: { quizzes: [] }, statusCode: 200 });
    });
  });

  describe('Testing for empty or invalid Token (status code 401)', () => {
    beforeEach(() => {
      userBody = { email: 'userone@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
      const { retval } = requestPost(userBody, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
      quizBody = { token: token, name: 'My Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Returns errors when authUserId is not a valid user', () => {
      token.authUserId += 1;
      const res = requestDelete(token, '/v1/admin/quiz/trash');
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('Returns errors when token is empty', () => {
      requestDelete({}, '/v1/clear');
      const res = requestDelete(token, '/v1/admin/quiz/trash');
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('Returns errors when sessionId is invalid', () => {
      token.sessionId += 1;
      const res = requestDelete(token, '/v1/admin/quiz/trash');
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });
  });
});
