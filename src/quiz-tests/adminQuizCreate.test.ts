// includes http tests for the route /v1/admin/quiz

import { Tokens } from '../dataStore';
import { requestDelete, requestGet, requestPost } from '../requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/quiz', () => {
  const error = { error: expect.any(String) };
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: Tokens, name: string, description: string };
  let token: { sessionId: number, authUserId: number };

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const { retval } = requestPost(userBody, '/v1/admin/auth/register');
    token = retval as { sessionId: number, authUserId: number };
  });

  describe('Testing for successful quiz creation', () => {
    beforeEach(() => {
      quizBody = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
    });

    test('Has correct return type', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      expect(res.retval).toStrictEqual({ quizId: expect.any(Number) });
    });

    test.skip('Side effect: quizList returns correct details about 1 quiz', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const listRes = requestGet({ token }, '/v1/admin/quiz/list');
      expect(listRes.retval).toStrictEqual({ quizzes: [{ quizId: res.retval, name: 'Valid Quiz Name' }] });
    });

    test.skip('Side effect: quizList returns correct details about multiple quizzes', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      quizBody = { token: token, name: 'Other Quiz Name', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      const listRes = requestGet({ token }, '/v1/admin/quiz/list');

      expect(listRes.retval).toStrictEqual({ quizzes: [{ quizId: res.retval, name: 'Valid Quiz Name' }, { quizId: res2.retval, name: 'Other Quiz Name' }] });
    });
  });

  describe('Testing status code 401', () => {
    describe('Testing invalid token', () => {
      test('Returns error when given invalid user ID', () => {
        token.authUserId += 1;
        quizBody = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
        const res = requestPost(quizBody, '/v1/admin/quiz');
        expect(res).toStrictEqual({ retval: error, statusCode: 401 });
      });

      test('Returns error when given invalid session ID', () => {
        token.sessionId += 1;
        quizBody = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
        const res = requestPost(quizBody, '/v1/admin/quiz');
        expect(res).toStrictEqual({ retval: error, statusCode: 401 });
      });

      test('Returns error when token is empty', () => {
        token = { sessionId: null, authUserId: null };
        quizBody.token = token;
        const res = requestPost(quizBody, '/v1/admin/quiz');

        expect(res).toStrictEqual({ retval: error, statusCode: 401 });
      });
    });
  });

  describe('Testing status code 400', () => {
    describe('Testing quiz name errors', () => {
      test('Quiz name contains invalid characters', () => {
        quizBody = { token: token, name: 'Invalid Quiz Name !@#$%^&*()', description: 'Valid Quiz Description' };
        const res = requestPost(quizBody, '/v1/admin/quiz');

        expect(res).toStrictEqual({ retval: error, statusCode: 400 });
      });

      test('Quiz name is less than 3 characters', () => {
        quizBody = { token: token, name: 'Hi', description: 'Valid Quiz Description' };
        const res = requestPost(quizBody, '/v1/admin/quiz');

        expect(res).toStrictEqual({ retval: error, statusCode: 400 });
      });

      test('Quiz name is more than 30 characters', () => {
        quizBody = { token: token, name: '1234567890 1234567890 1234567890', description: 'Valid Quiz Description' };
        const res = requestPost(quizBody, '/v1/admin/quiz');

        expect(res).toStrictEqual({ retval: error, statusCode: 400 });
      });

      test('Quiz name already used by current user for another quiz', () => {
        quizBody = { token: token, name: 'Name In Use', description: 'Valid Quiz Description' };
        requestPost(quizBody, '/v1/admin/quiz');

        quizBody = { token: token, name: 'Name In Use', description: 'Different Quiz' };
        const res = requestPost(quizBody, '/v1/admin/quiz');

        expect(res).toStrictEqual({ retval: error, statusCode: 400 });
      });
    });

    describe('Testing description error', () => {
      test('Quiz description is more than 100 characters', () => {
        const longString = '1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890';
        quizBody = { token: token, name: 'Valid Quiz Name', description: longString };
        const res = requestPost(quizBody, '/v1/admin/quiz');

        expect(res).toStrictEqual({ retval: error, statusCode: 400 });
      });
    });
  });
});
