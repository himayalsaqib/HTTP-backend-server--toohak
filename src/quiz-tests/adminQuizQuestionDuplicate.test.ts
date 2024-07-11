// http tests for adminQuizQuestionDuplicate

import { requestDelete, requestPost, requestPut } from '../helper-files/requestHelper';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/admin/quiz/:quizid/question/:questionid/duplicate', () => {
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let token: string;
  const error = { error: expect.any(String) };

  beforeEach(() => {
    // Register user to create quiz
    userBody = { email: 'userone@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
    const registerUser = requestPost(userBody, '/v1/admin/auth/register');
    token = registerUser.retval.token;
    quizBody = { token: token, name: 'My Quiz Name', description: 'Valid Quiz Description' };
  });

  describe('Testing for correct return type (status code 200)', () => {
    let quizId: number;
    let questionId: number;

    beforeEach(() => {
      // Create a quiz
      const resQuizCreate = requestPost(quizBody, '/v1/admin/quiz');
      quizId = resQuizCreate.retval.quizId;

      // Create question
      const answerBody1 = { answer: 'Prince Charles', correct: true };
      const answerBody2 = { answer: 'Prince William', correct: false };
      const questionBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: [answerBody1, answerBody2] };
      const resQuestionCreate = requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`);
      questionId = resQuestionCreate.retval.questionId;
    });

    test('Successfully duplicate a quiz question', () => {
      const dupeQuestion = requestPost({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);
      expect(dupeQuestion.statusCode).toBe(200);
      expect(dupeQuestion.retval).toStrictEqual({ newQuestionId: expect.any(Number) });
    });
  });

  describe('Testing for invalid questionId (status code 400)', () => {
    test('Question Id does not refer to a valid question within the quiz', () => {
      const createRes = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = createRes.retval.quizId;
      const invalidQuestionId = quizId + 1;
      const dupeRes = requestPost({ token }, `/v1/admin/quiz/${quizId}/question/${invalidQuestionId}/duplicate`);
      expect(dupeRes.statusCode).toBe(400);
      expect(dupeRes.retval).toStrictEqual(error);
    });
  });

  describe('Testing for invalid and empty token (status code 401', () => {
    test('Returns error when sessionId is invalid', () => {
      token += '1';
      const createRes = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = createRes.retval.quizId;

      const question = { question: 'Sample Question', duration: 60, points: 10, answers: [{ answer: 'Sample Answer', correct: true }] };
      const questionRes = requestPost({ token, ...question }, `/v1/admin/quiz/${quizId}/question`);

      const questionId = questionRes.retval.questionId;
      const dupeRes = requestPost({ token }, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);

      expect(dupeRes.statusCode).toStrictEqual(401);
      expect(dupeRes.retval).toStrictEqual(error);
    });

    test('Returns error when token is empty', () => {
      requestDelete({}, '/v1/clear');
      const dupeRes = requestPost({ token }, '/v1/admin/quiz/:quizId/question/:questionId/duplicate');
      expect(dupeRes.statusCode).toStrictEqual(401);
      expect(dupeRes.retval).toStrictEqual(error);
    });
  });

  describe('Testing for valid token, user not owner of quiz, quiz does not exist (status code 403)', () => {
    test('Returns error when user is not owner of quiz', () => {
      // creater user
      const user = { email: 'userone@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
      const registerUser = requestPost(user, '/v1/admin/auth/register');
      const tokenOne = registerUser.retval.token;
      const quiz = { token: tokenOne, name: 'Quiz One', description: 'Description for quiz one' };
      const resQuizCreate = requestPost(quiz, '/v1/admin/quiz');
      const quizId = resQuizCreate.retval.quizId;

      // Create question with user
      const question = { question: 'Sample Question', duration: 60, points: 10, answers: [{ answer: 'Sample Answer', correct: true }] };
      const resQuestionCreate = requestPost({ token: tokenOne, questionBody: question }, `/v1/admin/quiz/${quizId}/question`);
      const questionId = resQuestionCreate.retval.questionId;

      // Register userTwo and try to duplicate question in quiz created by user
      const userTwo = { email: 'usertwo@gmail.com', password: 'Password02', nameFirst: 'User', nameLast: 'Two' };
      const registerUserTwo = requestPost(userTwo, '/v1/admin/auth/register');
      const tokenTwo = registerUserTwo.retval.token;
      const dupeRes = requestPost({ token: tokenTwo }, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);

      expect(dupeRes.statusCode).toBe(403);
      expect(dupeRes.retval).toStrictEqual(error);
    });

    test('Returns error when quiz does not exist', () => {
      // creater user
      const user = { email: 'userone@gmail.com', password: 'Password01', nameFirst: 'User', nameLast: 'One' };
      const registerUser = requestPost(user, '/v1/admin/auth/register');
      const tokenUser = registerUser.retval.token;
      const quiz = { token: tokenUser, name: 'Quiz One', description: 'Description for quiz one' };
      const resQuizCreate = requestPost(quiz, '/v1/admin/quiz');
      let quizId = resQuizCreate.retval.quizId;

      // Create question with user
      const question = { question: 'Sample Question', duration: 60, points: 10, answers: [{ answer: 'Sample Answer', correct: true }] };
      const resQuestionCreate = requestPost({ token: token, questionBody: question }, `/v1/admin/quiz/${quizId}/question`);
      const questionId = resQuestionCreate.retval.questionId;

      quizId += '1';
      const dupeQues = requestPost({ token }, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);
      expect(dupeQues.statusCode).toStrictEqual(403);
      expect(dupeQues.retval).toStrictEqual(error);
    });

    test.skip('Side effect: returns error when trying to duplicate deleted quiz question', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = res.retval.quizId;
      const question = { question: 'Sample Question', duration: 60, points: 10, answers: [{ answer: 'Sample Answer', correct: true }] };
      const questionRes = requestPost({ token, ...question }, `/v1/admin/quiz/${quizId}/question`);
      const questionId = questionRes.retval.questionId;

      requestDelete({ token }, `/v1/admin/quiz/${quizId}/question/${questionId}`);
      const dupeQues = requestPost({ token }, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);

      expect(dupeQues.statusCode).toBe(403);
      expect(dupeQues.retval).toStrictEqual(error);
    });

    test.skip('Side effect: returns error when trying to duplicate quiz question that has been moved to another quiz', () => {
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = res.retval.quizId;
      const question = { question: 'Sample Question', duration: 60, points: 10, answers: [{ answer: 'Sample Answer', correct: true }] };
      const questionRes = requestPost({ token, ...question }, `/v1/admin/quiz/${quizId}/question`);
      const questionId = questionRes.retval.questionId;

      requestPut({ token }, `/v1/admin/quiz/${quizId}/question/${questionId}/move`);
      const dupeQues = requestPost({ token }, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);

      expect(dupeQues.statusCode).toBe(403);
      expect(dupeQues.retval).toStrictEqual(error);
    });
  });
});
