// includes http tests for the route /v1/admin/quiz/{quizid}/question

import { Tokens } from "../dataStore";
import { requestDelete, requestPost } from "../helper-files/requestHelper";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('POST /v1/amdin/quiz/{quizid}/question', () => {
  const error = { error: expect.any(String) };
  
  describe('Testing successful cases (status code 200)', () => {
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