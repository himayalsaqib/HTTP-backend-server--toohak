// includes http tests for the route /v1/admin/quiz/{quizid}/session/{sessionid}/results

import { requestGet, requestDelete, requestPost, requestPut } from "../helper-files/requestHelper";

beforeEach(() => {
  requestDelete({}, '/v1/clear');
});

describe('GET /v1/admin/quiz/{quizid}/session/{sessionid}/results', () => {
  describe('Testing successful cases (status code 200)', () => {
    test.todo('Has the correct return type');
  });

  describe('Testing errors in sessionId and quiz session state (status code 400)', () => {
    test.todo('The session Id does not refer to a valid session within this quiz');

    test.todo('The session is not in FINAL_RESULTS state');
  });

  describe('Testing token errors (status code 401)', () => {
    test.todo('The token is empty (no users are registered)');

    test.todo('The token is invalid (does not refer to a valid logged in user)');
  });

  describe('Testing quiz ownership and quiz existence errors (status code 403)', () => {
    test.todo('The user is not an owner of this quiz');

    test.todo('The quiz does not exist');
  });
});
