// includes http tests for the route /v1/admin/quiz and /v2/admin/quiz 

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/quiz', () => {
  const error = { error: expect.any(String) };
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let token: string;

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerUser = requestPost(userBody, '/v1/admin/auth/register');
    token = registerUser.retval.token;
    quizBody = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has correct return type', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      expect(res).toStrictEqual({ retval: { quizId: expect.any(Number) }, statusCode: 200 });
    });

    test('Side effect (successful quiz creation): quizList returns correct details about 1 quiz', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const listRes = requestGet({ token: token }, '/v1/admin/quiz/list');
      expect(listRes).toStrictEqual({ retval: { quizzes: [{ quizId: res.retval.quizId, name: 'Valid Quiz Name' }] }, statusCode: 200 });
    });

    test('Side effect (successful quiz creation): quizList returns correct details about multiple quizzes', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      quizBody = { token: token, name: 'Other Quiz Name', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v1/admin/quiz');
      const listRes = requestGet({ token: token }, '/v1/admin/quiz/list');

      expect(listRes.retval).toStrictEqual({ quizzes: [{ quizId: res.retval.quizId, name: 'Valid Quiz Name' }, { quizId: res2.retval.quizId, name: 'Other Quiz Name' }] });
      expect(listRes.statusCode).toStrictEqual(200);
    });

    test('Side effect (successful quiz creation): adminQuizInfo displays correct timeCreated', () => {
      const time = Math.floor(Date.now() / 1000);
      const res = requestPost(quizBody, '/v1/admin/quiz');

      const infoRes = requestGet({ token: token }, `/v1/admin/quiz/${res.retval.quizId}`);
      expect(infoRes.retval.timeCreated).toBeGreaterThanOrEqual(time);
      expect(infoRes.retval.timeCreated).toBeLessThanOrEqual(time + 1);
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Given invalid session ID', () => {
      const sessionId = parseInt(token) + 1;
      quizBody = { token: sessionId.toString(), name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
      const res = requestPost(quizBody, '/v1/admin/quiz');
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPost(quizBody, '/v1/admin/quiz');

      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });
  });

  describe('Testing name and description errors (status code 400)', () => {
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

//////////////////////////////////////////////////////////////////////////////

describe('POST /v2/admin/quiz', () => {
  const error = { error: expect.any(String) };
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { name: string, description: string };
  let token: string;

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerUser = requestPost(userBody, '/v1/admin/auth/register');
    token = registerUser.retval.token;
    quizBody = { name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has correct return type', () => {
      const res = requestPost(quizBody, '/v2/admin/quiz', { token });
      expect(res).toStrictEqual({ retval: { quizId: expect.any(Number) }, statusCode: 200 });
    });

    test.skip('Side effect (successful quiz creation): quizList returns correct details about 1 quiz', () => {
      const res = requestPost(quizBody, '/v2/admin/quiz', { token });
      const listRes = requestGet({}, '/v2/admin/quiz/list', { token });
      expect(listRes).toStrictEqual({ retval: { quizzes: [{ quizId: res.retval.quizId, name: 'Valid Quiz Name' }] }, statusCode: 200 });
    });

    test.skip('Side effect (successful quiz creation): quizList returns correct details about multiple quizzes', () => {
      const res = requestPost(quizBody, '/v2/admin/quiz', { token });
      quizBody = { name: 'Other Quiz Name', description: 'Other Quiz Description' };
      const res2 = requestPost(quizBody, '/v2/admin/quiz', { token });
      const listRes = requestGet({}, '/v1/admin/quiz/list', { token });

      expect(listRes.retval).toStrictEqual({ quizzes: [{ quizId: res.retval.quizId, name: 'Valid Quiz Name' }, { quizId: res2.retval.quizId, name: 'Other Quiz Name' }] });
      expect(listRes.statusCode).toStrictEqual(200);
    });

    test.skip('Side effect (successful quiz creation): adminQuizInfo displays correct timeCreated', () => {
      const time = Math.floor(Date.now() / 1000);
      const res = requestPost(quizBody, '/v2/admin/quiz', { token });

      const infoRes = requestGet({}, `/v2/admin/quiz/${res.retval.quizId}`, { token });
      expect(infoRes.retval.timeCreated).toBeGreaterThanOrEqual(time);
      expect(infoRes.retval.timeCreated).toBeLessThanOrEqual(time + 1);
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Given invalid session ID', () => {
      const sessionId = (parseInt(token) + 1).toString();
      quizBody = { name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
      const res = requestPost(quizBody, '/v2/admin/quiz', { token: sessionId });

      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPost(quizBody, '/v2/admin/quiz', { token });

      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });
  });

  describe('Testing name and description errors (status code 400)', () => {
    describe('Testing quiz name errors', () => {
      test('Quiz name contains invalid characters', () => {
        quizBody = { name: 'Invalid Quiz Name !@#$%^&*()', description: 'Valid Quiz Description' };
        const res = requestPost(quizBody, '/v2/admin/quiz', { token });

        expect(res).toStrictEqual({ retval: error, statusCode: 400 });
      });

      test('Quiz name is less than 3 characters', () => {
        quizBody = { name: 'Hi', description: 'Valid Quiz Description' };
        const res = requestPost(quizBody, '/v2/admin/quiz', { token });

        expect(res).toStrictEqual({ retval: error, statusCode: 400 });
      });

      test('Quiz name is more than 30 characters', () => {
        quizBody = { name: '1234567890 1234567890 1234567890', description: 'Valid Quiz Description' };
        const res = requestPost(quizBody, '/v2/admin/quiz', { token });

        expect(res).toStrictEqual({ retval: error, statusCode: 400 });
      });

      test('Quiz name already used by current user for another quiz', () => {
        quizBody = { name: 'Name In Use', description: 'Valid Quiz Description' };
        requestPost(quizBody, '/v2/admin/quiz', { token });

        quizBody = { name: 'Name In Use', description: 'Different Quiz' };
        const res = requestPost(quizBody, '/v2/admin/quiz', { token });

        expect(res).toStrictEqual({ retval: error, statusCode: 400 });
      });
    });

    describe('Testing description error', () => {
      test('Quiz description is more than 100 characters', () => {
        const longString = '1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890 1234567890';
        quizBody = { name: 'Valid Quiz Name', description: longString };
        const res = requestPost(quizBody, '/v2/admin/quiz', { token });

        expect(res).toStrictEqual({ retval: error, statusCode: 400 });
      });
    });
  });
});
