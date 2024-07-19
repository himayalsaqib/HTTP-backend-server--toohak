// includes http tests for the route /v1/admin/quiz/trash and /v2/admin/quiz/trash

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

const ERROR = { error: expect.any(String) };

describe('GET /v1/admin/quiz/trash', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let token: string;

  describe('Testing for correct return type (status code 200)', () => {
    beforeEach(() => {
      userBody = { email: 'userone@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
      const registerUser = requestPost(userBody, '/v1/admin/auth/register');
      token = registerUser.retval.token;
      quizBody = { token: token, name: 'My Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Correctly displays a quiz in trash', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = res.retval.quizId;
      requestDelete({ token: token }, `/v1/admin/quiz/${quizId}`);

      const trashRes = requestGet({ token: token }, '/v1/admin/quiz/trash');
      expect(trashRes.statusCode).toStrictEqual(200);
      expect(trashRes.retval).toStrictEqual({
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
      requestDelete({ token: token }, `/v1/admin/quiz/${quizId}`);

      quizBody = { token: token, name: 'My Quiz Two', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      const quizId2 = res2.retval.quizId;
      requestDelete({ token: token }, `/v1/admin/quiz/${quizId2}`);

      const trashRes = requestGet({ token: token }, '/v1/admin/quiz/trash');
      expect(trashRes.statusCode).toStrictEqual(200);
      expect(trashRes.retval).toStrictEqual({
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
  });

  describe('Testing for empty or invalid Token (status code 401)', () => {
    beforeEach(() => {
      userBody = { email: 'userone@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
      const registerUser = requestPost(userBody, '/v1/admin/auth/register');
      token = registerUser.retval.token;
      quizBody = { token: token, name: 'My Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Returns errors when token is empty', () => {
      requestDelete({}, '/v1/clear');
      const res = requestDelete({ token: token }, '/v1/admin/quiz/trash');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Returns errors when sessionId is invalid', () => {
      const sessionId = parseInt(token) + 1;
      const res = requestDelete({ token: sessionId.toString() }, '/v1/admin/quiz/trash');
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });
});

describe('GET /v2/admin/quiz/trash', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { name: string, description: string };
  let token: string;

  describe('Testing for correct return type (status code 200)', () => {
    beforeEach(() => {
      userBody = { email: 'userone@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
      const registerUser = requestPost(userBody, '/v1/admin/auth/register');
      token = registerUser.retval.token;
      quizBody = { name: 'My Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Correctly displays a quiz in trash', () => {
      const res = requestPost(quizBody, '/v2/admin/quiz', { token });
      const quizId = res.retval.quizId;
      // change to v2
      requestDelete({ token: token }, `/v1/admin/quiz/${quizId}`);

      const trashRes = requestGet({}, '/v2/admin/quiz/trash', { token });
      expect(trashRes.statusCode).toStrictEqual(200);
      expect(trashRes.retval).toStrictEqual({
        quizzes: [
          {
            quizId: res.retval.quizId,
            name: 'My Quiz Name'
          }
        ]
      });
    });

    test('Correctly displays multiple quizzes in trash', () => {
      const res = requestPost(quizBody, '/v2/admin/quiz', { token });
      const quizId = res.retval.quizId;
      // change to v2
      requestDelete({ token: token }, `/v1/admin/quiz/${quizId}`);

      quizBody = { name: 'My Quiz Two', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v2/admin/quiz', { token });
      const quizId2 = res2.retval.quizId;
      // change to v2
      requestDelete({ token: token }, `/v1/admin/quiz/${quizId2}`);

      const trashRes = requestGet({}, '/v2/admin/quiz/trash', { token });
      expect(trashRes.statusCode).toStrictEqual(200);
      expect(trashRes.retval).toStrictEqual({
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
  });

  describe('Testing for empty or invalid Token (status code 401)', () => {
    beforeEach(() => {
      userBody = { email: 'userone@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
      const registerUser = requestPost(userBody, '/v1/admin/auth/register');
      token = registerUser.retval.token;
      quizBody = { name: 'My Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Returns errors when token is empty', () => {
      requestDelete({}, '/v1/clear');
      const res = requestGet({}, '/v2/admin/quiz/trash', { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Returns errors when sessionId is invalid', () => {
      token += '1';
      const res = requestGet({}, '/v2/admin/quiz/trash', { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });
});
