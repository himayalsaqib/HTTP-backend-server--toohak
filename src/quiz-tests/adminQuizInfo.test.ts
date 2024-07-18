// includes http tests for the route /v1/admin/quiz:quizid and /v2/admin/quiz:quizid

import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/quiz:quizid', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let token: string;

  let quiz: { token: string, name: string };
  let quizId: number;

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    quizBody = { token: token, name: 'Original Quiz Name', description: 'Quiz description' };
    const quizResponse = requestPost(quizBody, '/v1/admin/quiz');
    quizId = quizResponse.retval.quizId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Quiz info of a new quiz was successful and has correct return type', () => {
      const res = requestGet({ token: token }, `/v1/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({
        retval: {
          quizId: res.retval.quizId,
          name: 'Original Quiz Name',
          timeCreated: expect.any(Number),
          description: 'Quiz description',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        },
        statusCode: 200
      });
    });

    test('Quiz info of an edited quiz was successful and has correct return type', () => {
      quiz = { token: token, name: 'Updated Quiz Name' };
      requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);
      const res = requestGet({ token: token }, `/v1/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({
        retval: {
          quizId: res.retval.quizId,
          name: 'Updated Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz description',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        },
        statusCode: 200
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Given invalid session ID', () => {
      const sessionId = parseInt(token) + 1;
      const res = requestGet({ token: sessionId.toString() }, `/v1/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestGet({ token: token }, `/v1/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing quizId errors (status code 403)', () => {
    test('User is not an owner of this quiz', () => {
      const otherUserBody = { email: 'otherUser@gmail.com', password: 'Password23', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const otherUserResponse = requestPost(otherUserBody, '/v1/admin/auth/register');
      const otherUserToken = otherUserResponse.retval.token;

      const res = requestGet({ token: otherUserToken }, `/v1/admin/quiz/${quizId}`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });

    test("Quiz doesn't exist", () => {
      const res = requestGet({ token: token }, `/v1/admin/quiz/${quizId + 1}`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });
});

describe('GET /v2/admin/quiz:quizid', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let token: string;

  let quiz: { token: string, name: string };
  let quizId: number;


  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    quizBody = { token: token, name: 'Original Quiz Name', description: 'Quiz description' };
    const quizResponse = requestPost(quizBody, '/v1/admin/quiz'); //change to v2
    quizId = quizResponse.retval.quizId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Quiz info of a new quiz was successful and has correct return type', () => {
      const res = requestGet(`/v2/admin/quiz/${quizId}`, { Token: token });
      expect(res).toStrictEqual({
        retval: {
          quizId: res.retval.quizId,
          name: 'Original Quiz Name',
          timeCreated: expect.any(Number),
          description: 'Quiz description',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        },
        statusCode: 200
      });
    });

    test('Quiz info of an edited quiz was successful and has correct return type', () => {
      quiz = { token: token, name: 'Updated Quiz Name' };
      requestPut(quiz, `/v1/admin/quiz/${quizId}/name`); //change to v2
      const res = requestGet({ token: token }, `/v2/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({
        retval: {
          quizId: res.retval.quizId,
          name: 'Updated Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz description',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        },
        statusCode: 200
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Given invalid session ID', () => {
      const sessionId = parseInt(token) + 1;
      const res = requestGet({ token: sessionId.toString() }, `/v2/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestGet({ token: token }, `/v2/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing quizId errors (status code 403)', () => {
    test('User is not an owner of this quiz', () => {
      const otherUserBody = { email: 'otherUser@gmail.com', password: 'Password23', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const otherUserResponse = requestPost(otherUserBody, '/v1/admin/auth/register');
      const otherUserToken = otherUserResponse.retval.token;

      const res = requestGet({ token: otherUserToken }, `/v2/admin/quiz/${quizId}`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });

    test("Quiz doesn't exist", () => {
      const res = requestGet({ token: token }, `/v2/admin/quiz/${quizId + 1}`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });

});
