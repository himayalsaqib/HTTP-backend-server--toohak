// inlcudes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}

import { before } from "node:test";
import { requestPut, requestDelete, requestPost, requestGet } from "../helper-files/requestHelper";
import { adminQuizDescriptionUpdate, QuizSessionAction } from "../quiz";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
})

const ERROR = { error: expect.any(String) };

describe('PUT /v1/admin/quiz/{quizid}/session/{sessionid}', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  let updateActionBody: { action: QuizSessionAction };

  beforeEach(() => {
    // register user
  });

  describe('Testing successful quiz session state update (status code 200)', () => {

  });

  describe('Testing session ID and action enum errors (status code 400)', () => {
    test.todo('The session ID does not refer to a valid session within the quiz');

    test.todo('The action provided is not a valid Action enum');

    test.todo('The Action enum cannot be applied in the current state');
  });

  describe('Testing token errors (status 401)', () => {

  });

  describe('Testing quiz ownership and quiz existence errors (status code 403)', () => {
    
  });
});