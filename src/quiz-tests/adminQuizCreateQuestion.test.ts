// includes http tests for the route /v1/admin/quiz/{quizid}/question
// NEED TO CONVERT ALL TOKENS TO TOKEN.SESSIONID

import { requestDelete, requestGet, requestPost } from '../helper-files/requestHelper';
import { QuizQuestionAnswers } from '../quiz';

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/amdin/quiz/{quizid}/question', () => {
  const error = { error: expect.any(String) };
  let quizId: number;
  let token: string;
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: string, name: string, description: string };
  let answerBody: { answer: string, correct: boolean }[];
  let questionBody: { question: string, duration: number, points: number, answers: QuizQuestionAnswers[] };

  describe('Testing successful cases (status code 200)', () => {
    let event: { quizId: number };
    beforeEach(() => {
      // register a user to create a quiz
      userBody = { email: 'valid@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerUser = requestPost(userBody, '/v1/admin/auth/register');
      token = registerUser.retval.token;
      
      // create the quiz
      quizBody = { token: token, name: 'Valid Quiz Name', description: 'A valid quiz description' };
      const res = requestPost(quizBody, '/v1/admin/quiz');
      event = res.retval;
    });

    test('Has correct return type', () => {
      // create question
      const answerBody1 = { answer: 'Prince Charles', correct: true };
      const answerBody2 = { answer: 'Prince William', correct: false };
      questionBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: [answerBody1, answerBody2] };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${event.quizId}/question`)).toStrictEqual({
        retval: { questionId: expect.any(Number) },
        statusCode: 200
      });
    });

    test.skip('Side effect - Successful listing of information about a quiz with one question', () => {
      // create question
      const answerBody1 = { answer: 'Prince Charles', correct: true };
      const answerBody2 = { answer: 'Prince William', correct: false };
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: [answerBody1, answerBody2] };
      const res = requestPost({ token: token, questionBody: questionCreateBody }, `/v1/admin/quiz/${event.quizId}/question`);

      // use GET /v1/admin/quiz/{quizid}
      expect(requestGet({ token: token }, `/v1/admin/quiz/${event.quizId}`)).toStrictEqual({
        retval: {
          quizId: event.quizId,
          name: quizBody.name,
          timeCreated: expect.any(Number),
          timeLastEditied: expect.any(Number),
          description: quizBody.description,
          numQuestions: 1,
          questions: [
            {
              questionId: res.retval,
              question: questionCreateBody.question,
              duration: questionCreateBody.duration,
              points: questionCreateBody.points,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: answerBody1.answer,
                  colour: expect.any(String),
                  correct: answerBody1.correct
                },
                {
                  answerId: expect.any(Number),
                  answer: answerBody2.answer,
                  colour: expect.any(String),
                  correct: answerBody2.correct
                }
              ]
            }
          ],
          duration: expect.any(Number)
        },
        statusCode: 200
      });
    });

    test.skip('Side effect - Successful listing of information about a quiz with multiple questions', () => {
      // create question
      const answerBody = [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince William', correct: false }];
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody };
      const res = requestPost({ token: token, questionBody: questionCreateBody }, `/v1/admin/quiz/${event.quizId}/question`);

      // create second question
      const answerBody2 = [{ answer: 'Chappell Roan', correct: true }, { answer: 'Sabrina Carpenter', correct: false }];
      const questionCreateBody2 = { question: 'Who is your favourite artist\'s favourite artist?', duration: 5, points: 7, answers: answerBody2 };
      const res2 = requestPost({ token: token, questionBody: questionCreateBody2 }, `/v1/admin/quiz/${event.quizId}/question`);

      // use GET /v1/admin/quiz/{quizid}
      expect(requestGet({ token: token }, `/v1/admin/quiz/${event.quizId}`)).toStrictEqual({
        retval: {
          quizId: event.quizId,
          name: quizBody.name,
          timeCreated: expect.any(Number),
          timeLastEditied: expect.any(Number),
          description: quizBody.description,
          numQuestions: 2,
          questions: [
            {
              questionId: res.retval,
              question: questionCreateBody.question,
              duration: questionCreateBody.duration,
              points: questionCreateBody.points,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: answerBody[0].answer,
                  colour: expect.any(String),
                  correct: answerBody[0].correct
                },
                {
                  answerId: expect.any(Number),
                  answer: answerBody[1].answer,
                  colour: expect.any(String),
                  correct: answerBody[1].correct
                }
              ]
            },
            {
              questionId: res2.retval,
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
            }
          ],
          duration: expect.any(Number)
        },
        statusCode: 200
      });
    });
  });

  describe('Testing errors in questionBody (status code 400)', () => {
    let quizId: number;
    beforeEach(() => {
      // register a user to create a quiz
      userBody = { email: 'valid@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerUser = requestPost(userBody, '/v1/admin/auth/register');
      token = registerUser.retval.token;

      // create the quiz
      quizBody = { token: token, name: 'Valid Quiz Name', description: 'A valid quiz description' };
      const resQuizCreate = requestPost(quizBody, '/v1/admin/quiz');
      quizId = resQuizCreate.retval.quizId;
    });

    test('The question string is less than 5 characters in length', () => {
      answerBody = [{ answer: 'valid', correct: true }, { answer: 'also valid', correct: false }];
      questionBody = { question: 'bad', duration: 5, points: 3, answers: answerBody };

      expect(requestPost({token: token, questionBody: questionBody}, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The question string is greater than 50 characters in length', () => {
      answerBody = [{ answer: 'valid', correct: true }, { answer: 'also valid', correct: false }];
      questionBody = { question: 'this string is longer it totes will cause an error?', duration: 5, points: 3, answers: answerBody };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The question has more than 6 answers', () => {
      const answerBody1 = { answer: '1st valid answer', correct: true };
      const answerBody2 = { answer: '2nd valid string', correct: false };
      const answerBody3 = { answer: '3rd valid answer', correct: true };
      const answerBody4 = { answer: '4th valid answer string', correct: true };
      const answerBody5 = { answer: '5th valid answer', correct: true };
      const answerBody6 = { answer: '6th valid answer string', correct: true };
      const answerBody7 = { answer: '7th valid string', correct: false };

      questionBody = { question: 'a valid question', duration: 15, points: 9, answers: [answerBody1, answerBody2, answerBody3, answerBody4, answerBody5, answerBody6, answerBody7] };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The question has less than 2 answers', () => {
      const answerBody1 = { answer: '1st valid answer', correct: true };

      questionBody = { question: 'a valid question', duration: 8, points: 6, answers: [answerBody1] };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The question duration is not a positive number', () => {
      answerBody = [{ answer: 'valid', correct: true }, { answer: 'also valid', correct: false }];
      questionBody = { question: 'this is a valid quesetion', duration: -1, points: 3, answers: answerBody };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The sum of the question durations in the quiz exceeds 3 minutes', () => {
      const answerBody1 = [{ answer: 'Garfield', correct: true }, { answer: 'Tom', correct: false }];
      const questionBody1 = { question: 'Famous cat that loves lasagna', duration: 36, points: 9, answers: answerBody1 };
      requestPost({ token: token, questionBody: questionBody1 }, `/v1/admin/quiz/${quizId}/question`);

      const answerBody2 = [{ answer: 'King Charles', correct: true }, { answer: 'Prince William', correct: false }];
      const questionBody2 = { question: 'Who is the Monarch of England in 2024', duration: 36, points: 3, answers: answerBody2 };
      requestPost({ token: token, questionBody: questionBody2 }, `/v1/admin/quiz/${quizId}/question`);

      const answerBody3 = [{ answer: 'COMP1531', correct: true }, { answer: 'COMP1511', correct: false }];
      const questionBody3 = { question: 'What is the best comp course at UNSW?', duration: 36, points: 5, answers: answerBody3 };
      requestPost({ token: token, questionBody: questionBody3 }, `/v1/admin/quiz/${quizId}/question`);

      const answerBody4 = [{ answer: 'Google', correct: true }, { answer: 'FireFox', correct: false }];
      const questionBody4 = { question: 'Which which is the most popular search engine', duration: 36, points: 8, answers: answerBody4 };
      requestPost({ token: token, questionBody: questionBody4 }, `/v1/admin/quiz/${quizId}/question`);

      const answerBody5 = [{ answer: 'a valid answer', correct: true }, { answer: 'valid answer again', correct: true }];
      const questionBody5 = { question: 'which one is valid?', duration: 37, points: 10, answers: answerBody5 };
      expect(requestPost({ token: token, questionBody: questionBody5 }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The points awarded for the question are less than 1', () => {
      answerBody = [{ answer: 'valid', correct: true }, { answer: 'also valid :)', correct: false }];
      questionBody = { question: 'a very good question?', duration: 5, points: 0, answers: answerBody };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The points awarded for the question are greater than 10', () => {
      answerBody = [{ answer: 'valid', correct: true }, { answer: 'also valid', correct: false }];
      questionBody = { question: 'bad', duration: 5, points: 11, answers: answerBody };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The length of any answer is less than 1 character long', () => {
      answerBody = [{ answer: '', correct: true }, { answer: 'a valid ans', correct: true }];
      questionBody = { question: 'a good question', duration: 5, points: 2, answers: answerBody };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('The length of any answer is greater than 30 characters long', () => {
      const answerBody1 = { answer: 'valid', correct: true };
      const answerBody2 = { answer: 'a very very not valid answer string', correct: false };
      questionBody = { question: 'valid question indeed', duration: 5, points: 7, answers: [answerBody1, answerBody2] };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('Any answer strings are duplicates of one another (within the same question)', () => {
      const answerBody1 = { answer: 'correct ans', correct: true };
      const answerBody2 = { answer: 'not the same', correct: false };
      const answerBody3 = { answer: 'correct ans', correct: false };
      questionBody = { question: 'which is the correct answer?', duration: 5, points: 4, answers: [answerBody1, answerBody2, answerBody3] };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });

    test('There are no correct answers', () => {
      const answerBody1 = { answer: 'valid', correct: false };
      const answerBody2 = { answer: 'another valid ans', correct: false };
      const answerBody3 = { answer: 'also valid ans', correct: false };
      questionBody = { question: 'bad', duration: 2, points: 9, answers: [answerBody1, answerBody2, answerBody3] };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 400
      });
    });
  });

  describe('Testing token errors (status code 401)', () => {
    test('Token is empty (no users are registered', () => {
      const answerBody = [{ answer: 'this is the answer', correct: true }, { answer: 'also valid', correct: false }];
      const questionBody = { question: 'A very valid question?', duration: 14, points: 6, answers: answerBody };

      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });

    test('Invalid session ID', () => {
      // register user
      userBody = { email: 'valid@gmail.com', password: 'validpa55word', nameFirst: 'John', nameLast: 'Smith' };
      const registerUser = requestPost(userBody, '/v1/admin/auth/register');
      token = registerUser.retval.token;

      // create quiz
      quizBody = { token: token, name: 'A valid quiz name', description: 'Valid quiz description' };
      const res = requestPost(quizBody, '/v1/admin/quiz');

      // make userId invalid
      const sessionId = parseInt(token) + 1;

      // create question
      const answerBody = [{ answer: 'Prince Charles', correct: true }, { answer: 'Me', correct: false }];
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: answerBody };

      expect(requestPost({ token: sessionId.toString(), questionBody: questionCreateBody }, `/v1/admin/quiz/${res.retval.quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });
  });

  describe('Testing quiz owner and quiz existence errors (status code 403)', () => {
    test('The user is not an owner of the quiz with the given quizid', () => {
      // register two users to create a quiz
      userBody = { email: 'valid@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerUser1 = requestPost(userBody, '/v1/admin/auth/register');
      const token1 = registerUser1.retval.token;

      const userBody2 = { email: 'email@gmail.com', password: 'Password123', nameFirst: 'John', nameLast: 'Smith' };
      const registerUser2 = requestPost(userBody2, '/v1/admin/auth/register');
      const token2 = registerUser2.retval.token;

      // create a quiz for first user
      quizBody = { token: token1, name: 'Valid Quiz Name', description: 'A valid quiz description' };
      const createQuiz = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = createQuiz.retval.quizId;

      // user 2 tries to add question to user 1's quiz
      answerBody = [{ answer: 'Oak', correct: true }, { answer: 'Birch', correct: false }];
      questionBody = { question: 'What is the best kind of tree?', duration: 7, points: 5, answers: answerBody };

      expect(requestPost({ token: token2, questionBody: questionBody }, `/v1/admin/quiz/${quizId}/question`)).toStrictEqual({
        retval: error,
        statusCode: 403
      });
    });

    test('The quiz does not exist', () => {
      // register a user to create a quiz
      userBody = { email: 'valid@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
      const registerUser = requestPost(userBody, '/v1/admin/auth/register');
      token = registerUser.retval.token;

      // create a quiz
      quizBody = { token: token, name: 'Valid Quiz Name', description: 'A valid quiz description' };
      const res = requestPost(quizBody, '/v1/admin/quiz');
      const quizId = res.retval.quizId;

      // creating a question for a quiz that does not exist
      answerBody = [{ answer: 'cats are the best!', correct: true }, { answer: 'birds are cool too', correct: false }];
      questionBody = { question: 'which animal is the best?', duration: 16, points: 10, answers: answerBody };
      expect(requestPost({ token: token, questionBody: questionBody }, `/v1/admin/quiz/${quizId + 1}/question`)).toStrictEqual({
        retval: error,
        statusCode: 403
      });
    });
  });
});
