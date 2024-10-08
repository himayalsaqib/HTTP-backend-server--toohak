// includes http tests for the route /v1/admin/quiz/{quizid}/restore and /v2/admin/quiz/{quizid}/restore

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

const ERROR = { error: expect.any(String) };

describe('POST /v1/admin/quiz/:quizid/restore', () => {
  let token: string;
  let quizId: number;
  let user: { email: string, password: string, nameFirst: string, nameLast: string };
  let quiz: { token: string, name: string, description: string };

  beforeEach(() => {
    // register a user
    user = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerUser = requestPost(user, '/v1/admin/auth/register');
    token = registerUser.retval.token;

    // create a quiz
    quiz = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
    const createQuizRes = requestPost(quiz, '/v1/admin/quiz');
    quizId = createQuizRes.retval.quizId;
  });

  describe('Testing successful cases (status code 200)', () => {
    beforeEach(() => {
      // delete the quiz
      requestDelete({ token: token }, `/v1/admin/quiz/${quizId}`);
    });

    test('Has correct return type', () => {
      const res = requestPost({ token: token }, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect (successful restoration): adminQuizList returns details of restored quiz', () => {
      let res = requestPost({ token: token }, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

      res = requestGet({ token: token }, '/v1/admin/quiz/list');
      expect(res).toStrictEqual({
        retval: {
          quizzes: [{ quizId: quizId, name: 'Valid Quiz Name' }]
        },
        statusCode: 200
      });
    });

    test('Side effect (successful restoration): adminQuizInfo displays correct timeLastEdited', () => {
      const time = Math.floor(Date.now() / 1000);
      let res = requestPost({ token: token }, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

      res = requestGet({ token: token }, `/v1/admin/quiz/${quizId}`);
      expect(res.retval.timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(res.retval.timeLastEdited).toBeLessThanOrEqual(time + 1);
    });

    test('Side effect (successful restoration): adminQuizTrash does not display restored quiz', () => {
      let res = requestPost({ token: token }, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

      res = requestGet({ token: token }, '/v1/admin/quiz/trash');
      expect(res).toStrictEqual({ retval: { quizzes: [] }, statusCode: 200 });
    });
  });

  describe('Testing quiz name error (status code 400)', () => {
    beforeEach(() => {
      // delete the quiz
      requestDelete({ token: token }, `/v1/admin/quiz/${quizId}`);

      // create a quiz with the same name as the deleted quiz
      quiz = { token: token, name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
      requestPost(quiz, '/v1/admin/quiz');
    });

    test('Quiz name of the restored quiz is already used by another active quiz', () => {
      const res = requestPost({ token: token }, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing error for a quiz that has not been deleted (status code 400)', () => {
    test('Quiz ID refers to a quiz that is not currently in the trash', () => {
      const res = requestPost({ token: token }, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    beforeEach(() => {
      // delete the quiz
      requestDelete({ token: token }, `/v1/admin/quiz/${quizId}`);
    });

    test('Token is empty (no users registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPost({ token: token }, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Session ID is invalid', () => {
      const sessionId = parseInt(token) + 1;
      const res = requestPost({ token: sessionId.toString() }, `/v1/admin/quiz/${quizId}/restore`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing quizId errors (status code 403)', () => {
    beforeEach(() => {
      // delete the quiz
      requestDelete({ token: token }, `/v1/admin/quiz/${quizId}`);
    });

    test('Current user does not own the quiz', () => {
      // register a second user
      const user2 = { email: 'valid2@gmail.com', password: 'Password12', nameFirst: 'Jamie', nameLast: 'David' };
      const registerUser2 = requestPost(user2, '/v1/admin/auth/register');
      const token2 = registerUser2.retval.token;

      // create a quiz for the second user
      quiz = { token: token2, name: 'Other Valid Quiz Name', description: 'Other Valid Quiz Description' };
      const createQuizRes2 = requestPost(quiz, '/v1/admin/quiz');
      const quizId2 = createQuizRes2.retval.quizId;

      // delete second user's quiz
      requestDelete({ token: token2 }, `/v1/admin/quiz/${quizId2}`);

      // first user tries to restore second user's deleted quiz
      const res = requestPost({ token: token }, `/v1/admin/quiz/${quizId2}/restore`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });

    test('Quiz ID does not exist', () => {
      const res = requestPost({ token: token }, `/v1/admin/quiz/${quizId + 1}/restore`);
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });
});

describe('POST /v2/admin/quiz/:quizid/restore', () => {
  let token: string;
  let quizId: number;
  let user: { email: string, password: string, nameFirst: string, nameLast: string };
  let quiz: { name: string, description: string };

  beforeEach(() => {
    // register a user
    user = { email: 'valid1@gmail.com', password: 'Password12', nameFirst: 'Jane', nameLast: 'Doe' };
    const registerUser = requestPost(user, '/v1/admin/auth/register');
    token = registerUser.retval.token;

    // create a quiz
    quiz = { name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
    const createQuizRes = requestPost(quiz, '/v2/admin/quiz', { token });
    quizId = createQuizRes.retval.quizId;
  });

  describe('Testing successful cases (status code 200)', () => {
    beforeEach(() => {
      // delete the quiz
      requestDelete({}, `/v2/admin/quiz/${quizId}`, { token });
    });

    test('Has correct return type', () => {
      const res = requestPost({}, `/v2/admin/quiz/${quizId}/restore`, { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });
    });

    test('Side effect (successful restoration): adminQuizList returns details of restored quiz', () => {
      let res = requestPost({}, `/v2/admin/quiz/${quizId}/restore`, { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

      res = requestGet({}, '/v2/admin/quiz/list', { token });
      expect(res).toStrictEqual({
        retval: {
          quizzes: [{ quizId: quizId, name: 'Valid Quiz Name' }]
        },
        statusCode: 200
      });
    });

    test('Side effect (successful restoration): adminQuizInfo displays correct timeLastEdited', () => {
      const time = Math.floor(Date.now() / 1000);
      let res = requestPost({}, `/v2/admin/quiz/${quizId}/restore`, { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

      res = requestGet({}, `/v2/admin/quiz/${quizId}`, { token });
      expect(res.retval.timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(res.retval.timeLastEdited).toBeLessThanOrEqual(time + 1);
    });

    test('Side effect (successful restoration): adminQuizTrash does not display restored quiz', () => {
      let res = requestPost({}, `/v2/admin/quiz/${quizId}/restore`, { token });
      expect(res).toStrictEqual({ retval: {}, statusCode: 200 });

      res = requestGet({}, '/v2/admin/quiz/trash', { token });
      expect(res).toStrictEqual({ retval: { quizzes: [] }, statusCode: 200 });
    });
  });

  describe('Testing quiz name error (status code 400)', () => {
    beforeEach(() => {
      // delete the quiz
      requestDelete({}, `/v2/admin/quiz/${quizId}`, { token });

      // create a quiz with the same name as the deleted quiz
      quiz = { name: 'Valid Quiz Name', description: 'Valid Quiz Description' };
      requestPost(quiz, '/v2/admin/quiz', { token });
    });

    test('Quiz name of the restored quiz is already used by another active quiz', () => {
      const res = requestPost({}, `/v2/admin/quiz/${quizId}/restore`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing error for a quiz that has not been deleted (status code 400)', () => {
    test('Quiz ID refers to a quiz that is not currently in the trash', () => {
      const res = requestPost({}, `/v2/admin/quiz/${quizId}/restore`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 400 });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    beforeEach(() => {
      // delete the quiz
      requestDelete({}, `/v2/admin/quiz/${quizId}`, { token });
    });

    test('Token is empty (no users registered)', () => {
      requestDelete({}, '/v1/clear');
      const res = requestPost({}, `/v2/admin/quiz/${quizId}/restore`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });

    test('Session ID is invalid', () => {
      const sessionId = (parseInt(token) + 1).toString();
      const res = requestPost({}, `/v2/admin/quiz/${quizId}/restore`, { token: sessionId });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 401 });
    });
  });

  describe('Testing quizId errors (status code 403)', () => {
    beforeEach(() => {
      // delete the quiz
      requestDelete({}, `/v2/admin/quiz/${quizId}`, { token });
    });

    test('Current user does not own the quiz', () => {
      // register a second user
      const user2 = { email: 'valid2@gmail.com', password: 'Password12', nameFirst: 'Jamie', nameLast: 'David' };
      const registerUser2 = requestPost(user2, '/v1/admin/auth/register');
      const token2 = registerUser2.retval.token;

      // create a quiz for the second user
      quiz = { name: 'Other Valid Quiz Name', description: 'Other Valid Quiz Description' };
      const createQuizRes2 = requestPost(quiz, '/v2/admin/quiz', { token: token2 });
      const quizId2 = createQuizRes2.retval.quizId;

      // delete second user's quiz
      requestDelete({}, `/v2/admin/quiz/${quizId2}`, { token: token2 });

      // first user tries to restore second user's deleted quiz
      const res = requestPost({}, `/v2/admin/quiz/${quizId2}/restore`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });

    test('Quiz ID does not exist', () => {
      const res = requestPost({}, `/v2/admin/quiz/${quizId + 1}/restore`, { token });
      expect(res).toStrictEqual({ retval: ERROR, statusCode: 403 });
    });
  });
});
