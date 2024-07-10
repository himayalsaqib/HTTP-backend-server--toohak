// includes http tests for the route /v1/admin/quiz/{quizid}/transfer

import { requestPost, requestDelete, requestGet } from "../helper-files/requestHelper";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
})

describe('POST /v1/admin/quiz/{quizid}/transfer', () => {
  const error = { error: expect.any(String) };
  let token: string;
  let quizBody: { token: string, name: string, description: string };
  let quizId: number;

  describe('Testing successful cases (status code 200)', () => {
    beforeEach(() => {
    
    });  
    
    test.todo('Has the correct return type');

    test.todo('Side effect: the quiz is no longer listed for that user and is listed to the other user');
  });

  describe('Testing userEmail and quiz name errors (status code 400)', () => {
    beforeEach(() => {
    
    });
  
    test.todo('userEmail is not a real user');

    test.todo('userEmail is the current logged in user');

    test.todo('Quiz Id refers to a quiz that has a name that is already used by the target user');
  });

  describe('Testing token errors (status code 401)', () => {
    test.todo('Token is empty (no users registered)');

    test.todo('Session ID is invalid');
  });

  describe('Testing quiz ID errors (status code 403)', () => {
    beforeEach(() => {
    
    });
  
    test.todo('User is not an owner of this quiz');

    test.todo('The quiz does not exist');
  });
});