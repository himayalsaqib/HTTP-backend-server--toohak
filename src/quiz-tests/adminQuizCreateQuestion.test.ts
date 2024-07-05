// includes http tests for the route /v1/admin/quiz/{quizid}/question

import { Tokens, Quizzes } from "../dataStore";
import { requestDelete, requestGet, requestPost } from "../helper-files/requestHelper";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/amdin/quiz/{quizid}/question', () => {
  const error = { error: expect.any(String) };
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: Tokens, name: string, description: string };
  let answerBody: { answer: string, correct: boolean };
  let questionBody: { question: string, duration: number, points: number, answers: []}
  let token: { sessionId: number, authUserId: number };
  
  describe('Testing successful cases (status code 200)', () => {
    let event: { quizId: number };
    beforeEach(() => {
      // register a user to create a quiz
      userBody = { email: 'valid@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(userBody, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
      
      // create the quiz
      quizBody = { token: token, name: 'Valid Quiz Name', description: 'A valid quiz description' };
      const res = requestPost(quizBody, '/v1/admin/quiz');
      event = JSON.parse(res.retval.toString());
    });
    
    test('Has correct return type', () => {
      // create question
      const answerBody = { answer: 'Prince Charles', correct: true };
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: [answerBody] };

      expect(requestPost(questionCreateBody , `/v1/admin/quiz/${event.quizId}/question`)).toStrictEqual({
        retval: { questionId: expect.any(Number) },
        statusCode: 200
      });
    });

    test('Side effect - Successful listing of information about a quiz with one question', () => {
      // create question
      const answerBody = { answer: 'Prince Charles', correct: true };
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: [answerBody] };
      const res = requestPost(questionCreateBody , `/v1/admin/quiz/${event.quizId}/question`);
      
      // use GET /v1/admin/quiz/{quizid}
      expect(requestGet({ token: token },`/v1/admin/quiz/${event.quizId}`)).toStrictEqual({
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
                  answer: answerBody.answer,
                  correct: answerBody.correct
                }
              ]
            }
          ],
          duration: expect.any(Number)
        },
        statusCode: 200
      });
    });

    test.todo('Side effect - Successful listing of information a quiz with multiple questions');
  });

  describe('Testing errors in questionBody (status code 400)', () => {
    test.todo('The question string is less than 5 characters in length or greater than 50 characters in length');

    test.todo('The question has more than 6 answers or less than 2 answers');

    test.todo('The sum of the question durations in the quiz exceeds 3 minutes');

    test.todo('The points awarded for the question are less than 1 or greater than 10');

    test.todo('The length of any answer is less than 1 character long or greater than 30 characters long');

    test.todo('Any answer strings are duplicates of one another (within the same question)');

    test.todo('There are no correct answers');
  });

  describe('Testing token errors (status code 401)', () => {
    test('Token is empty (no users are registered', () => {
      expect(requestPost(quizBody, '/v1/admin/quiz')).toStrictEqual({
        retval: error, 
        statusCode: 401
      });
    });

    // beforeEach(() => {
    //   userBody = { email: 'valid@gmail.com', password: 'validpa55word', nameFirst: 'John', nameLast: 'Smith' };
    //   const { retval } = requestPost(userBody, '/v1/admin/auth/register');
    //   token = retval as { sessionId: number, authUserId: number };

    //   quizBody = { token: token, name: 'A valid quiz name', description: 'Valid quiz description' };
    //   const res = requestPost(quizBody, '/v1/admin/quiz');
    // });

    test('Invalid user ID', () => {
      // register user
      userBody = { email: 'valid@gmail.com', password: 'validpa55word', nameFirst: 'John', nameLast: 'Smith' };
      const { retval } = requestPost(userBody, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };

      // create quiz
      quizBody = { token: token, name: 'A valid quiz name', description: 'Valid quiz description' };
      const res = requestPost(quizBody, '/v1/admin/quiz');

      // make userId invalid
      token.authUserId += 1;

      // create question
      const answerBody = { answer: 'Prince Charles', correct: true };
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: [answerBody] };

      expect(requestPost(questionCreateBody , `/v1/admin/quiz/${res.retval}/question`)).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });

    test('Invalid session ID', () => {
      // register user
      userBody = { email: 'valid@gmail.com', password: 'validpa55word', nameFirst: 'John', nameLast: 'Smith' };
      const { retval } = requestPost(userBody, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };

      // create quiz
      quizBody = { token: token, name: 'A valid quiz name', description: 'Valid quiz description' };
      const res = requestPost(quizBody, '/v1/admin/quiz');

      // make userId invalid
      token.sessionId += 1;

      // create question
      const answerBody = { answer: 'Prince Charles', correct: true };
      const questionCreateBody = { question: 'Who is the Monarch of England?', duration: 4, points: 5, answers: [answerBody] };

      expect(requestPost(questionCreateBody , `/v1/admin/quiz/${res.retval}/question`)).toStrictEqual({
        retval: error,
        statusCode: 401
      });
    });
  });

  describe('Testing quiz owner and quiz existence errors (status code 403)', () => {
    test.todo('The user is not an owner of the quiz with the given quizid');

    test.todo('The quiz does not exist');
  });
});