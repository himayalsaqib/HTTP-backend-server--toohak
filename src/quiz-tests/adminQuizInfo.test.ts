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
    test.skip('Quiz info of a new quiz was successful and has correct return type', () => { // need to debug
      const res = requestGet(token, `/v1/admin/quiz/${quizId}`);
      console.log('Response:', res); 
      expect(res).toStrictEqual({ 
        retval: {
          quizId: res.retval.quizId,
          name: 'Original Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: undefined,
          description: 'Quiz description'
        }, 
        statusCode: 200 
      });
    });
    test('Quiz info of an edited quiz was successful and has correct return type', () => {
      quiz = { token: token, name: 'Updated Quiz Name' };
      requestPut(quiz, `/v1/admin/quiz/${quizId}/name`);
      const res = requestGet(token, `/v1/admin/quiz/${quizId}`);
      console.log('Response:', res); 
      expect(res).toStrictEqual({ 
        retval: {
          quizId: res.retval.quizId,
          name: 'Updated Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz description'
        }, 
        statusCode: 200 
      });
    });
  });
  describe('Testing token errors (status code 401)', () => {
    test('Invalid authUserId', () => {
      token.authUserId += 1;
      const res = requestGet(quiz, `/v1/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('Given invalid session ID', () => {
      token.sessionId += 1;
      const res = requestGet(quiz, `/v1/admin/quiz/${quizId}`);
      expect(res).toStrictEqual({ retval: error, statusCode: 401 });
    });

    test('Token is empty (no users are registered)', () => {
      const res = requestGet(quiz, `/v1/admin/quiz/${quizId}`);
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

/*
describe('adminQuizInfo', () => {
  let user;
  let quizId;
  const error = { error: expect.any(String) };

  beforeEach(() => {
    clear();
    user = adminAuthRegister('valid1@gmail.com', 'Password12', 'Jane', 'Doe');
    const quiz = adminQuizCreate(user.authUserId, 'Valid Quiz Name', 'Valid quiz description');
    quizId = quiz.quizId;
  });

  describe('Testing for correct return type', () => {
    test('Quiz info of an edited quiz was successful and has correct return type', () => {
      adminQuizNameUpdate(user.authUserId, quizId, 'Updated Quiz Name');
      expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual({
        quizId: quizId,
        name: 'Updated Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Valid quiz description'
      });
    });

    test('Quiz info for a new quiz was successful and has correct return type', () => {
      expect(adminQuizInfo(user.authUserId, quizId)).toStrictEqual({
        quizId: quizId,
        name: 'Valid Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: undefined,
        description: 'Valid quiz description'
      });
    });
  });

  describe('Testing authUserId in adminQuizInfo', () => {
    test('Invalid authUserId', () => {
      expect(adminQuizInfo('invalidUser123', quizId)).toStrictEqual(error);
    });
  });

  describe('Testing quizId in adminQuizInfo', () => {
    test('Invalid quizId', () => {
      expect(adminQuizInfo(user.authUserId, 'invalidQuiz123')).toStrictEqual(error);
    });
    test('Quiz not owned by user', () => {
      const otherUser = adminAuthRegister('otheruser@gmail.com', 'Password12', 'Joe', 'Mama');
      const otherQuiz = adminQuizCreate(otherUser.authUserId, "Other User's Quiz", 'Description');
      expect(adminQuizInfo(user.authUserId, otherQuiz.quizId)).toStrictEqual(error);
    });
  });
});
*/
