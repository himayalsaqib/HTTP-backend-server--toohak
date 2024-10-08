// includes http tests for the route /v1/admin/quiz/:quizid/description and /v2/admin/quiz/:quizid/description

import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('PUT /v1/admin/quiz/:quizid/description', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let token: string;

  let quiz: { token: string, description: string };
  let quizId: number;

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    quizBody = { token: token, name: 'Quiz Name', description: 'Original quiz description' };
    const quizResponse = requestPost(quizBody, '/v1/admin/quiz');
    quizId = quizResponse.retval.quizId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has correct return type', () => {
      quiz = { token: token, description: 'Updated quiz description' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/description`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });
  });

  test('Side effect (successful update): adminQuizInfo returns newly updated properties', () => {
    const clientSendTime = Math.floor(Date.now() / 1000);
    quiz = { token: token, description: 'Updated quiz description' };

    requestPut(quiz, `/v1/admin/quiz/${quizId}/description`);

    const res = requestGet({ token: token }, `/v1/admin/quiz/${quizId}`);
    const timeLastEdited = res.retval.timeLastEdited;

    expect(timeLastEdited).toBeGreaterThanOrEqual(clientSendTime);
    expect(timeLastEdited).toBeLessThanOrEqual(clientSendTime + 1);

    expect(res).not.toStrictEqual({
      retval: {
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        description: 'Original quiz description',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      },
      statusCode: 200
    });
    expect(res).toStrictEqual({
      retval: {
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Updated quiz description',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      },
      statusCode: 200
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Given invalid session ID', () => {
      const sessionId = parseInt(token) + 1;
      token = sessionId.toString();
      quiz = { token: token, description: 'Updated Quiz Description' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/description`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/description`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing description errors (status code 400)', () => {
    test('Description is more than 100 characters in length', () => {
      quiz = { token: token, description: 'This is a really really long quiz description. It will produce an error because it is more than 100 characters long' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/description`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
    test('Description exactly 100 characters (edge case)', () => {
      quiz = { token: token, description: "This description is exactly 100 characters long and it's used to test the edge case of the function." };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/description`);

      expect(res).not.toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing quizId errors (status code 403)', () => {
    test('User is not an owner of this quiz', () => {
      const otherUserBody = { email: 'otherUser@gmail.com', password: 'Password23', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const otherUserResponse = requestPost(otherUserBody, '/v1/admin/auth/register');
      const otherUserToken = otherUserResponse.retval.token;

      quiz = { token: otherUserToken, description: 'Updated quiz description' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/description`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });

    test("Quiz doesn't exist", () => {
      const quiz = { token: token, name: 'Updated quiz description' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId + 1}/description`);

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });
});

describe('PUT /v2/admin/quiz/:quizid/description', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { name: string, description: string };
  let token: string;

  let quiz: { description: string };
  let quizId: number;

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval.token;

    quizBody = { name: 'Quiz Name', description: 'Original quiz description' };
    const quizResponse = requestPost(quizBody, '/v2/admin/quiz', { token });
    quizId = quizResponse.retval.quizId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has correct return type', () => {
      quiz = { description: 'Updated quiz description' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/description`, { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });
  });

  test('Side effect (successful update): adminQuizInfo returns newly updated properties', () => {
    const clientSendTime = Math.floor(Date.now() / 1000);
    quiz = { description: 'Updated quiz description' };

    requestPut(quiz, `/v2/admin/quiz/${quizId}/description`, { token });

    const res = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
    const timeLastEdited = res.retval.timeLastEdited;

    expect(timeLastEdited).toBeGreaterThanOrEqual(clientSendTime);
    expect(timeLastEdited).toBeLessThanOrEqual(clientSendTime + 1);

    expect(res).not.toStrictEqual({
      retval: {
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        description: 'Original quiz description',
        numQuestions: 0,
        questions: [],
        duration: 0
      },
      statusCode: 200
    });
    expect(res).toStrictEqual({
      retval: {
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Updated quiz description',
        numQuestions: 0,
        questions: [],
        duration: 0
      },
      statusCode: 200
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Given invalid session ID', () => {
      const sessionId = parseInt(token) + 1;
      token = sessionId.toString();
      quiz = { description: 'Updated Quiz Description' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/description`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/description`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing description errors (status code 400)', () => {
    test('Description is more than 100 characters in length', () => {
      quiz = { description: 'This is a really really long quiz description. It will produce an error because it is more than 100 characters long' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/description`, { token });

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
    test('Description exactly 100 characters (edge case)', () => {
      quiz = { description: "This description is exactly 100 characters long and it's used to test the edge case of the function." };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/description`, { token });

      expect(res).not.toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing quizId errors (status code 403)', () => {
    test('User is not an owner of this quiz', () => {
      const otherUserBody = { email: 'otherUser@gmail.com', password: 'Password23', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const otherUserResponse = requestPost(otherUserBody, '/v1/admin/auth/register');
      const otherUserToken = otherUserResponse.retval.token;

      quiz = { description: 'Updated quiz description' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId}/description`, { token: otherUserToken });

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });

    test("Quiz doesn't exist", () => {
      const quiz = { name: 'Updated quiz description' };
      const res = requestPut(quiz, `/v2/admin/quiz/${quizId + 1}/description`, { token });

      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });
});
