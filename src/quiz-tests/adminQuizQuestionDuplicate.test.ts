// http tests for /v1/admin/quiz/{quizId}/question/{questionId}/duplicate

import { requestDelete, requestPost, requestGet } from '../helper-files/requestHelper';

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

  describe('Testing for successful duplication of quiz question (status code 200)', () => {
    let quizId: number;
    let questionId: number;

    test('Testing for correct return type', () => {
      // Create a quiz
      const resQuizCreate = requestPost(quizBody, '/v1/admin/quiz');
      quizId = resQuizCreate.retval.quizId;

      // Create question
      const answerBody1 = { answer: 'Prince Charles', correct: true };
      const answerBody2 = { answer: 'Prince William', correct: false };
      const questionBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: [answerBody1, answerBody2] };
      const resQuestionCreate = requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`);
      questionId = resQuestionCreate.retval.questionId;
      const dupeQuestion = requestPost({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);
      expect(dupeQuestion.statusCode).toBe(200);
      expect(dupeQuestion.retval).toStrictEqual({ newQuestionId: expect.any(Number) });
    });

    test('Side effect: duplicated question is immediately after where source question is', () => {
      const quiz = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = quiz.retval.quizId;

      const answerBody1 = [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince William', correct: false }];
      const questionCreateBody1 = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody1 };

      const answerBody2 = [{ answer: 'Washington, D.C.', correct: true }, { answer: 'New York', correct: false }];
      const questionCreateBody2 = { question: 'What is the capital of the USA?', duration: 3, points: 5, answers: answerBody2 };

      const answerBody3 = [{ answer: 'Elephant', correct: true }, { answer: 'Lion', correct: false }];
      const questionCreateBody3 = { question: 'What is the largest land animal?', duration: 2, points: 5, answers: answerBody3 };

      // Create three questions
      const res1 = requestPost({ token: token, questionBody: questionCreateBody1 }, `/v1/admin/quiz/${quizId}/question`);
      const questionId1 = res1.retval.questionId;

      const res2 = requestPost({ token: token, questionBody: questionCreateBody2 }, `/v1/admin/quiz/${quizId}/question`);
      const questionId2 = res2.retval.questionId;

      const res3 = requestPost({ token: token, questionBody: questionCreateBody3 }, `/v1/admin/quiz/${quizId}/question`);
      const questionId3 = res3.retval.questionId;

      // Duplicate the second question
      const dupeRes = requestPost({ token }, `/v1/admin/quiz/${quizId}/question/${questionId2}/duplicate`);
      const dupeQuestionId = dupeRes.retval.newQuestionId;

      expect(requestGet({ token }, `/v1/admin/quiz/${quizId}`)).toStrictEqual({
        retval: {
          quizId: quizId,
          name: quizBody.name,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: quizBody.description,
          numQuestions: 4,
          questions: [
            {
              questionId: questionId1,
              question: questionCreateBody1.question,
              duration: questionCreateBody1.duration,
              points: questionCreateBody1.points,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: answerBody1[0].answer,
                  colour: expect.any(String),
                  correct: answerBody1[0].correct
                },
                {
                  answerId: expect.any(Number),
                  answer: answerBody1[1].answer,
                  colour: expect.any(String),
                  correct: answerBody1[1].correct
                }
              ]
            },
            {
              questionId: questionId2,
              question: questionCreateBody2.question,
              duration: questionCreateBody2.duration,
              points: questionCreateBody2.points,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: answerBody2[0].answer,
                  colour: expect.any(String),
                  correct: answerBody2[0].correct
                },
                {
                  answerId: expect.any(Number),
                  answer: answerBody2[1].answer,
                  colour: expect.any(String),
                  correct: answerBody2[1].correct
                }
              ]
            },
            {
              questionId: dupeQuestionId,
              question: questionCreateBody2.question,
              duration: questionCreateBody2.duration,
              points: questionCreateBody2.points,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: answerBody2[0].answer,
                  colour: expect.any(String),
                  correct: answerBody2[0].correct
                },
                {
                  answerId: expect.any(Number),
                  answer: answerBody2[1].answer,
                  colour: expect.any(String),
                  correct: answerBody2[1].correct
                }
              ]
            },
            {
              questionId: questionId3,
              question: questionCreateBody3.question,
              duration: questionCreateBody3.duration,
              points: questionCreateBody3.points,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: answerBody3[0].answer,
                  colour: expect.any(String),
                  correct: answerBody3[0].correct
                },
                {
                  answerId: expect.any(Number),
                  answer: answerBody3[1].answer,
                  colour: expect.any(String),
                  correct: answerBody3[1].correct
                }
              ]
            }
          ],
          duration: expect.any(Number)
        },
        statusCode: 200
      });
    });

    test('Side effect:timeLastEdited is updated when duplicating a quiz question', () => {
      // Create a quiz
      const resQuizCreate = requestPost(quizBody, '/v1/admin/quiz');
      quizId = resQuizCreate.retval.quizId;

      // Create question
      const answerBody1 = { answer: 'Prince Charles', correct: true };
      const answerBody2 = { answer: 'Prince William', correct: false };
      const questionBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: [answerBody1, answerBody2] };
      const resQuestionCreate = requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`);
      questionId = resQuestionCreate.retval.questionId;

      // Check initial timeLastEdited
      const initialQuiz = requestGet({ token: token }, `/v1/admin/quiz/${quizId}`);
      const initialTimeLastEdited = initialQuiz.retval.timeLastEdited;

      // Duplicate the question
      const dupeQuestion = requestPost({ token: token }, `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`);
      expect(dupeQuestion.statusCode).toStrictEqual(200);

      // Check updated timeLastEdited
      const updatedQuiz = requestGet({ token: token }, `/v1/admin/quiz/${quizId}`);
      const updatedTimeLastEdited = updatedQuiz.retval.timeLastEdited;

      expect(updatedTimeLastEdited).toBeGreaterThanOrEqual(initialTimeLastEdited);
      expect(updatedTimeLastEdited).toBeLessThanOrEqual(initialTimeLastEdited + 1);
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
      // Create user
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
      // Create user
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
  });
});
