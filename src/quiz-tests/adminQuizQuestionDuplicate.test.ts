// tests for adminQuizQuestionDuplicate

import { Tokens } from '../dataStore';
import { requestDelete, requestPost, requestPut } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/quiz/{quizid}/question/{questionid}/duplicate', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: Tokens, name: string, description: string };
  let token: { sessionId: number, authUserId: number };
  const error = { error: expect.any(String) };

  beforeEach(() => {
    userBody = { email: 'userone@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
    const { retval } = requestPost(userBody, '/v1/admin/auth/register');
    token = retval as { sessionId: number, authUserId: number };
    quizBody = { token: token, name: 'My Quiz Name', description: 'Valid Quiz Description' };
  });

  describe('Testing for correct return type (status code 200)', () => {
    test('Successfully duplicate a quiz', () => {
      const createRes = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = createRes.retval.quizId;
      const question = { question: 'Sample Question', duration: 60, points: 10, answers: [{ answer: 'Sample Answer', correct: true }] };
      const questionRes = requestPost({ token, ...question }, `/v1/admin/quiz/${quizId}/question`);
      const questionId = questionRes.retval.questionId;
      const dupeRes = requestPost(token, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);
      expect(dupeRes.statusCode).toStrictEqual(200);
      expect(dupeRes.retval).toStrictEqual({ newQuestionId: expect.any(Number) });
    });
  });

  describe('Testing for invalid questionId (status code 400)', () => {
    test('Question Id does not refer to a valid question within the quiz', () => {
      const createRes = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = createRes.retval.quizId;
      const invalidQuestionId = quizId + 1;
      const dupeRes = requestPost(token, `/v1/admin/quiz/${quizId}/question/${invalidQuestionId}/duplicate`);
      expect(dupeRes.statusCode).toStrictEqual(400);
      expect(dupeRes.retval).toStrictEqual(error);
    });

    test.skip('Side effect: returns error when trying to duplicate deleted quiz question', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = res.retval.quizId;
      const question = { question: 'Sample Question', duration: 60, points: 10, answers: [{ answer: 'Sample Answer', correct: true }] };
      const questionRes = requestPost({ token, ...question }, `/v1/admin/quiz/${quizId}/question`);
      const questionId = questionRes.retval.questionId;

      requestDelete(token, `/v1/admin/quiz/${quizId}/question/${questionId}`);
      const dupeQues = requestPost(token, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);

      expect(dupeQues.statusCode).toStrictEqual(400);
      expect(dupeQues).toStrictEqual(error);
    });

    test.skip('Side effect: returns error when trying to duplicate quiz question that has been moved to another quiz', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = res.retval.quizId;
      const question = { question: 'Sample Question', duration: 60, points: 10, answers: [{ answer: 'Sample Answer', correct: true }] };
      const questionRes = requestPost({ token, ...question }, `/v1/admin/quiz/${quizId}/question`);
      const questionId = questionRes.retval.questionId;

      requestPut(token, `/v1/admin/quiz/${quizId}/question/${questionId}/move`);
      const dupeQues = requestPost(token, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);

      expect(dupeQues.statusCode).toStrictEqual(400);
      expect(dupeQues).toStrictEqual(error);
    });
  });

  describe('Testing for invalid and empty token (status code 401', () => {
    test('Returns error when authUserId is not a valid user', () => {
      token.authUserId += 1;
      const createRes = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = createRes.retval.quizId;

      const question = { question: 'Sample Question', duration: 60, points: 10, answers: [{ answer: 'Sample Answer', correct: true }] };
      const questionRes = requestPost({ token, ...question }, `/v1/admin/quiz/${quizId}/question`);

      const questionId = questionRes.retval.questionId;
      const dupeRes = requestPost(token, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);

      expect(dupeRes.statusCode).toStrictEqual(401);
      expect(dupeRes.retval).toStrictEqual(error);
    });

    test('Returns error when sessionId is invalid', () => {
      token.sessionId += 1;
      const createRes = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = createRes.retval.quizId;

      const question = { question: 'Sample Question', duration: 60, points: 10, answers: [{ answer: 'Sample Answer', correct: true }] };
      const questionRes = requestPost({ token, ...question }, `/v1/admin/quiz/${quizId}/question`);

      const questionId = questionRes.retval.questionId;
      const dupeRes = requestPost(token, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);

      expect(dupeRes.statusCode).toStrictEqual(401);
      expect(dupeRes.retval).toStrictEqual(error);
    });
  });

  describe('Testing if quiz question exceeds quiz duration', () => {
    test.skip('Returns error if duplicated quiz exceeds quiz duration', () => {

    });
  });
});
