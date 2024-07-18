// includes http tests for the route /v1/admin/quiz/list and /v2/admin/quiz/list

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

const ERROR = { error: expect.any(String) };

describe('GET /v1/admin/quiz/list', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let token: string;

  describe('Testing for correct return type (status code 200)', () => {
    beforeEach(() => {
      userBody = { email: 'user@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
      const registerUser = requestPost(userBody, '/v1/admin/auth/register');
      token = registerUser.retval.token;
      quizBody = { token: token, name: 'My Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Correctly returns quiz list that contains 1 quiz', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const listRes = requestGet({ token: token }, '/v1/admin/quiz/list');
      expect(listRes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: res.retval.quizId,
              name: 'My Quiz Name',
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Correctly returns quiz list that contains multiple quizzes', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      quizBody = { token: token, name: 'My Quiz Two', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      const listRes = requestGet({ token: token }, '/v1/admin/quiz/list');
      expect(listRes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: res.retval.quizId,
              name: 'My Quiz Name',
            },
            {
              quizId: res2.retval.quizId,
              name: 'My Quiz Two',
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Correctly returns quiz list after a quiz has been removed', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      quizBody = { token: token, name: 'My Quiz Two', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      const quizId2 = res2.retval.quizId;

      requestDelete({ token: token }, `/v1/admin/quiz/${quizId2}`);
      const listRes = requestGet({ token: token }, '/v1/admin/quiz/list');

      expect(listRes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: res.retval.quizId,
              name: 'My Quiz Name',
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Correctly returns quiz list that contains no quizzes', () => {
      const listRes = requestGet({ token: token }, '/v1/admin/quiz/list');
      expect(listRes).toStrictEqual({
        retval: {
          quizzes: []
        },
        statusCode: 200
      });
    });
  });

  describe('Testing invalid token (status code 401)', () => {
    test('Returns error when token is empty', () => {
      requestDelete({}, '/v1/clear');
      expect(requestGet({ token: token }, '/v1/admin/quiz/list')).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Returns error when sessionId is invalid', () => {
      const sessionId = parseInt(token) + 1;
      expect(requestGet({ token: sessionId.toString }, '/v1/admin/quiz/list')).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });
});

describe('GET /v2/admin/quiz/list', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { name: string, description: string };
  let token: string;

  describe('Testing for correct return type (status code 200)', () => {
    beforeEach(() => {
      userBody = { email: 'user@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
      const registerUser = requestPost(userBody, '/v1/admin/auth/register');
      token = registerUser.retval.token;
      quizBody = { name: 'My Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Correctly returns quiz list that contains 1 quiz', () => {
      const res = requestPost(quizBody, '/v2/admin/quiz', { token });
      const listRes = requestGet({}, '/v2/admin/quiz/list', { token });
      expect(listRes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: res.retval.quizId,
              name: 'My Quiz Name',
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Correctly returns quiz list that contains multiple quizzes', () => {
      const res = requestPost(quizBody, '/v2/admin/quiz', { token });
      quizBody = { name: 'My Quiz Two', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v2/admin/quiz', { token });
      const listRes = requestGet({}, '/v2/admin/quiz/list', { token });
      expect(listRes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: res.retval.quizId,
              name: 'My Quiz Name',
            },
            {
              quizId: res2.retval.quizId,
              name: 'My Quiz Two',
            }
          ]
        },
        statusCode: 200
      });
    });

    test.skip('Correctly returns quiz list after a quiz has been removed', () => {
      const res = requestPost(quizBody, '/v2/admin/quiz', { token });
      quizBody = { name: 'My Quiz Two', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      const quizId2 = res2.retval.quizId;

      requestDelete({ token: token }, `/v1/admin/quiz/${quizId2}`);
      const listRes = requestGet({}, '/v2/admin/quiz/list', { token });

      expect(listRes).toStrictEqual({
        retval: {
          quizzes: [
            {
              quizId: res.retval.quizId,
              name: 'My Quiz Name',
            }
          ]
        },
        statusCode: 200
      });
    });

    test('Correctly returns quiz list that contains no quizzes', () => {
      const listRes = requestGet({}, '/v2/admin/quiz/list', { token });
      expect(listRes).toStrictEqual({
        retval: {
          quizzes: []
        },
        statusCode: 200
      });
    });
  });

  describe('Testing invalid token (status code 401)', () => {
    test('Returns error when token is empty', () => {
      requestDelete({}, '/v1/clear');
      expect(requestGet({}, '/v2/admin/quiz/list', { token })).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });

    test('Returns error when sessionId is invalid', () => {
      const sessionId = (parseInt(token) + 1).toString();
      expect(requestGet({}, '/v2/admin/quiz/list', { token: sessionId })).toStrictEqual({
        retval: ERROR,
        statusCode: 401
      });
    });
  });
});
