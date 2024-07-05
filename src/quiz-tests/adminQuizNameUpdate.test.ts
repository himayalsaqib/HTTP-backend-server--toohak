// contains the HTTP tests for adminQuizNameUpdate from quiz.ts

import { Tokens } from '../dataStore';
import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('PUT /v1/admin/quiz:quizid/name', () => {
  const error = { error: expect.any(String) };
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: Tokens, name: string, description: string };
  let token: { sessionId: number, authUserId: number };

  let quiz: { token: Tokens, name: string };
  let quizId: number;
  let quizInfo: { quizId: number, token: Tokens};

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval as { sessionId: number, authUserId: number };

    quizBody = { token: token, name: 'Original Quiz Name', description: 'Quiz Description' };
    const quizResponse = requestPost(quizBody, '/v1/admin/quiz');
    quizId = quizResponse.retval.quizId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Has correct return type', () => {
      quiz = { token: token, name: 'Updated Quiz Name' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test.skip('Side effect (successful update): adminQuizInfo returns newly updated properties', () => {
      quiz = { token: token, name: 'Updated Quiz Name' };
      quizInfo = { quizId: quizId, token: token };
      requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);
      const res = requestGet(quizInfo, '/v1/admin/quiz/:quizId'); // {quizId}
      expect(res).not.toStrictEqual({
        retval: {
          quizId: quizId,
          name: 'Original Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: undefined,
          description: 'Valid quiz description'
        },
        statusCode: 200
      });
      expect(res).toStrictEqual({
        retval: {
          quizId: quizId,
          name: 'Updated Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Valid quiz description'
        },
        statusCode: 200
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Invalid authUserId', () => {
      token.authUserId += 1;
      quiz = { token: token, name: 'Updated Quiz Name' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('Given invalid session ID', () => {
      token.sessionId += 1;
      quiz = { token: token, name: 'Updated Quiz Name' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });
  });

  describe('Testing quiz name errors (status code 400)', () => {
    test('Quiz name contains invalid characters', () => {
      quiz = { token: token, name: 'Invalid Quiz Name !@#$%^&*()' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);

      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    });

    test('Quiz name is less than 3 characters', () => {
      quiz = { token: token, name: 'Hi' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);

      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    });

    test('Quiz name is more than 30 characters', () => {
      quiz = { token: token, name: '1234567890 1234567890 1234567890' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);

      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    });

    test('Quiz name already used by current user for another quiz', () => {
      const quizBody = { token: token, name: 'Name In Use', description: 'Valid Quiz Description' };
      requestPost(quizBody, '/v1/admin/quiz');

      quiz = { token: token, name: 'Name In Use' };
      const res = requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);

      expect(res).toStrictEqual({ retval: error, statusCode: 400 });
    });
  });
  describe('Testing quizId errors (status code 403)', () => {
    test('User is not an owner of this quiz', () => {
      const otherUserBody = { email: 'otherUser@gmail.com', password: 'Password23', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const otherUserResponse = requestPost(otherUserBody, '/v1/admin/auth/register');
      const otherUserToken = otherUserResponse.retval as { sessionId: number, authUserId: number };

      const otherQuizBody = { token: otherUserToken, name: 'Other User Quiz', description: 'Description' };
      const otherQuizResponse = requestPost(otherQuizBody, '/v1/admin/quiz');
      const otherQuizId = otherQuizResponse.retval.quizId;

      quiz = { token: token, name: 'New Name' };
      const res = requestPut(quiz, `/v1/admin/quiz/${otherQuizId}/name`);

      expect(res).toStrictEqual({ retval: error, statusCode: 403 });
    });
    test("Quiz doesn't exist", () => {
      const invalidQuizId = 'invalidQuiz123';

      const quiz = { token: token, name: 'New Name' };
      const res = requestPut(quiz, `/v1/admin/quiz/${invalidQuizId}/name`);

      expect(res).toStrictEqual({ retval: error, statusCode: 403 });
    });
  });
});
