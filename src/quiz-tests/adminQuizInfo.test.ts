// contains the HTTP tests adminQuizInfo from quiz.ts

import { Tokens } from '../dataStore';
import { requestDelete, requestGet, requestPost, requestPut } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/quiz:quizid', () => {
  const error = { error: expect.any(String) };
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: Tokens, name: string, description: string };
  let token: { sessionId: number, authUserId: number };

  let quiz: { token: Tokens, name: string };
  let quizId: number;

  beforeEach(() => {
    userBody = { email: 'valid@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerResponse = requestPost(userBody, '/v1/admin/auth/register');
    token = registerResponse.retval as { sessionId: number, authUserId: number };

    quizBody = { token: token, name: 'Original Quiz Name', description: 'Quiz description' };
    const quizResponse = requestPost(quizBody, '/v1/admin/quiz');
    quizId = quizResponse.retval.quizId;
  });

  describe('Testing successful cases (status code 200)', () => {
    test('Quiz info of a new quiz was successful and has correct return type', () => {
      const res = requestGet(token, `/v1/admin/quiz/${quizId}`);
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
      const res = requestGet(token, `/v1/admin/quiz/${quizId}`);
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
    test('Invalid authUserId', () => {
      token.authUserId += 1;
      const res = requestGet(token, `/v1/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('Given invalid session ID', () => {
      token.sessionId += 1;
      const res = requestGet(token, `/v1/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestGet(token, `/v1/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });
  });

  describe('Testing quizId errors (status code 403)', () => {
    test('User is not an owner of this quiz', () => {
      const otherUserBody = { email: 'otherUser@gmail.com', password: 'Password23', nameFirst: 'Not Jane', nameLast: 'Not Doe' };
      const otherUserResponse = requestPost(otherUserBody, '/v1/admin/auth/register');
      const otherUserToken = otherUserResponse.retval as { sessionId: number, authUserId: number };

      quiz = { token: otherUserToken, name: 'Other Name' };
      const res = requestGet(otherUserToken, `/v1/admin/quiz/${quizId}`);

      expect(res).toStrictEqual({ retval: error, statusCode: 403 });
    });

    test("Quiz doesn't exist", () => {
      const invalidQuizId = 'invalidQuiz123';

      const res = requestGet(token, `/v1/admin/quiz/${invalidQuizId}`);

      expect(res).toStrictEqual({ retval: error, statusCode: 403 });
    });
  });
});
