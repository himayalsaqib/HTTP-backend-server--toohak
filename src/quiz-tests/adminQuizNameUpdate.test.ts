// includes http tests for the route /v1/admin/quiz/:quizid/name and /v2/admin/quiz/:quizid/name

import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('PUT /v1/admin/quiz/:quizid/name', () => {
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
    test('Has correct return type', () => {
      quiz = { token: token, name: 'Updated Quiz Name' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect (successful update): adminQuizInfo returns newly updated properties', () => {
      const clientSendTime = Math.floor(Date.now() / 1000);
      quiz = { token: token, name: 'Updated Quiz Name' };

      requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);

      const res = requestGet({ token: token }, `/v1/admin/quiz/${quizId}`);
      const timeLastEdited = res.retval.timeLastEdited;

      expect(timeLastEdited).toBeGreaterThanOrEqual(clientSendTime);
      expect(timeLastEdited).toBeLessThanOrEqual(clientSendTime + 1);

      expect(res).not.toStrictEqual({
        retval: {
          quizId: quizId,
          name: 'Original Quiz Name',
          timeCreated: expect.any(Number),
          description: 'Quiz description',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        },
        statusCode: 200
      });
      expect(res).toStrictEqual({
        retval: {
          quizId: quizId,
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
      quiz = { token: sessionId.toString(), name: 'Updated Quiz Name' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing quiz name errors (status code 400)', () => {
    test('Quiz name contains invalid characters', () => {
      quiz = { token: token, name: 'Invalid Quiz Name !@#$%^&*()' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Quiz name is less than 3 characters', () => {
      quiz = { token: token, name: 'Hi' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Quiz name is more than 30 characters', () => {
      quiz = { token: token, name: '1234567890 1234567890 1234567890' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Quiz name already used by current user for another quiz', () => {
      const quizBody = { token: token, name: 'Name In Use', description: 'Valid Quiz Description' };
      requestPost(quizBody, '/v1/admin/quiz');

      quiz = { token: token, name: 'Name In Use' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });
  describe('Testing quizId errors (status code 403)', () => {
    test('User is not an owner of this quiz', () => {
      const otherUserBody = { email: 'otherUser@gmail.com', password: 'Password23', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const otherUserResponse = requestPost(otherUserBody, '/v1/admin/auth/register');
      const otherUserToken = otherUserResponse.retval.token;

      quiz = { token: otherUserToken, name: 'New Name' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });

    test("Quiz doesn't exist", () => {
      const quiz = { token: token, name: 'New Name' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId + 1}/name`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });
});

describe('PUT /v2/admin/quiz/:quizid/name', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { name: string, description: string };
  let token: string;

  let quiz: { name: string };
  let quizId: number;

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    quizBody = { name: 'Original Quiz Name', description: 'Quiz description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has correct return type', () => {
      quiz = { name: 'Updated Quiz Name' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/name`, { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect (successful update): adminQuizInfo returns newly updated properties', () => {
      const clientSendTime = Math.floor(Date.now() / 1000);
      quiz = { name: 'Updated Quiz Name' };

      requestPut(quiz, `/v2/admin/quiz/${quizId}/name`, { token });

      const res = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
      const timeLastEdited = res.retval.timeLastEdited;

      expect(timeLastEdited).toBeGreaterThanOrEqual(clientSendTime);
      expect(timeLastEdited).toBeLessThanOrEqual(clientSendTime + 1);

      expect(res).not.toStrictEqual({
        retval: {
          quizId: quizId,
          name: 'Original Quiz Name',
          timeCreated: expect.any(Number),
          description: 'Quiz description',
          numQuestions: 0,
          questions: [],
          duration: 0
        },
        statusCode: 200
      });
      expect(res).toStrictEqual({
        retval: {
          quizId: quizId,
          name: 'Updated Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz description',
          numQuestions: 0,
          questions: [],
          duration: 0
        },
        statusCode: 200
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Given invalid session ID', () => {
      const sessionId = parseInt(token) + 1;
      quiz = { name: 'Updated Quiz Name' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/name`, { token: sessionId.toString() });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/name`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing quiz name errors (status code 400)', () => {
    test('Quiz name contains invalid characters', () => {
      quiz = { name: 'Invalid Quiz Name !@#$%^&*()' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/name`, { token });

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Quiz name is less than 3 characters', () => {
      quiz = { name: 'Hi' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/name`, { token });

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Quiz name is more than 30 characters', () => {
      quiz = { name: '1234567890 1234567890 1234567890' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/name`, { token });

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });

    test('Quiz name already used by current user for another quiz', () => {
      const quizBody = { name: 'Name In Use', description: 'Valid Quiz Description' };
      requestPost(quizBody, '/v2/admin/quiz', { token });

      quiz = { name: 'Name In Use' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/name`, { token });

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });
  describe('Testing quizId errors (status code 403)', () => {
    test('User is not an owner of this quiz', () => {
      const otherUserBody = { email: 'otherUser@gmail.com', password: 'Password23', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const otherUserResponse = requestPost(otherUserBody, '/v1/admin/auth/register');
      const otherUserToken = otherUserResponse.retval.token;

      quiz = { name: 'New Name' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/name`, { token: otherUserToken });

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });

    test("Quiz doesn't exist", () => {
      const quiz = { name: 'New Name' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId + 1}/name`, { token });

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });
});
