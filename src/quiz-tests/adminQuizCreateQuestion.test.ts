// includes http tests for the route /v1/admin/quiz/{quizid}/question

import { Tokens, Quizzes } from "../dataStore";
import { requestDelete, requestPost } from "../helper-files/requestHelper";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/amdin/quiz/{quizid}/question', () => {
  const error = { error: expect.any(String) };
  let userBody: { email: string, password: string, nameFirst: string, nameLast: string };
  let quizBody: { token: Tokens, name: string, description: string };
  let questionBody: { question: string, duration: number, points: number, answers: []}
  let token: { sessionId: number, authUserId: number };
  
  describe('Testing successful cases (status code 200)', () => {
    beforeEach(() => {
      // register a user to create a quiz
      userBody = { email: 'valid@gmail.com', password: 'ValidPass123', nameFirst: 'Jane', nameLast: 'Doe' };
      const { retval } = requestPost(userBody, '/v1/admin/auth/register');
      token = retval as { sessionId: number, authUserId: number };
      
      // create the quiz
      quizBody = { token: token, name: 'Valid Quiz Name', description: 'A valid quiz description' };
      const res = requestPost(quizBody, '/v1/admin/quiz');

      // create a quiz question
      
    });
    
    test.todo('Has correct return type');

    test.todo('Side effect - Successful listing of information about a quiz');
    // use /v1/admin/quiz/{quizid}
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
    test.todo('Token is empty (no users are registered');

    test.todo('Invalid user ID');

    test.todo('Invalid session ID');
  });

  describe('Testing quiz owner and quiz existence errors (status code 403)', () => {
    test.todo('The user is not an owner of the quiz with the given quizid');

    test.todo('The quiz does not exist');
  });
});